'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../utils/supabase';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface NewsItem {
  id: number;
  image: string;
  title: string;
  date: string;
  keyword: string[];
}

const News: React.FC = () => {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const itemsPerPage = 10; // 페이지당 뉴스 항목 수
  const [hasMore, setHasMore] = useState<boolean>(true);

  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || undefined;

  // 뉴스 데이터 불러오기
  useEffect(() => {
    const fetchData = async (page: number) => {
      setLoading(true);

      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage - 1;

      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('date', { ascending: false })
        .range(start, end); // 범위에 맞는 뉴스 데이터 가져오기

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        if (data && data.length > 0) {
          setNewsData((prevData) => {
            const newData = data.filter(
              (newsItem) => !prevData.some((item) => item.id === newsItem.id),
            );
            return [...prevData, ...newData];
          });

          if (data.length < itemsPerPage) {
            setHasMore(false);
          }
        } else {
          setHasMore(false); // 더 이상 불러올 데이터가 없을 경우
        }
      }

      setLoading(false);
    };

    if (hasMore) {
      fetchData(page);
    }
  }, [page]);

  // 페이지 끝에 도달하면 더 많은 데이터를 불러오기 위한 Intersection Observer
  useEffect(() => {
    if (loading || !hasMore) return;

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

  // 검색어가 있을 경우, 뉴스 데이터를 필터링
  const filteredNewsData = searchTerm
    ? newsData.filter((news) =>
        news.keyword.some((keyword) =>
          keyword.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      )
    : newsData;

  return (
    <ul className="m-auto w-[1282px] p-5">
      {filteredNewsData.map((news) => (
        <li className="mt-10 flex flex-col" key={news.id}>
          <div className="flex justify-between">
            <div className="flex">
              <img src={news.image} alt="뉴스 이미지" />
              <Link href={`/news/${news.id}`}>
                <h2 className="ml-4 font-bold text-xl cursor-pointer">
                  {news.title}
                </h2>
              </Link>
            </div>
            <div>
              <p>{news.date}</p>
              <div></div>
            </div>
          </div>
          <p className="mt-3 font-semibold">
            관련종목:{' '}
            <span className=" text-blue-600">{news.keyword.join(' ')}</span>
          </p>
        </li>
      ))}

      {loading && <p>로딩중</p>}

      {!loading && hasMore && (
        <div ref={observerRef} style={{ height: '20px' }}></div>
      )}

      {!hasMore && <p>데이터가 없습니다.</p>}
    </ul>
  );
};

export default News;
