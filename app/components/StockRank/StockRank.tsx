'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchStockData, StockRankData } from '../../utils/kisApi/homeStock.ts';
import stockup from '../../../public/images/ico-stockup.svg';
import stockdown from '../../../public/images/ico-stockdown.svg';

export default function StockRank() {
  const [topStock, setTopStock] = useState<StockRankData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatNumber = (num: string) => {
    return new Intl.NumberFormat('ko-KR').format(Number(num));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchStockData('topStock');
        setTopStock(data as StockRankData[]);
      } catch (error) {
        console.error('주식 데이터 요청 중 에러 발생:', error);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <p>주식 데이터를 불러오는 중입니다...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!topStock || topStock.length === 0)
    return <p>표시할 주식 데이터가 없습니다.</p>;

  return (
    <table className="w-full table-auto border-collapse border-t-2 border-black text-center">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2">순위</th>
          <th className="p-2">종목명</th>
          <th className="p-2">현재가</th>
          <th className="p-2">전일대비</th>
          <th className="p-2">거래량</th>
        </tr>
      </thead>
      <tbody>
        {topStock.slice(0, 10).map((stock: StockRankData, index: number) => (
          <tr key={index} className="border-b hover:bg-g-100">
            <td className="px-2 py-4">{stock.data_rank}</td>
            <td className="px-2 py-4">{stock.hts_kor_isnm}</td>
            <td className="px-2 py-4">{formatNumber(stock.stck_prpr)}</td>
            <td className="px-2 py-4">
              {parseFloat(stock.prdy_vrss) > 0 ? (
                <div className="flex items-center justify-center text-primary">
                  <Image src={stockup} alt="상승" width={16} height={16} />
                  <span className="ml-2">{formatNumber(stock.prdy_vrss)}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center text-blue-500">
                  <Image src={stockdown} alt="하락" width={16} height={16} />
                  <span className="ml-2">{formatNumber(stock.prdy_vrss)}</span>
                </div>
              )}
            </td>
            <td className="px-2 py-4">{formatNumber(stock.acml_vol)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
