'use client';

import config from 'devextreme/core/config';
import { licenseKey } from '../devextreme-license';

config({ licenseKey });

import React from 'react';
import DataGrid from 'devextreme-react/data-grid';
import CustomStore from 'devextreme/data/custom_store';

// 예시 데이터
/* const articles = [

  {
    id: 1,
    title: '[글로벌 핫스톡] 美 인구구조 변화…부동산-헬스케어 등 주목',
    description:
      '전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096548_001_20241003183512388.jpg?type=w647', // 이미지 경로
    link: 'https://naver.com',
    date: '2024-10-03 17:52',
    relatedCompanies: [
      { name: 'Company A', link: 'https://naver.com' },
      { name: 'Company B', link: 'https://google.com' },
    ],
  },
  {
    id: 2,
    title: "엠풍정밀 매수가 올린 MBK 고려하면 끝없는 '쩐의 전쟁'",
    description:
      'MBK파트너스-엠풍정밀이 공개매수 가격을 기준...인구전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...',
    image: '', // 이미지가 없는 경우
    link: 'https://google.com',
    date: '2024-10-03 17:50',
    relatedCompanies: [
      { name: 'Company C', link: 'https://example.com/companyC' },
    ],
  },
  {
    id: 3,
    title: '금리 인하도 무색…상장사 41%, 영업익 눈높이 낮췄다',
    description:
      '미국 통화당국의 금리 인하에도 불구하고...전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096520_001_20241003163014736.jpg?type=w647',
    link: 'https://example.com/article3',
    date: '2024-10-03 17:49',
    relatedCompanies: [],
  },
  {
    id: 1,
    title: '[글로벌 핫스톡] 美 인구구조 변화…부동산-헬스케어 등 주목',
    description:
      '전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096548_001_20241003183512388.jpg?type=w647', // 이미지 경로
    link: 'https://example.com/article1',
    date: '2024-10-03 17:52',
    relatedCompanies: [
      { name: 'Company A', link: 'https://example.com/companyA' },
      { name: 'Company B', link: 'https://example.com/companyB' },
    ],
  },
  {
    id: 2,
    title: "엠풍정밀 매수가 올린 MBK 고려하면 끝없는 '쩐의 전쟁'",
    description: 'MBK파트너스-엠풍정밀이 공개매수 가격을 기준...',
    image: '', // 이미지가 없는 경우
    link: 'https://example.com/article2',
    date: '2024-10-03 17:50',
    relatedCompanies: [
      { name: 'Company C', link: 'https://example.com/companyC' },
    ],
  },
  {
    id: 3,
    title: '금리 인하도 무색…상장사 41%, 영업익 눈높이 낮췄다',
    description: '미국 통화당국의 금리 인하에도 불구하고...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096520_001_20241003163014736.jpg?type=w647',
    link: 'https://example.com/article3',
    date: '2024-10-03 17:49',
    relatedCompanies: [],
  },
  {
    id: 1,
    title: '[글로벌 핫스톡] 美 인구구조 변화…부동산-헬스케어 등 주목',
    description:
      '전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096548_001_20241003183512388.jpg?type=w647', // 이미지 경로
    link: 'https://example.com/article1',
    date: '2024-10-03 17:52',
    relatedCompanies: [
      { name: 'Company A', link: 'https://example.com/companyA' },
      { name: 'Company B', link: 'https://example.com/companyB' },
    ],
  },
  {
    id: 2,
    title: "엠풍정밀 매수가 올린 MBK 고려하면 끝없는 '쩐의 전쟁'",
    description: 'MBK파트너스-엠풍정밀이 공개매수 가격을 기준...',
    image: '', // 이미지가 없는 경우
    link: 'https://example.com/article2',
    date: '2024-10-03 17:50',
    relatedCompanies: [
      { name: 'Company C', link: 'https://example.com/companyC' },
    ],
  },
  {
    id: 3,
    title: '금리 인하도 무색…상장사 41%, 영업익 눈높이 낮췄다',
    description: '미국 통화당국의 금리 인하에도 불구하고...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096520_001_20241003163014736.jpg?type=w647',
    link: 'https://example.com/article3',
    date: '2024-10-03 17:49',
    relatedCompanies: [],
  },
  {
    id: 1,
    title: '[글로벌 핫스톡] 美 인구구조 변화…부동산-헬스케어 등 주목',
    description:
      '전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096548_001_20241003183512388.jpg?type=w647', // 이미지 경로
    link: 'https://example.com/article1',
    date: '2024-10-03 17:52',
    relatedCompanies: [
      { name: 'Company A', link: 'https://example.com/companyA' },
      { name: 'Company B', link: 'https://example.com/companyB' },
    ],
  },
  {
    id: 2,
    title: "엠풍정밀 매수가 올린 MBK 고려하면 끝없는 '쩐의 전쟁'",
    description: 'MBK파트너스-엠풍정밀이 공개매수 가격을 기준...',
    image: '', // 이미지가 없는 경우
    link: 'https://example.com/article2',
    date: '2024-10-03 17:50',
    relatedCompanies: [
      { name: 'Company C', link: 'https://example.com/companyC' },
    ],
  },
  {
    id: 3,
    title: '금리 인하도 무색…상장사 41%, 영업익 눈높이 낮췄다',
    description: '미국 통화당국의 금리 인하에도 불구하고...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096520_001_20241003163014736.jpg?type=w647',
    link: 'https://example.com/article3',
    date: '2024-10-03 17:49',
    relatedCompanies: [],
  },
  {
    id: 1,
    title: '[글로벌 핫스톡] 美 인구구조 변화…부동산-헬스케어 등 주목',
    description:
      '전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096548_001_20241003183512388.jpg?type=w647', // 이미지 경로
    link: 'https://example.com/article1',
    date: '2024-10-03 17:52',
    relatedCompanies: [
      { name: 'Company A', link: 'https://example.com/companyA' },
      { name: 'Company B', link: 'https://example.com/companyB' },
    ],
  },
  {
    id: 2,
    title: "엠풍정밀 매수가 올린 MBK 고려하면 끝없는 '쩐의 전쟁'",
    description: 'MBK파트너스-엠풍정밀이 공개매수 가격을 기준...',
    image: '', // 이미지가 없는 경우
    link: 'https://example.com/article2',
    date: '2024-10-03 17:50',
    relatedCompanies: [
      { name: 'Company C', link: 'https://example.com/companyC' },
    ],
  },
  {
    id: 3,
    title: '금리 인하도 무색…상장사 41%, 영업익 눈높이 낮췄다',
    description: '미국 통화당국의 금리 인하에도 불구하고...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096520_001_20241003163014736.jpg?type=w647',
    link: 'https://example.com/article3',
    date: '2024-10-03 17:49',
    relatedCompanies: [],
  },
  {
    id: 1,
    title: '[글로벌 핫스톡] 美 인구구조 변화…부동산-헬스케어 등 주목',
    description:
      '전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096548_001_20241003183512388.jpg?type=w647', // 이미지 경로
    link: 'https://example.com/article1',
    date: '2024-10-03 17:52',
    relatedCompanies: [
      { name: 'Company A', link: 'https://example.com/companyA' },
      { name: 'Company B', link: 'https://example.com/companyB' },
    ],
  },
  {
    id: 2,
    title: "엠풍정밀 매수가 올린 MBK 고려하면 끝없는 '쩐의 전쟁'",
    description: 'MBK파트너스-엠풍정밀이 공개매수 가격을 기준...',
    image: '', // 이미지가 없는 경우
    link: 'https://example.com/article2',
    date: '2024-10-03 17:50',
    relatedCompanies: [
      { name: 'Company C', link: 'https://example.com/companyC' },
    ],
  },
  {
    id: 3,
    title: '금리 인하도 무색…상장사 41%, 영업익 눈높이 낮췄다',
    description: '미국 통화당국의 금리 인하에도 불구하고...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096520_001_20241003163014736.jpg?type=w647',
    link: 'https://example.com/article3',
    date: '2024-10-03 17:49',
    relatedCompanies: [],
  },
  {
    id: 1,
    title: '[글로벌 핫스톡] 美 인구구조 변화…부동산-헬스케어 등 주목',
    description:
      '전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096548_001_20241003183512388.jpg?type=w647', // 이미지 경로
    link: 'https://example.com/article1',
    date: '2024-10-03 17:52',
    relatedCompanies: [
      { name: 'Company A', link: 'https://example.com/companyA' },
      { name: 'Company B', link: 'https://example.com/companyB' },
    ],
  },
  {
    id: 2,
    title: "엠풍정밀 매수가 올린 MBK 고려하면 끝없는 '쩐의 전쟁'",
    description: 'MBK파트너스-엠풍정밀이 공개매수 가격을 기준...',
    image: '', // 이미지가 없는 경우
    link: 'https://example.com/article2',
    date: '2024-10-03 17:50',
    relatedCompanies: [
      { name: 'Company C', link: 'https://example.com/companyC' },
    ],
  },
  {
    id: 3,
    title: '금리 인하도 무색…상장사 41%, 영업익 눈높이 낮췄다',
    description: '미국 통화당국의 금리 인하에도 불구하고...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096520_001_20241003163014736.jpg?type=w647',
    link: 'https://example.com/article3',
    date: '2024-10-03 17:49',
    relatedCompanies: [],
  },
  {
    id: 1,
    title: '[글로벌 핫스톡] 美 인구구조 변화…부동산-헬스케어 등 주목',
    description:
      '전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096548_001_20241003183512388.jpg?type=w647', // 이미지 경로
    link: 'https://example.com/article1',
    date: '2024-10-03 17:52',
    relatedCompanies: [
      { name: 'Company A', link: 'https://example.com/companyA' },
      { name: 'Company B', link: 'https://example.com/companyB' },
    ],
  },
  {
    id: 2,
    title: "엠풍정밀 매수가 올린 MBK 고려하면 끝없는 '쩐의 전쟁'",
    description: 'MBK파트너스-엠풍정밀이 공개매수 가격을 기준...',
    image: '', // 이미지가 없는 경우
    link: 'https://example.com/article2',
    date: '2024-10-03 17:50',
    relatedCompanies: [
      { name: 'Company C', link: 'https://example.com/companyC' },
    ],
  },
  {
    id: 3,
    title: '금리 인하도 무색…상장사 41%, 영업익 눈높이 낮췄다',
    description: '미국 통화당국의 금리 인하에도 불구하고...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096520_001_20241003163014736.jpg?type=w647',
    link: 'https://example.com/article3',
    date: '2024-10-03 17:49',
    relatedCompanies: [],
  },
  {
    id: 1,
    title: '[글로벌 핫스톡] 美 인구구조 변화…부동산-헬스케어 등 주목',
    description:
      '전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096548_001_20241003183512388.jpg?type=w647', // 이미지 경로
    link: 'https://example.com/article1',
    date: '2024-10-03 17:52',
    relatedCompanies: [
      { name: 'Company A', link: 'https://example.com/companyA' },
      { name: 'Company B', link: 'https://example.com/companyB' },
    ],
  },
  {
    id: 2,
    title: "엠풍정밀 매수가 올린 MBK 고려하면 끝없는 '쩐의 전쟁'",
    description: 'MBK파트너스-엠풍정밀이 공개매수 가격을 기준...',
    image: '', // 이미지가 없는 경우
    link: 'https://example.com/article2',
    date: '2024-10-03 17:50',
    relatedCompanies: [
      { name: 'Company C', link: 'https://example.com/companyC' },
    ],
  },
  {
    id: 3,
    title: '금리 인하도 무색…상장사 41%, 영업익 눈높이 낮췄다',
    description: '미국 통화당국의 금리 인하에도 불구하고...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096520_001_20241003163014736.jpg?type=w647',
    link: 'https://example.com/article3',
    date: '2024-10-03 17:49',
    relatedCompanies: [],
  },
  {
    id: 1,
    title: '[글로벌 핫스톡] 美 인구구조 변화…부동산-헬스케어 등 주목',
    description:
      '전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096548_001_20241003183512388.jpg?type=w647', // 이미지 경로
    link: 'https://example.com/article1',
    date: '2024-10-03 17:52',
    relatedCompanies: [
      { name: 'Company A', link: 'https://example.com/companyA' },
      { name: 'Company B', link: 'https://example.com/companyB' },
    ],
  },
  {
    id: 2,
    title: "엠풍정밀 매수가 올린 MBK 고려하면 끝없는 '쩐의 전쟁'",
    description: 'MBK파트너스-엠풍정밀이 공개매수 가격을 기준...',
    image: '', // 이미지가 없는 경우
    link: 'https://example.com/article2',
    date: '2024-10-03 17:50',
    relatedCompanies: [
      { name: 'Company C', link: 'https://example.com/companyC' },
    ],
  },
  {
    id: 3,
    title: '금리 인하도 무색…상장사 41%, 영업익 눈높이 낮췄다',
    description: '미국 통화당국의 금리 인하에도 불구하고...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096520_001_20241003163014736.jpg?type=w647',
    link: 'https://example.com/article3',
    date: '2024-10-03 17:49',
    relatedCompanies: [],
  },
  {
    id: 1,
    title: '[글로벌 핫스톡] 美 인구구조 변화…부동산-헬스케어 등 주목',
    description:
      '전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096548_001_20241003183512388.jpg?type=w647', // 이미지 경로
    link: 'https://example.com/article1',
    date: '2024-10-03 17:52',
    relatedCompanies: [
      { name: 'Company A', link: 'https://example.com/companyA' },
      { name: 'Company B', link: 'https://example.com/companyB' },
    ],
  },
  {
    id: 2,
    title: "엠풍정밀 매수가 올린 MBK 고려하면 끝없는 '쩐의 전쟁'",
    description: 'MBK파트너스-엠풍정밀이 공개매수 가격을 기준...',
    image: '', // 이미지가 없는 경우
    link: 'https://example.com/article2',
    date: '2024-10-03 17:50',
    relatedCompanies: [
      { name: 'Company C', link: 'https://example.com/companyC' },
    ],
  },
  {
    id: 3,
    title: '금리 인하도 무색…상장사 41%, 영업익 눈높이 낮췄다',
    description: '미국 통화당국의 금리 인하에도 불구하고...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096520_001_20241003163014736.jpg?type=w647',
    link: 'https://example.com/article3',
    date: '2024-10-03 17:49',
    relatedCompanies: [],
  },
  {
    id: 1,
    title: '[글로벌 핫스톡] 美 인구구조 변화…부동산-헬스케어 등 주목',
    description:
      '전 세계적으로 인구 구조가 바뀌면서 경제 및 사회 전반이 변화하고 있다...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096548_001_20241003183512388.jpg?type=w647', // 이미지 경로
    link: 'https://example.com/article1',
    date: '2024-10-03 17:52',
    relatedCompanies: [
      { name: 'Company A', link: 'https://example.com/companyA' },
      { name: 'Company B', link: 'https://example.com/companyB' },
    ],
  },
  {
    id: 2,
    title: "엠풍정밀 매수가 올린 MBK 고려하면 끝없는 '쩐의 전쟁'",
    description: 'MBK파트너스-엠풍정밀이 공개매수 가격을 기준...',
    image: '', // 이미지가 없는 경우
    link: 'https://example.com/article2',
    date: '2024-10-03 17:50',
    relatedCompanies: [
      { name: 'Company C', link: 'https://example.com/companyC' },
    ],
  },
  {
    id: 3,
    title: '금리 인하도 무색…상장사 41%, 영업익 눈높이 낮췄다',
    description: '미국 통화당국의 금리 인하에도 불구하고...',
    image:
      'https://imgnews.pstatic.net/image/008/2024/10/03/0005096520_001_20241003163014736.jpg?type=w647',
    link: 'https://example.com/article3',
    date: '2024-10-03 17:49',
    relatedCompanies: [],
  },
]; */

