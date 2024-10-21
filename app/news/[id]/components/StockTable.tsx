'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import stockup from '../../../../public/images/ico-stockup.svg';
import stockdown from '../../../../public/images/ico-stockdown.svg';
import {
  fetchTodayStockData,
  StockData,
} from '../../../utils/kisApi/todayStock.ts';
import StockChart from './StockChart';

interface RelatedCompany {
  name: string;
  code: string;
}

interface StockTableProps {
  relatedCompanies?: RelatedCompany[];
  onSymbolSelect: (symbol: string) => void;
  selectedSymbols: string[];
}

const formatNumber = (num: string | number): string => {
  return new Intl.NumberFormat('ko-KR').format(Number(num));
};

export default function StockTable({
  relatedCompanies = [],
  onSymbolSelect,
  selectedSymbols,
}: StockTableProps) {
  const [stockDataMap, setStockDataMap] = useState<Map<string, StockData>>(
    new Map(),
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStockData = useCallback(async () => {
    if (relatedCompanies.length === 0) {
      setError('관련 종목이 없습니다.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const newStockDataMap = new Map<string, StockData>();
    for (const company of relatedCompanies) {
      try {
        console.log(`Fetching data for ${company.name} (${company.code})`);
        const data = await fetchTodayStockData(company.code);
        console.log(`Received data for ${company.name}:`, data);
        newStockDataMap.set(company.code, data);
      } catch (err) {
        console.error(`데이터 로딩 중 에러 (${company.name}):`, err);
        setError(`${company.name} 데이터 로딩 실패`);
      }
    }

    setStockDataMap(newStockDataMap);
    setIsLoading(false);
  }, [relatedCompanies]);

  useEffect(() => {
    loadStockData();
  }, [loadStockData]);

  if (isLoading) {
    return <p className="text-center">데이터를 불러오는 중입니다...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">에러: {error}</p>;
  }

  if (relatedCompanies.length === 0) {
    return <p className="text-center">관련 종목이 없습니다.</p>;
  }

  return (
    <section className="w-full">
      <h2 className="mb-6 text-2xl font-semibold">관련 종목</h2>

      <table className="w-full">
        <tbody className="overflow-x-auto border-t-2 border-black">
          {relatedCompanies.map((company) => {
            const stockData = stockDataMap.get(company.code);
            const isPositive =
              stockData && parseFloat(stockData.priceChange) >= 0;
            const changeColor = isPositive ? 'text-red-500' : 'text-blue-500';
            const isSelected = selectedSymbols.includes(company.code);

            return (
              <React.Fragment key={company.code}>
                <tr
                  className={`cursor-pointer hover:bg-gray-50 ${
                    isSelected ? 'bg-gray-50' : ''
                  } border-b`}
                  onClick={() => onSymbolSelect(company.code)}
                >
                  <td className="w-1/4 py-5 text-center text-lg font-medium">
                    {company.name}
                  </td>
                  <td className="w-1/4"></td>
                  {stockData ? (
                    <>
                      <td className="w-1/6 px-2 py-5 text-center">
                        {formatNumber(stockData.currentPrice)}
                      </td>
                      <td
                        className={`px-2 py-5 text-center ${changeColor} w-1/6`}
                      >
                        <div className="flex items-center justify-center">
                          <Image
                            src={isPositive ? stockup : stockdown}
                            alt={`${isPositive ? '상승' : '하락'}`}
                            width={8}
                            height={8}
                            className="mr-1"
                          />
                          {formatNumber(
                            Math.abs(parseFloat(stockData.priceChange)),
                          )}
                          ({parseFloat(stockData.priceChangeRate).toFixed(2)}%)
                        </div>
                      </td>
                      <td className="w-1/6 px-2 py-5 text-center">
                        {formatNumber(stockData.totalVolume)}
                      </td>
                    </>
                  ) : (
                    <td colSpan={3} className="text-center">
                      데이터 없음
                    </td>
                  )}
                </tr>
                {isSelected && (
                  <tr>
                    <td colSpan={5}>
                      <StockChart symbol={company.code} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
