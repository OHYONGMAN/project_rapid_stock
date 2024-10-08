'use client';
// devexteme licenseKey를 가져오는겁니다. (삭제금지)
import config from 'devextreme/core/config';
import { licenseKey } from '../devextreme-license';
config({ licenseKey });

import React from 'react';
import DataGrid from 'devextreme-react/data-grid';
import CustomStore from 'devextreme/data/custom_store';

const customDataSource = new CustomStore({
  load: () => {
    // 외부 JSON 파일을 public 폴더에서 가져오는 로직
    return fetch('/combined_news_data.json') // public 폴더에 있는 JSON 파일을 불러옴
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
});

// DataGrid 컴포넌트
const Home = () => {
  return (
    <DataGrid
      dataSource={customDataSource}
      className="w-[1282px] m-auto h-screen p-5"
      keyExpr="id"
      columnAutoWidth={true}
      showColumnHeaders={false}
      sorting={{ mode: 'single' }} // Sorting 속성 사용
      scrolling={{ mode: 'infinite' }} // Scrolling 속성으로 변경
      loadPanel={{ enabled: false }} // LoadPanel 속성으로 변경
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
          imgElement.style.height = '70px';
          imgElement.className = 'mr-14'; // 이미지와 내용 간의 간격 추가

          // 이미지 스타일 추가
          imgElement.style.objectFit = 'cover'; // 이미지가 영역을 꽉 채우도록 설정
          imgElement.style.imageRendering = 'auto'; // 이미지 렌더링 최적화 (특정 환경에서 유리함)
          imgElement.style.borderRadius = '8px'; // 모서리를 둥글게 처리 (선택 사항)
          imgElement.style.filter = 'none'; // 혹시 뿌옇게 만드는 필터가 적용되었을 가능성 제거

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

export default Home;