const customDataSource = new CustomStore({
  load: (loadOptions) => {
    // 외부 JSON 파일을 가져오는 로직
    return fetch('../utils/combined_news_data.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('JSON 파일 로드 실패');
        }
        return response.json();
      })
      .catch(() => {
        throw '데이터 로드 실패';
      });
  },
  insert: (values) => {
    // 데이터 추가 로직
    return fetch('/api/data', {
      method: 'POST',
      body: JSON.stringify(values),
    }).then((response) => response.json());
  },
  update: (key, values) => {
    // 데이터 수정 로직
    return fetch(`/api/data/${key}`, {
      method: 'PUT',
      body: JSON.stringify(values),
    }).then((response) => response.json());
  },
});

// DataGrid 컴포넌트
const InfiniteScroll = () => {
  return (
    <DataGrid
      dataSource={customDataSource}
      className="w-[1282px] m-auto h-screen p-5"
      keyExpr="id"
      columnAutoWidth={true}
      showColumnHeaders={false}
      sorting={{ mode: 'single' }} // Sorting 속성 사용
      scrolling={{ mode: 'infinite' }} // Scrolling 속성으로 변경
      // loadPanel={{ enabled: false }} // LoadPanel 속성으로 변경
      rowTemplate={(container, options) => {
        const data = options.data;
        const rowElement = document.createElement('div');

        // 기본적으로 items-start로 상단 정렬
        let rowClassName = 'custom-row flex w-[1250px] items-start p-4';

        // 이미지가 있는지 확인
        let imgElement = null;
        let contentWidthClass = 'w-full'; // 기본적으로 전체 폭 사용

        if (
          data.image &&
          data.image !== '' &&
          data.image !== null &&
          data.image !== undefined
        ) {
          imgElement = document.createElement('img');
          imgElement.src = data.image;
          imgElement.alt = 'article image';
          imgElement.style.width = '180px';
          imgElement.style.height = '180px';
          imgElement.className = 'mr-14'; // 이미지와 내용 간의 간격 추가
          rowElement.appendChild(imgElement);

          // 이미지가 있을 때는 텍스트 영역을 좁게 설정
          contentWidthClass = 'w-[950px]';
        } else {
          // 이미지가 없을 경우 items-center로 수직 정렬
          rowClassName = 'custom-row flex w-[1250px] items-center p-4';
        }

        // 행의 클래스 지정 (이미지 여부에 따라 조정)
        rowElement.className = rowClassName;

        // 오른쪽에 제목과 내용 컨테이너 생성
        const contentElement = document.createElement('div');
        contentElement.className = `content flex-1 ${contentWidthClass} h-auto relative`; // 상대적 위치 설정, 폭 조정

        // 상단에 제목 (링크)
        const titleElement = document.createElement('a');
        titleElement.href = data.link;
        titleElement.target = '_blank'; // 새 탭에서 열기
        titleElement.textContent = data.title;
        titleElement.className = 'title font-bold text-lg mb-2 hover:underline'; // 제목 줄바꿈 없음
        contentElement.appendChild(titleElement);

        // 설명 (기사 내용) - 줄바꿈 처리
        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = data.description;
        descriptionElement.className = 'description text-sm break-words'; // 기사 내용 줄바꿈 처리
        descriptionElement.style.wordBreak = 'break-word'; // 줄바꿈 스타일 추가
        contentElement.appendChild(descriptionElement);

        // 관련 테마 (연관된 회사) 별도 줄에 표시
        if (data.relatedCompanies.length > 0) {
          const relatedElement = document.createElement('div');
          relatedElement.className = 'related-companies text-sm mt-2';
          const relatedTitle = document.createElement('span');
          relatedTitle.textContent = '관련 테마: ';
          relatedTitle.className = 'font-semibold';
          relatedElement.appendChild(relatedTitle);

          data.relatedCompanies.forEach((company) => {
            const companyLink = document.createElement('a');
            companyLink.href = company.link;
            companyLink.target = '_blank'; // 새 탭에서 열기
            companyLink.textContent = company.name;
            companyLink.className = 'ml-2 hover:underline text-blue-500';
            relatedElement.appendChild(companyLink);
          });

          contentElement.appendChild(relatedElement);
        }

        // 시간은 별도 줄에 표시
        const dateElement = document.createElement('div');
        dateElement.textContent = data.date;
        dateElement.className = 'date text-xs text-gray-500 text-right mt-2'; // 시간을 별도 줄에 표시
        contentElement.appendChild(dateElement);

        // 행에 컨텐츠 추가
        rowElement.appendChild(contentElement);
        container.appendChild(rowElement);
      }}
    ></DataGrid>
  );
};

export default InfiniteScroll;
