'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase.ts';
import Image from 'next/image';

interface NewsDetail {
  id: number;
  image: string;
  title: string;
  summary: string;
  link: string;
  date: string;
  keyword: string[];
}

interface StockNewsProps {
  newsId: string;
}

export default function StockNews({ newsId }: StockNewsProps) {
  const [newsDetail, setNewsDetail] = useState<NewsDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('id, image, title, summary, link, date')
        .eq('id', newsId)
        .single();

      if (error) {
        console.error('뉴스 데이터를 가져오는 중 오류 발생:', error.message);
        setError('뉴스 데이터를 불러오는 데 실패했습니다.');
      } else {
        setNewsDetail(data as NewsDetail);
      }
      setIsLoading(false);
    };

    if (newsId) {
      fetchNewsDetail();
    }
  }, [newsId]);

  const formatSummary = (summary: string) => {
    return summary.split('...')[0] + '...';
  };

  if (isLoading) {
    return <p>로딩 중...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!newsDetail) {
    return <p>뉴스 데이터를 찾을 수 없습니다.</p>;
  }

  return (
    <section className="mb-20 w-full">
      <h2 className="mb-6 text-2xl font-semibold">관련 기사</h2>
      <div className="flex">
        <Image
          src={newsDetail.image}
          alt={newsDetail.title}
          width={320}
          height={200}
          className="mr-8 h-auto max-w-full rounded-xl"
        />
        <div>
          <h3 className="mb-4 text-xl font-semibold">{newsDetail.title}</h3>
          <p className="mb-4 text-gray-600">
            {formatSummary(newsDetail.summary)}
          </p>

          <div className="flex justify-between">
            <a
              href={newsDetail.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base text-gray-600 hover:underline"
            >
              원문 보기
            </a>
            <p className="text-base text-gray-500">{newsDetail.date}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
