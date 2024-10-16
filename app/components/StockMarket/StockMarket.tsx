'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  fetchStockData,
  IndexPriceData,
} from '../../utils/kisApi/homeStock.ts';
import stockup from '../../../public/images/ico-stockup.svg';
import stockdown from '../../../public/images/ico-stockdown.svg';

export default function StockMarket() {
  const [indexData, setIndexData] = useState<IndexPriceData | null>(null); // IndexPriceData로 타입 지정
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchStockData('indexPrice');

        // IndexPriceData만 필터링
        const indexPriceData = data.find(
          (item): item is IndexPriceData => 'bstp_nmix_prpr' in item,
        );

        setIndexData(indexPriceData || null);
      } catch (error) {
        console.error('인덱스 데이터 요청 중 에러 발생:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <p>지수 데이터를 불러오는 중입니다...</p>;
  }

  if (!indexData) {
    return <p>표시할 지수 데이터가 없습니다.</p>;
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">오늘의 증시</h2>
      <div className="flex items-center gap-5 rounded-lg bg-g-100 p-4">
        <h3 className="flex-1 text-left font-semibold">코스피</h3>
        <p className="text-right">{indexData.bstp_nmix_prpr}</p>
        <div className="ml-2 flex w-16 items-center justify-between">
          {parseFloat(indexData.bstp_nmix_prdy_vrss) > 0 ? (
            <div className="flex w-full items-center text-primary">
              <Image src={stockup} alt="상승" width={16} height={16} />
              <p className="flex-1 text-right">
                {indexData.bstp_nmix_prdy_vrss}
              </p>
            </div>
          ) : (
            <div className="flex w-full items-center text-blue-500">
              <Image src={stockdown} alt="하락" width={16} height={16} />
              <p className="flex-1 text-right">
                {indexData.bstp_nmix_prdy_vrss}
              </p>
            </div>
          )}
        </div>
        <p
          className={`w-16 text-right ${
            parseFloat(indexData.bstp_nmix_prdy_ctrt) > 0
              ? 'text-primary'
              : 'text-blue-500'
          }`}
        >
          {parseFloat(indexData.bstp_nmix_prdy_ctrt) > 0
            ? `+${indexData.bstp_nmix_prdy_ctrt}%`
            : `${indexData.bstp_nmix_prdy_ctrt}%`}
        </p>
      </div>
    </div>
  );
}
