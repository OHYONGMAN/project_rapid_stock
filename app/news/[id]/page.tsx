'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../utils/supabase.ts';
import StockNews from './components/StockNews';
import StockTable from './components/StockTable';

interface NewsDetail {
  id: number;
  relatedCompanies: { name: string; code: string }[];
}

export default function NewsDetailPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [newsDetail, setNewsDetail] = useState<NewsDetail | null>(null);
  const params = useParams();
  const newsId = params?.id as string;

  useEffect(() => {
    const fetchNewsDetail = async () => {
      if (newsId) {
        const { data, error } = await supabase
          .from('news')
          .select('id, relatedCompanies')
          .eq('id', newsId)
          .single();

        if (error) {
          console.error('뉴스 데이터를 가져오는 중 오류 발생:', error.message);
        } else {
          setNewsDetail(data as NewsDetail);
        }
      }
    };

    fetchNewsDetail();
  }, [newsId]);

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol((prevSymbol) => (prevSymbol === symbol ? null : symbol));
  };

  return (
    <div className="w-full">
      {newsId && <StockNews newsId={newsId} />}
      {newsDetail && (
        <StockTable
          relatedCompanies={newsDetail.relatedCompanies}
          onSymbolSelect={handleSymbolSelect}
          selectedSymbol={selectedSymbol}
        />
      )}
    </div>
  );
}
