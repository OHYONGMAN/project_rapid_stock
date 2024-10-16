'use client';

import React, { useEffect, useState } from 'react';
import {
  fetchStockData,
  StockDividendData,
} from '../../utils/kisApi/homeStock.ts';

export default function StockDividends() {
  const [stockDividends, setStockDividends] = useState<
    StockDividendData[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatNumber = (num: string) => {
    return new Intl.NumberFormat('ko-KR').format(Number(num));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchStockData('stockDividends');
        setStockDividends(data as StockDividendData[]);
      } catch (error) {
        console.error('주식 배당 데이터 요청 중 에러 발생:', error);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <p>주식 배당 데이터를 불러오는 중입니다...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!stockDividends || stockDividends.length === 0)
    return <p>표시할 주식 배당 데이터가 없습니다.</p>;

  return (
    <table className="w-full table-auto border-collapse border-t-2 border-black text-center">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2">순위</th>
          <th className="p-2">종목명</th>
          <th className="p-2">현재가</th>
          <th className="p-2">배당금</th>
          <th className="p-2">배당률</th>
          <th className="p-2">배당종류</th>
        </tr>
      </thead>
      <tbody>
        {stockDividends.map((stock: StockDividendData, index: number) => (
          <tr key={index} className="border-b hover:bg-g-100">
            <td className="px-2 py-4">{stock.rank}</td>
            <td className="px-2 py-4">{stock.isin_name}</td>
            <td className="px-2 py-4">{formatNumber(stock.stck_prpr)}</td>
            <td className="px-2 py-4">
              {formatNumber(stock.per_sto_divi_amt)}
            </td>
            <td className="px-2 py-4">{stock.divi_rate}%</td>
            <td className="px-2 py-4">{stock.divi_kind}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
