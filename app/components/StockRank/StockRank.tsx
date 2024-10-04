'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import stockup from '../../../public/images/ico-stockup.svg';
import stockdown from '../../../public/images/ico-stockdown.svg';

export default function StockRank() {
  const [topStock, setTopStock] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTopStock = async () => {
    try {
      const response = await fetch('/api/stock-rank');
      if (response.ok) {
        const data = await response.json();
        setTopStock(data);
      } else {
        console.error('주식 데이터 요청 실패');
      }
    } catch (error) {
      console.error('주식 데이터를 불러오는 중 에러 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopStock();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-16 mx-20">
      <h2 className="text-2xl font-semibold mb-4">TOP 종목</h2>
      <h3 className="text-lg font-semibold mb-4">거래 상위</h3>
      {loading ? (
        <p>주식 데이터를 불러오는 중입니다...</p>
      ) : topStock ? (
        <table className="w-full table-auto border-collapse text-center border-t-2 border-black">
          <tbody>
            {topStock.map((stock: any, index: number) => (
              <tr key={index} className="border-b hover:bg-g-100">
                <td className="py-4 px-2">{index + 1}</td>
                <td className="py-4 px-2">{stock.hts_kor_isnm}</td>
                <td className="py-4 px-2">{stock.stck_prpr}</td>
                <td className="py-4 px-2">
                  {stock.prdy_vrss > 0 ? (
                    <div className="flex items-center justify-center text-primary">
                      <Image src={stockup} alt="상승" />
                      <span className="ml-2">{stock.prdy_vrss}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-blue-500">
                      <Image src={stockdown} alt="하락" />
                      <span className="ml-2">{stock.prdy_vrss}</span>
                    </div>
                  )}
                </td>
                <td
                  className={`py-4 px-2 ${
                    stock.prdy_ctrt > 0 ? 'text-primary' : 'text-blue-500'
                  }`}
                >
                  {stock.prdy_ctrt > 0
                    ? `+${stock.prdy_ctrt}%`
                    : `${stock.prdy_ctrt}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>주식 데이터를 불러오지 못했습니다.</p>
      )}
    </div>
  );
}
