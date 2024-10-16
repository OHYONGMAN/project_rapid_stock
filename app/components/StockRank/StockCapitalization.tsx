'use client';

import React, { useEffect, useState } from 'react';
import { fetchStockData, StockData } from '../../utils/kisApi/homeStock.ts';

export default function StockCapitalization() {
  const [topStock, setTopStock] = useState<StockData[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchStockData('stockCapitalization');
        setTopStock(data.slice(0, 10));
      } catch (error) {
        console.error('주식 데이터 요청 중 에러 발생:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {topStock ? (
        <table className="w-full table-auto border-collapse border-t-2 border-black text-center">
          <tbody>
            {topStock.map((stock, index) => (
              <tr key={index} className="border-b hover:bg-g-100">
                <td className="px-2 py-4">{index + 1}</td>
                <td className="px-2 py-4">{stock.hts_kor_isnm}</td>
                <td className="px-2 py-4">{stock.stck_prpr}</td>
                <td
                  className={`px-2 py-4 ${
                    parseInt(stock.prdy_ctrt) > 0
                      ? 'text-primary'
                      : 'text-blue-500'
                  }`}
                >
                  {parseInt(stock.prdy_ctrt) > 0
                    ? `+${stock.prdy_ctrt}%`
                    : `${stock.prdy_ctrt}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>주식 데이터를 불러오는 중입니다...</p>
      )}
    </>
  );
}
