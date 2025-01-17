'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { supabase } from '../utils/supabase.ts';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface NewsItem {
  id: number;
  image: string;
  title: string;
  date: string;
  keyword: string[];
}

const NewsList = () => {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const itemsPerPage = 10;
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
        .range(start, end);

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
          setHasMore(false);
        }
      }

      setLoading(false);
    };

    if (hasMore) {
      fetchData(page);
    }
  }, [page]);

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

  const handleNewsClick = (newsId: number, newsTitle: string) => {
    const currentHistory = JSON.parse(
      localStorage.getItem('newsHistory') || '[]',
    );

    const updatedHistory = [
      { id: newsId, title: newsTitle },
      ...currentHistory.filter(
        (item: { id: number; title: string }) => item.id !== newsId,
      ),
    ];

    const limitedHistory = updatedHistory.slice(0, 5);

    localStorage.setItem('newsHistory', JSON.stringify(limitedHistory));

    if (
      typeof window !== 'undefined' &&
      typeof window.updateRecentNews === 'function'
    ) {
      window.updateRecentNews();
    }
  };

  const filteredNewsData = searchTerm
    ? newsData.filter((news) =>
        news.keyword.some((keyword) =>
          keyword.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      )
    : newsData;

  return (
    <div className="w-full">
      <ul className="mx-auto max-w-[1700px] py-12 sm:px-12 xl:px-20 2xl:px-20">
        {filteredNewsData.map((news) => (
          <li
            className="flex flex-col hover:bg-g-100 p-8 rounded-2xl mb-2"
            key={news.id}
          >
            <div className="flex justify-between">
              <div className="flex">
                <Image
                  src={news.image}
                  alt="뉴스 이미지"
                  width={100}
                  height={50}
                  className="h-14 w-20 rounded-lg object-cover"
                />
                <div className="flex flex-col flex-1">
                  <Link href={`/news/${news.id}`}>
                    <h2
                      className="ml-4 cursor-pointer text-xl font-semibold"
                      onClick={() => handleNewsClick(news.id, news.title)}
                    >
                      {news.title}
                    </h2>
                  </Link>
                  <p className="mt-2">
                    <span className="m-3 font-semibold">관련종목</span>
                    {news.keyword.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 mr-2 px-2 py-1 rounded-sm text-g-900"
                      >
                        {keyword}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-g-600">{news.date}</p>
              </div>
            </div>
          </li>
        ))}

        {loading && <p>로딩중</p>}

        {!loading && hasMore && (
          <div ref={observerRef} style={{ height: '20px' }}></div>
        )}

        {!hasMore && <p>데이터가 없습니다.</p>}
      </ul>
    </div>
  );
};

const News: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewsList />
    </Suspense>
  );
};

export default News;
