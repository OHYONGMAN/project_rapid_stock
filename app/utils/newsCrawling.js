/* 
1. 외부에 package.json을 배치하고, 필요한 패키지를 설치합니다.
2. 이 파일 실행은 node index.js로 실행합니다. 
3. 이 파일의 setInterval함수를 찾아 시간 조정을 해줍니다.
4. news_data.json :        네이버 금융 뉴스를 크롤링하여 데이터를 가져오고, 그 데이터를 외부에  json 파일로 저장합니다.
5. matching_results.json : 최종 기사와 매칭되는 회사명과 종목코드를 찾아냅니다.

setInterval(main, 180000) : 5분에 한번 실행함! 너무 자주하면 네이버에서 차단되니 주의요함!!!
apiPost() : 함수를 이용하여 뉴스 요약을 보내고, 그 결과를 받아서 관련 키워드를 추출합니다.
fetchNews() : 함수를 이용하여 네이버 금융 뉴스를 크롤링하여 데이터를 가져옵니다.
saveData() : 함수를 이용하여 외부에 JSON 파일에 데이터를 저장합니다.
main() : 함수를 이용하여 새로운 뉴스 데이터를 가져오고, 그 데이터를 저장합니다.
<<<<<<< HEAD
Code() : 함수를 이용하여 엑셀 파일에서 회사명과 종목코드를 가져와서, 뉴스 데이터의 키워드를 이용하여 종목코드를 찾아냅니다.
=======
>>>>>>> newsCrawling
*/

const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const COMBINED_FILE_PATH = path.join(__dirname, 'combined_news_data.json');

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

// 뉴스를 바탕으로 관련 키워드 추출
const apiPost = async (summary) => {
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

    const keyword = parsed.keyword;

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

// 크롤링하여 뉴스 데이터 가져오기
async function fetchNews() {
  try {
    // URL에 타임스탬프 추가하여 새로운 요청으로 인식되도록 함
    const url = `https://finance.naver.com/news/news_list.naver?mode=LSS2D&section_id=101&section_id2=258&_=${new Date().getTime()}`;
    const response = await axios.get(url, {
      responseType: 'arraybuffer', // 바이너리 형식으로 데이터를 받음
      ...axiosConfig, // 헤더 추가
    });

    const decodedData = iconv.decode(response.data, 'euc-kr');
    const $ = cheerio.load(decodedData);

    let newsList = [];

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

      // 링크에서 office_id와 article_id 추출
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

      // 링크를 https://n.news.naver.com/mnews/article/{office_id}/{article_id} 형식으로 변환
      const cleanLink = `https://n.news.naver.com/mnews/article/${officeId}/${articleId}`;

      const summaryElement = $(element)
        .next('dd.articleSubject')
        .next('dd.articleSummary');
      let summary = summaryElement.text().trim() || '';

      // 공백 및 불필요한 줄바꿈 제거
      summary = summary
        .replace(/[\n\t]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (imageUrl && title && summary && cleanLink && date) {
        newsList.push({
          id: index + 1, // id 값을 index로 설정
          image: imageUrl,
          title: title,
          summary: summary,
          link: cleanLink, // 재구성된 링크 추가
          date: date,
          keyword: [], // 기본값으로 빈 배열 할당
          relatedCompanies: [], // 기본값으로 빈 배열 할당
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

// JSON 파일 저장 함수
function saveData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// 메인 함수
async function main() {
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

    // 엑셀 파일에서 회사명과 종목코드 가져오기
    let companyMap = {};
    try {
      const workbook = XLSX.readFile('companyInfo.xlsx');
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // 회사명과 종목코드를 매핑
      const companyData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      companyData.forEach((row) => {
        const companyName = row[0];
        const companyCode = row[1];
        if (companyName && companyCode) {
          companyMap[companyName.trim()] = companyCode;
        }
      });
    } catch (error) {
      console.error('엑셀 파일 읽기 중 오류 발생:', error);
    }

    // 각 뉴스 기사에 대해 매칭되는 회사 찾기
    newData.forEach((article) => {
      if (Array.isArray(article.keyword) && article.keyword.length > 0) {
        article.keyword.forEach((keyword) => {
          if (typeof keyword === 'string') {
            const trimmedKeyword = keyword.trim();
            if (companyMap[trimmedKeyword]) {
              article.relatedCompanies.push({
                name: trimmedKeyword,
                code: companyMap[trimmedKeyword],
              });
            }
          } else {
            console.warn('keyword가 문자열이 아닙니다:', keyword);
          }
        });
      }

      // relatedCompanies가 비어있지 않다면 유지, 비어있다면 제거
      if (article.relatedCompanies.length === 0) {
        delete article.relatedCompanies;
      }
    });

    // combined_news_data.json 생성 (relatedCompanies가 있는 기사만 포함)
    const combinedData = newData.filter(
      (article) =>
        article.relatedCompanies && article.relatedCompanies.length > 0,
    );

    // combined_news_data.json으로 저장
    saveData(COMBINED_FILE_PATH, combinedData);

    console.log('뉴스 데이터가 성공적으로 갱신되었습니다.', new Date());
  } catch (error) {
    console.error('메인 함수 실행 중 오류 발생:', error);
  }

  console.log('다음 수집까지 대기 중...');
  // 다음 실행을 위한 setTimeout 설정 (5분 후)
  setTimeout(main, 180000); // 180,000ms = 3분
}

// 첫 실행
main();
