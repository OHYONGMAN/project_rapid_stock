import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '@/app/utils/supabase';

// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPANY_INFO_PATH = path.join(__dirname, 'companyInfo.json');

// 타입 정의
interface NewsArticle {
  image: string;
  title: string;
  summary: string;
  link: string;
  date: string;
  keyword: string[];
  relatedCompanies?: { name: string; code: string }[];
}

interface CompanyInfo {
  companyName: string;
  companyCode: string;
}

// HTTP 요청 헤더 설정
const axiosConfig = {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  },
};

// API 호출로 관련 키워드 추출 함수
const apiPost = async (summary: string): Promise<string[]> => {
  const data = [
    {
      role: 'system',
      content: `
        해당 대화의 응답은 json형태로 return이 됩니다.
        주식관련된 뉴스기사를 주면 핵심 키워드를 보고
        그 기사와 관련된 상장된 주식회사를 찾아서 그 회사명과 종목코드를 가져온다.
      `,
    },
    {
      role: 'user',
      content:
        '‘단군 이래 최대 재건축사업’으로 유명세를 탔던 서울 강동구 소재 둔촌주공아파트 재건축이 ‘올림픽파크 포레온’으로 옷을 갈아입고 드디어 11월 입주를 앞두고 있다.',
    },
    {
      role: 'system',
      content: `{
        "keyword": ["현대건설", "GS건설", "대림산업", "대우건설", "포스코건설"]
      }`,
    },
  ];

  data.push({
    role: 'user',
    content: summary,
  });

  const url = `https://open-api.jejucodingcamp.workers.dev/`;

  try {
    const result = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      redirect: 'follow',
    });

    if (!result.ok) {
      console.error('API 요청 실패:', result.statusText);
      return [];
    }

    const resJson = await result.json();
    const keywordContent =
      resJson.choices &&
      resJson.choices[0] &&
      resJson.choices[0].message &&
      resJson.choices[0].message.content;

    if (!keywordContent) {
      console.error('API 응답에 content가 없습니다.');
      return [];
    }

    let parsed;
    try {
      parsed = JSON.parse(keywordContent);
    } catch (parseError) {
      console.error('API 응답 JSON 파싱 오류:', parseError);
      return [];
    }

    const keyword: string[] = parsed.keyword;

    if (!Array.isArray(keyword)) {
      console.error('추출된 키워드가 배열이 아닙니다:', keyword);
      return [];
    }

    return keyword;
  } catch (error) {
    console.error('API 호출 중 오류 발생:', error);
    return [];
  }
};

// 뉴스 크롤링 함수
async function fetchNews(): Promise<NewsArticle[]> {
  try {
    const url = `https://finance.naver.com/news/news_list.naver?mode=LSS2D&section_id=101&section_id2=258&_=${new Date().getTime()}`;
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      ...axiosConfig,
    });

    const decodedData = iconv.decode(response.data, 'euc-kr');
    const $ = cheerio.load(decodedData);

    const newsList: NewsArticle[] = [];

    $('dl > dt.thumb').each((index, element) => {
      const imageUrl = $(element).find('img').attr('src') || '';
      const titleElement = $(element).next('dd.articleSubject').find('a');
      const title = titleElement.attr('title') || '';
      const link = titleElement.attr('href') || '';
      const date =
        $(element)
          .next('dd.articleSubject')
          .next('dd.articleSummary')
          .find('span.wdate')
          .text() || '';

      const officeIdMatch = link.match(/office_id=([0-9]+)/);
      const articleIdMatch = link.match(/article_id=([0-9]+)/);

      if (!officeIdMatch || !articleIdMatch) {
        console.error(
          '링크에서 office_id 또는 article_id를 추출할 수 없습니다: ',
          link,
        );
        return;
      }

      const officeId = officeIdMatch[1];
      const articleId = articleIdMatch[1];
      const cleanLink = `https://n.news.naver.com/mnews/article/${officeId}/${articleId}`;

      const summaryElement = $(element)
        .next('dd.articleSubject')
        .next('dd.articleSummary');
      let summary = summaryElement.text().trim() || '';
      summary = summary
        .replace(/[\n\t]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (imageUrl && title && summary && cleanLink && date) {
        newsList.push({
          image: imageUrl,
          title: title,
          summary: summary,
          link: cleanLink,
          date: date,
          keyword: [],
          relatedCompanies: [],
        });
      }

      if (newsList.length >= 30) {
        return false;
      }
    });

    return newsList;
  } catch (error) {
    console.error('뉴스 크롤링 중 오류 발생:', error);
    return [];
  }
}

