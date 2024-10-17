import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import stockup from '../../../../public/images/ico-stockup.svg';
import stockdown from '../../../../public/images/ico-stockdown.svg';
import {
  fetchTodayStockData,
  StockData,
} from '../../../utils/kisApi/todayStock.ts';
import StockChart from './StockChart';
import WebSocketManager from '../../../utils/kisApi/websocketManager.ts';

interface RelatedCompany {
  name: string;
  code: string;
}

interface StockTableProps {
  relatedCompanies?: RelatedCompany[];
  onSymbolSelect: (symbol: string) => void;
  selectedSymbol: string | null;
}

interface WebSocketStockData {
  symbol: string;
  time: string;
  price: number;
  change: number;
  changeRate: number;
  volume: number;
  changeSign: string;
}

interface ExtendedStockData extends StockData {
  changeSign: string;
}

const formatNumber = (num: string | number): string => {
  return new Intl.NumberFormat('ko-KR').format(Number(num));
};

export default function StockTable({
  relatedCompanies = [],
  onSymbolSelect,
  selectedSymbol,
}: StockTableProps) {
  const [stockDataMap, setStockDataMap] = useState<
    Map<string, ExtendedStockData>
  >(new Map());
  const [error, setError] = useState<string | null>(null);

  const loadStockData = useCallback(async () => {
    if (relatedCompanies.length === 0) {
      setError('관련 종목이 없습니다.');
      return;
    }

    const newStockDataMap = new Map<string, ExtendedStockData>();
    for (const company of relatedCompanies) {
      try {
        const data = await fetchTodayStockData(company.code);
        newStockDataMap.set(company.code, {
          ...data,
          changeSign: parseFloat(data.priceChange) >= 0 ? '1' : '5',
        });
      } catch (err) {
        console.error(`데이터 로딩 중 에러 (${company.name}):`, err);
      }
    }
    setStockDataMap(newStockDataMap);
    setError(null);
  }, [relatedCompanies]);

  useEffect(() => {
    loadStockData();

    const handleWebSocketMessage = (data: WebSocketStockData) => {
      setStockDataMap((prevMap) => {
        const newMap = new Map(prevMap);
        const currentData = newMap.get(data.symbol);
        if (currentData) {
          newMap.set(data.symbol, {
            ...currentData,
            currentPrice: data.price.toString(),
            priceChange: data.change.toString(),
            priceChangeRate: data.changeRate.toString(),
            totalVolume: data.volume.toString(),
            changeSign: data.changeSign,
          });
        }
        return newMap;
      });
    };

    relatedCompanies.forEach((company) => {
      WebSocketManager.subscribe(company.code, handleWebSocketMessage);
    });

    return () => {
      relatedCompanies.forEach((company) => {
        WebSocketManager.unsubscribe(company.code, handleWebSocketMessage);
      });
    };
  }, [loadStockData, relatedCompanies]);

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (relatedCompanies.length === 0) {
    return <p className="text-center">관련 종목이 없습니다.</p>;
  }

  return (
    <section>
      <h2 className="mb-6 text-2xl font-semibold">관련 종목</h2>

      <table className="w-full min-w-full">
        {/* ... (테이블 구조는 그대로 유지) ... */}
        <tbody className="overflow-x-auto border-t-2 border-black">
          {relatedCompanies.map((company) => {
            const stockData = stockDataMap.get(company.code);
            const isPositive =
              stockData &&
              (stockData.changeSign === '1' || stockData.changeSign === '2');
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
                  <td className="px-2 py-5 text-center text-lg font-medium">
                    {company.name}
                  </td>
                  <td aria-hidden="true"></td>
                  {stockData ? (
                    <>
                      <td className={`px-2 py-5 text-center ${changeColor}`}>
                        {formatNumber(stockData.currentPrice)}
                      </td>
                      <td className={`px-2 py-5 text-center ${changeColor}`}>
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
                      <td className={`px-2 py-5 text-center ${changeColor}`}>
                        {formatNumber(stockData.totalVolume)}
                      </td>
                    </>
                  ) : (
                    <td colSpan={3} className="text-center">
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
    </section>
  );
}
