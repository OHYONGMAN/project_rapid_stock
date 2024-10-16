'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchStockData, StockData } from '../../utils/kisApi/homeStock.ts';
import stockup from '../../../public/images/ico-stockup.svg';
import stockdown from '../../../public/images/ico-stockdown.svg';

export default function StockDividends() {
  const [stockDividends, setStockDividends] = useState<StockData[] | null>(
    null,
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchStockData('stockDividends');
        setStockDividends(data);
      } catch (error) {
        console.error('주식 배당 데이터 요청 중 에러 발생:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {stockDividends ? (
        <table className="w-full table-auto border-collapse border-t-2 border-black text-center">
          <tbody>
            {stockDividends.map((stock, index) => (
              <tr key={index} className="border-b hover:bg-g-100">
                <td className="px-2 py-4">{index + 1}</td>
                <td className="px-2 py-4">{stock.hts_kor_isnm}</td>
                <td className="px-2 py-4">{stock.stck_prpr}</td>
                <td className="px-2 py-4">
                  {parseInt(stock.prdy_vrss) > 0 ? (
                    <div className="flex items-center justify-center text-primary">
                      <Image src={stockup} alt="상승" width={16} height={16} />
                      <span className="ml-2">{stock.prdy_vrss}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-blue-500">
                      <Image
                        src={stockdown}
                        alt="하락"
                        width={16}
                        height={16}
                      />
                      <span className="ml-2">{stock.prdy_vrss}</span>
                    </div>
                  )}
                </td>
                <td
                  className={`px-2 py-4 ${parseInt(stock.prdy_ctrt) > 0 ? 'text-primary' : 'text-blue-500'}`}
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
