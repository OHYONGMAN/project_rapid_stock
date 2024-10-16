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
  selectedSymbol: string | null;
}

const formatNumber = (num: string | number): string => {
  return new Intl.NumberFormat('ko-KR').format(Number(num));
};

export default function StockTable({
  relatedCompanies = [],
  onSymbolSelect,
  selectedSymbol,
}: StockTableProps) {
  const [stockDataMap, setStockDataMap] = useState<Map<string, StockData>>(
    new Map(),
  );
  const [error, setError] = useState<string | null>(null);

  const loadStockData = useCallback(async () => {
    if (relatedCompanies.length === 0) {
      setError('관련 종목이 없습니다.');
      return;
    }

    const newStockDataMap = new Map<string, StockData>();
    for (const company of relatedCompanies) {
      try {
        const data = await fetchTodayStockData(company.code);
        newStockDataMap.set(company.code, data);
      } catch (err) {
        console.error(`데이터 로딩 중 에러 (${company.name}):`, err);
      }
    }
    setStockDataMap(newStockDataMap);
    setError(null);
  }, [relatedCompanies]);

  useEffect(() => {
    loadStockData();
  }, [loadStockData]);

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (relatedCompanies.length === 0) {
    return <p className="text-center">관련 종목이 없습니다.</p>;
  }

  return (
    <div className="overflow-x-auto border-t-2 border-black">
      <table className="w-full min-w-full">
        <colgroup>
          <col className="w-1/5" />
          <col className="w-[30%]" />
          <col className="w-1/5" />
          <col className="w-[15%]" />
          <col className="w-[15%]" />
        </colgroup>
        <thead className="sr-only">
          <tr>
            <th scope="col">종목명</th>
            <th scope="col" aria-hidden="true"></th>
            <th scope="col">현재가</th>
            <th scope="col">등락</th>
            <th scope="col">거래량</th>
          </tr>
        </thead>
        <tbody>
          {relatedCompanies.map((company, index) => {
            const stockData = stockDataMap.get(company.code);
            const isPositive = stockData && stockData.priceChange >= 0;
            const changeColor = isPositive ? 'text-red-500' : 'text-blue-500';
            const isSelected = company.code === selectedSymbol;

            return (
              <React.Fragment key={company.code}>
                <tr
                  className={`cursor-pointer hover:bg-gray-50 ${
                    isSelected ? 'bg-gray-50' : ''
                  } border-b`}
                  onClick={() => onSymbolSelect(company.code)}
                >
                  <td className="px-6 py-4 text-center">
                    <div className="font-medium">{company.name}</div>
                  </td>
                  <td className="px-6 py-4" aria-hidden="true"></td>
                  {stockData ? (
                    <>
                      <td className={`px-6 py-4 text-center ${changeColor}`}>
                        {formatNumber(stockData.currentPrice)}
                      </td>
                      <td className={`px-6 py-4 text-center ${changeColor}`}>
                        <div className="flex items-center justify-center">
                          <Image
                            src={isPositive ? stockup : stockdown}
                            alt={`${isPositive ? '상승' : '하락'}`}
                            width={8}
                            height={8}
                            className="mr-1"
                          />
                          {formatNumber(Math.abs(stockData.priceChange))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {formatNumber(stockData.totalVolume)}
                      </td>
                    </>
                  ) : (
                    <td colSpan={3} className="px-6 py-4 text-center">
                      데이터 로딩 중...
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
    </div>
  );
}