// Supabase에 데이터를 저장하는 함수 (중복 체크 및 upsert 추가)
async function saveToSupabase(newsData: NewsArticle[]): Promise<void> {
  try {
    // 뉴스 기사 제목과 링크를 기준으로 중복 체크
    const titles = newsData.map((article) => article.title);
    const links = newsData.map((article) => article.link);

    // Supabase에서 동일한 제목과 링크가 있는 기사를 가져옴
    const { data: existingNews, error: fetchError } = await supabase
      .from('news')
      .select('title, link')
      .or(`title.in.(${titles.join(',')}),link.in.(${links.join(',')})`);

    if (fetchError) {
      console.error(
        'Supabase에서 기존 데이터를 가져오는 중 오류 발생:',
        fetchError.message,
      );
      return;
    }

    // 이미 존재하는 제목과 링크의 기사를 필터링
    const existingTitleLinkSet = new Set(
      existingNews.map(
        (news: { title: string; link: string }) => `${news.title}|${news.link}`,
      ),
    );

    // 중복되지 않은 새로운 기사를 필터링
    const newArticles = newsData.filter(
      (article) =>
        !existingTitleLinkSet.has(`${article.title}|${article.link}`),
    );

    if (newArticles.length === 0) {
      console.log('중복된 데이터가 있어 새로 저장할 데이터가 없습니다.');
      return;
    }

    // 중복되지 않은 데이터를 Supabase에 저장
    const { data, error } = await supabase.from('news').upsert(
      newArticles.map((article) => ({
        image: article.image,
        title: article.title,
        summary: article.summary,
        link: article.link,
        date: article.date,
        keyword: article.keyword,
        relatedCompanies: article.relatedCompanies
          ? article.relatedCompanies
          : [],
      })),
    ); // 제목과 링크 중복시 추가되지 않도록 설정

    if (error) {
      console.error('Supabase 저장 중 오류 발생:', error.message);
    } else {
      console.log(
        'Supabase에 중복되지 않은 데이터가 성공적으로 저장되었습니다.',
      );
    }
  } catch (error) {
    console.error('Supabase에 데이터를 저장하는 중 오류 발생:', error);
  }
}

// 날짜 파싱 함수
function parseDate(dateString: string): number {
  // 날짜 문자열에서 숫자만 추출 (예: '2023.10.15 14:30' -> '202310151430')
  const numericDate = dateString.replace(/\D/g, '');
  return parseInt(numericDate, 10);
}

// 메인 함수
export default async function main(): Promise<void> {
  console.log('뉴스 데이터 수집 시작:', new Date());

  try {
    // 새로운 뉴스 데이터 가져오기
    const newData = await fetchNews();

    // 키워드 추출
    const keywordsArray = await Promise.all(
      newData.map(async (data) => {
        const keywords = await apiPost(data.summary);
        return Array.isArray(keywords) ? keywords : [];
      }),
    );

    newData.forEach((data, index) => {
      data.keyword = keywordsArray[index];
    });

    // companyInfo.json 파일에서 회사명과 종목코드 가져오기
    const companyMap: { [key: string]: string } = {};
    try {
      const companyInfo = fs.readFileSync(COMPANY_INFO_PATH, 'utf-8');
      const companyData: CompanyInfo[] = JSON.parse(companyInfo);

      // 회사명과 종목코드를 매핑
      companyData.forEach((company) => {
        const companyName = company.companyName;
        const companyCode = company.companyCode;

        if (companyName && companyCode) {
          companyMap[companyName.trim()] = companyCode;
        }
      });
    } catch (error) {
      console.error('companyInfo.json 파일 읽기 중 오류 발생:', error);
    }

    // 각 뉴스 기사에 대해 매칭되는 회사 찾기
    newData.forEach((article) => {
      if (Array.isArray(article.keyword) && article.keyword.length > 0) {
        article.keyword.forEach((keyword) => {
          if (typeof keyword === 'string') {
            const trimmedKeyword = keyword.trim();
            if (companyMap[trimmedKeyword]) {
              article.relatedCompanies?.push({
                name: trimmedKeyword,
                code: companyMap[trimmedKeyword],
              });
            }
          } else {
            console.warn('keyword가 문자열이 아닙니다:', keyword);
          }
        });
      }

      if (article.relatedCompanies && article.relatedCompanies.length === 0) {
        delete article.relatedCompanies;
      }
    });

    const combinedData = newData.filter(
      (article) =>
        article.relatedCompanies && article.relatedCompanies.length > 0,
    );

    // 날짜 기준으로 정렬 (최신 뉴스가 상단에 오도록)
    combinedData.sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return dateB - dateA; // 내림차순 정렬
    });

    // Supabase에 데이터 저장
    await saveToSupabase(combinedData);

    console.log('뉴스 데이터가 성공적으로 갱신되었습니다.', new Date());
  } catch (error) {
    console.error('메인 함수 실행 중 오류 발생:', error);
  }

  console.log('다음 수집까지 대기 중...');
  setTimeout(main, 180000); // 300,000ms = 5분
}

// 첫 실행
main();
