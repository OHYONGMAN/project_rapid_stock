'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../utils/supabase';

interface NewsItem {
  id: number;
  image: string;
  title: string;
  date: string;
  keyword: string[];
}

const MyPage: React.FC = () => {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1); // 페이지 상태
  const observerRef = useRef<HTMLDivElement | null>(null); // Intersection Observer용 ref
  const itemsPerPage = 10; // 페이지 당 아이템 수
  const [hasMore, setHasMore] = useState<boolean>(true); // 더 불러올 데이터가 있는지 확인하는 상태

  useEffect(() => {
    const fetchData = async (page: number) => {
      setLoading(true);

      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage - 1;

      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('date', { ascending: false })
        .range(start, end); // start부터 end까지의 범위 데이터를 가져옵니다.

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        // 데이터가 있을 경우에만 추가
        if (data && data.length > 0) {
          setNewsData((prevData) => {
            // 중복된 데이터가 추가되지 않도록 기존 데이터에 없는 항목만 추가
            const newData = data.filter(
              (newsItem) => !prevData.some((item) => item.id === newsItem.id),
            );
            return [...prevData, ...newData];
          });

          // 데이터가 itemsPerPage보다 적으면 더 이상 불러올 데이터가 없는 것으로 판단
          if (data.length < itemsPerPage) {
            setHasMore(false);
          }
        } else {
          setHasMore(false); // 더 이상 불러올 데이터가 없는 경우
        }
      }

      setLoading(false);
    };

    // 데이터가 더 있을 때만 fetchData 호출
    if (hasMore) {
      fetchData(page);
    }
  }, [page]);

  // Intersection Observer 설정
  useEffect(() => {
    if (loading || !hasMore) return; // 로딩 중이거나 더 불러올 데이터가 없으면 실행하지 않음

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1.0 },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [loading, hasMore]);

  return (
    <ul className="m-auto w-[1282px] p-5">
      {newsData.map((news) => (
        <li className="mt-10 flex flex-col" key={news.id}>
          <div className="flex justify-between">
            <div className="flex">
              <img src={news.image} alt="뉴스 이미지" />
              <h2 className=" ml-4 text-xl font-bold">{news.title}</h2>
            </div>
            <div>
              <p>{news.date}</p>
              <div></div>
            </div>
          </div>
          <p className="mt-3 font-semibold">
            관련테마:{' '}
            <span className=" text-blue-600">{news.keyword.join(' ')}</span>
          </p>
        </li>
      ))}

      {/* 로딩 상태 표시 */}
      {loading && <p>Loading more...</p>}

      {/* 더 많은 데이터를 불러올 트리거 요소 */}
      {!loading && hasMore && (
        <div ref={observerRef} style={{ height: '20px' }}></div>
      )}

      {!hasMore && <p>No more news to load</p>}
    </ul>
  );
};

export default MyPage;
