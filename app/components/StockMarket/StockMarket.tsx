'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  fetchStockData,
  IndexPriceData,
} from '../../utils/kisApi/homeStock.ts';
import StockChart from '../StockChart/StockChart.tsx';
import stockup from '../../../public/images/ico-stockup.svg';
import stockdown from '../../../public/images/ico-stockdown.svg';

const indexCodes = [
  { name: '코스피', code: '0001' },
  { name: '코스닥', code: '1001' },
  { name: '코스피200', code: '2001' },
];

export default function StockMarket() {
  const [indexData, setIndexData] = useState<IndexPriceData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);

  const formatNumber = (num: string) => {
    return new Intl.NumberFormat('ko-KR').format(Number(num));
  };

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchStockData('indexPrice');
        if (!isCancelled) {
          setIndexData(data as IndexPriceData[]);
          setError(null);
        }
      } catch {
        if (!isCancelled) {
          setError('데이터를 불러오는 중 오류가 발생했습니다.');
          setIndexData(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (isLoading) return <p>지수 데이터를 불러오는 중입니다...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!indexData || indexData.length === 0)
    return <p>표시할 지수 데이터가 없습니다.</p>;

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">오늘의 증시</h2>
      <div className="flex flex-col gap-4">
        {indexData.map((data: IndexPriceData, index: number) => (
          <div key={indexCodes[index].code} className="rounded-lg bg-g-100 p-4">
            <div
              className="flex cursor-pointer items-center gap-5"
              onClick={() =>
                setSelectedIndex(
                  selectedIndex === indexCodes[index].code
                    ? null
                    : indexCodes[index].code,
                )
              }
            >
              <h3 className="flex-1 text-left font-semibold">
                {indexCodes[index].name}
              </h3>
              <p className="text-right">
                {data?.bstp_nmix_prpr
                  ? formatNumber(data.bstp_nmix_prpr)
                  : '데이터 없음'}
              </p>
              <div className="ml-2 flex w-16 items-center justify-between">
                {data?.bstp_nmix_prdy_vrss &&
                parseFloat(data.bstp_nmix_prdy_vrss) > 0 ? (
                  <div className="flex w-full items-center text-primary">
                    <Image src={stockup} alt="상승" width={16} height={16} />
                    <p className="flex-1 text-right">
                      {formatNumber(data.bstp_nmix_prdy_vrss)}
                    </p>
                  </div>
                ) : data?.bstp_nmix_prdy_vrss ? (
                  <div className="flex w-full items-center text-blue-500">
                    <Image src={stockdown} alt="하락" width={16} height={16} />
                    <p className="flex-1 text-right">
                      {formatNumber(data.bstp_nmix_prdy_vrss)}
                    </p>
                  </div>
                ) : (
                  <p>데이터 없음</p>
                )}
              </div>
              <p
                className={`w-16 text-right ${
                  data?.bstp_nmix_prdy_ctrt &&
                  parseFloat(data.bstp_nmix_prdy_ctrt) > 0
                    ? 'text-primary'
                    : 'text-blue-500'
                }`}
              >
                {data?.bstp_nmix_prdy_ctrt
                  ? parseFloat(data.bstp_nmix_prdy_ctrt) > 0
                    ? `+${data.bstp_nmix_prdy_ctrt}%`
                    : `${data.bstp_nmix_prdy_ctrt}%`
                  : '데이터 없음'}
              </p>
            </div>

            {selectedIndex === indexCodes[index].code && (
              <div className="mt-4">
                <StockChart symbol={indexCodes[index].code} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
