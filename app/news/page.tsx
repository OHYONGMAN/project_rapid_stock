'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { create } from 'zustand';
import { parse } from 'date-fns'; // date-fns에서 parse 함수 임포트

// 데이터 항목의 구조를 정의하는 인터페이스
interface DataItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  link: string;
  date: string; // 날짜 문자열
  relatedCompanies: { name: string; code: string }[];
}

// Zustand를 사용하여 상태 관리를 위한 인터페이스 정의
interface DataState {
  data: DataItem[]; // 뉴스 데이터 배열
  page: number; // 현재 페이지 번호
  hasMore: boolean; // 추가 데이터 여부
  loading: boolean; // 로딩 상태
  fetchData: () => Promise<void>; // 데이터를 가져오는 함수
  refreshData: () => Promise<void>; // 데이터를 새로고침하는 함수
}

// 날짜를 기준으로 데이터를 내림차순(최신순)으로 정렬하는 함수
const sortDataByDate = (data: DataItem[]) => {
  return data.sort((a, b) => {
    // 날짜 문자열을 정확하게 파싱하여 타임스탬프로 변환
    const dateA = parse(a.date, 'yyyy-MM-dd HH:mm:ss', new Date()).getTime();
    const dateB = parse(b.date, 'yyyy-MM-dd HH:mm:ss', new Date()).getTime();
    // 내림차순 정렬
    return dateB - dateA;
  });
};

// Zustand 스토어를 생성하여 데이터 상태 관리
const useDataStore = create<DataState>((set, get) => ({
  data: [],
  page: 1,
  hasMore: true,
  loading: false,
  // 데이터를 비동기적으로 가져오는 함수
  fetchData: async () => {
    set({ loading: true }); // 로딩 시작
    const page = get().page;
    try {
      const response = await fetch(`/api/news-crawl/crawl?page=${page}`);
      if (!response.ok) throw new Error('API 요청 실패');
      const result = await response.json();
      if (result.length === 0) {
        set({ hasMore: false }); // 더 이상 데이터 없음
      } else {
        set((state) => {
          const updatedData = [...state.data, ...result];
          const sortedData = sortDataByDate(updatedData); // 데이터 정렬
          return { data: sortedData };
        });
        set({ page: page + 1 }); // 페이지 번호 증가
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      set({ loading: false }); // 로딩 종료
    }
  },

  // 데이터를 새로고침하는 함수
  refreshData: async () => {
    try {
      const response = await fetch(`/api/news-crawl/crawl?page=1`);
      if (!response.ok) throw new Error('API 요청 실패');
      const result = await response.json();
      if (result.length === 0) return;
      const existingData = get().data;
      // 기존 데이터와 새 데이터를 비교하여 변경 사항이 있으면 업데이트
      if (JSON.stringify(existingData) !== JSON.stringify(result)) {
        set({
          data: sortDataByDate(result),
          page: 2, // 페이지 번호 초기화
          hasMore: true,
        });
      }
    } catch (error) {
      console.error('데이터 새로고침 실패:', error);
    }
  },
}));

// 메인 페이지 컴포넌트
const Page = () => {
  // Zustand 스토어에서 필요한 상태와 함수 가져오기
  const { data, hasMore, loading, fetchData, refreshData } = useDataStore();
  const observer = useRef<IntersectionObserver | null>(null);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchData();
    // 서버의 API 라우트를 호출하여 크롤링 작업을 실행
    fetch('/api/news-crawl')
      .then((response) => response.json())
      .then((data) => console.log(data.message))
      .catch((error) => console.error('Error:', error));
  }, []);

  // 주기적으로 데이터 새로고침 (10초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // 마지막 아이템을 감시하여 무한 스크롤 구현
  const lastItemRef = useCallback(
    (node: HTMLDivElement) => {
      if (observer.current) observer.current.disconnect(); // 기존 옵저버 해제
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loading) {
            fetchData(); // 다음 페이지 데이터 로드
          }
        },
        { threshold: 1 },
      );
      if (node) observer.current.observe(node); // 새로운 노드 감시 시작
    },
    [hasMore, loading, fetchData],
  );

  return (
    // 전체 컨테이너
    <div className="m-auto h-screen w-[1282px] overflow-auto p-5">
      {data.map((item, index) => (
        // 각 뉴스 아이템 렌더링
        <div
          key={item.id}
          ref={index === data.length - 1 ? lastItemRef : null} // 마지막 아이템에 ref 적용
          className={`custom-row flex w-[1250px] ${
            item.image ? 'items-start' : 'items-center'
          } p-4`}
        >
          {/* 이미지가 있을 경우에만 렌더링 */}
          {item.image && (
            <img
              src={item.image}
              alt="article image"
              className="mr-14 size-[70px] rounded-lg object-cover"
            />
          )}
          {/* 뉴스 내용 */}
          <div
            className={`content flex-1 ${
              item.image ? 'w-[950px]' : 'w-full'
            } relative h-auto`}
          >
            {/* 뉴스 제목 */}
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="title mb-2 text-lg font-bold hover:underline"
            >
              {item.title}
            </a>
            {/* 뉴스 설명 */}
            <p className="description break-words text-sm">
              {item.description}
            </p>
            {/* 관련 테마가 있을 경우에만 렌더링 */}
            {item.relatedCompanies.length > 0 && (
              <div className="related-companies mt-2 text-sm">
                <span className="font-semibold">관련 테마:</span>
                {item.relatedCompanies.map((company, idx) => (
                  <a
                    key={idx}
                    href={`https://finance.naver.com/item/main.naver?code=${company.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-500 hover:underline"
                  >
                    {company.name}
                  </a>
                ))}
              </div>
            )}
            {/* 뉴스 날짜 */}
            <div className="date mt-2 text-right text-xs text-gray-500">
              {item.date}
            </div>
          </div>
        </div>
      ))}
      {/* 로딩 중일 때 표시 */}
      {loading && <p className="mt-4 text-center">로딩 중...</p>}
      {/* 더 이상 데이터가 없을 경우 표시 */}
      {!hasMore && !loading && (
        <p className="mt-4 text-center">더 이상 데이터가 없습니다.</p>
      )}
    </div>
  );
};

export default Page;
