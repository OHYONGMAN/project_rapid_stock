'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase.ts';
import Image from 'next/image';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

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

  useEffect(() => {
    const fetchNewsDetail = async () => {
      const { data, error } = await supabase
        .from('news')
        .select('id, image, title, summary, link, date')
        .eq('id', newsId)
        .single();

      if (error) {
        console.error('뉴스 데이터를 가져오는 중 오류 발생:', error.message);
        setError('뉴스 데이터를 불러오는 데 실패했습니다.');
      } else {
        console.log('Fetched News Detail:', data);
        setNewsDetail(data as NewsDetail);
      }
    };

    if (newsId) {
      fetchNewsDetail();
    }
  }, [newsId]);

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!newsDetail) {
    return (
      <div className="flex h-screen items-center justify-center">
        <AiOutlineLoading3Quarters className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <section className="p-5">
      <h2 className="mb-4 text-2xl font-semibold">관련 기사</h2>

      <div className="mb-8 flex">
        <Image
          src={newsDetail.image}
          alt={newsDetail.title}
          width={320}
          height={200}
          layout="intrinsic"
          className="rounded-xl"
        />

        <div className="ml-4">
          <h3 className="mb-4 text-xl font-semibold">{newsDetail.title}</h3>
          <p className="mb-4">{newsDetail.summary}</p>

          <div className="flex justify-between">
            <a
              href={newsDetail.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              기사 링크 보기
            </a>
            <p className="text-gray-500">{newsDetail.date}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
