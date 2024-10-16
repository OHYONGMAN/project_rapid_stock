'use client';

import React, { useEffect, useState } from 'react';
import {
  fetchStockData,
  StockCapitalizationData,
} from '../../utils/kisApi/homeStock.ts';

export default function StockCapitalization() {
  const [topStock, setTopStock] = useState<StockCapitalizationData[] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchStockData('stockCapitalization');
        setTopStock(data as StockCapitalizationData[]);
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
          <th className="p-2">시가총액</th>
        </tr>
      </thead>
      <tbody>
        {topStock
          .slice(0, 10)
          .map((stock: StockCapitalizationData, index: number) => (
            <tr key={index} className="border-b hover:bg-g-100">
              <td className="px-2 py-4">{stock.data_rank}</td>
              <td className="px-2 py-4">{stock.hts_kor_isnm}</td>
              <td className="px-2 py-4">{stock.stck_prpr}</td>
              <td
                className={`px-2 py-4 ${
                  parseFloat(stock.prdy_ctrt) > 0
                    ? 'text-primary'
                    : 'text-blue-500'
                }`}
              >
                {parseFloat(stock.prdy_ctrt) > 0
                  ? `+${stock.prdy_ctrt}%`
                  : `${stock.prdy_ctrt}%`}
              </td>
              <td className="px-2 py-4">{stock.stck_avls}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
