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
  MKSC_SHRN_ISCD: string; // 종목 코드
  STCK_CNTG_HOUR: string; // 체결 시간
  STCK_PRPR: string; // 현재가
  PRDY_VRSS_SIGN: string; // 전일 대비 부호
  PRDY_VRSS: string; // 전일 대비
  PRDY_CTRT: string; // 전일 대비율
  ACML_VOL: string; // 누적 거래량
}

interface ExtendedStockData extends StockData {
  currentPrice: number;
  priceChange: number;
  totalVolume: number;
  changeSign: string;
  changeRate: number;
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
          currentPrice: data.currentPrice,
          priceChange: data.priceChange,
          totalVolume: data.totalVolume,
          changeSign: data.priceChange >= 0 ? '1' : '5',
          changeRate:
            (data.priceChange / (data.currentPrice - data.priceChange)) * 100,
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

    relatedCompanies.forEach((company) => {
      const handleWebSocketMessage = (data: WebSocketStockData) => {
        setStockDataMap((prevMap) => {
          const newMap = new Map(prevMap);
          const currentData = newMap.get(data.MKSC_SHRN_ISCD);
          if (currentData) {
            newMap.set(data.MKSC_SHRN_ISCD, {
              ...currentData,
              currentPrice: parseFloat(data.STCK_PRPR),
              priceChange: parseFloat(data.PRDY_VRSS),
              totalVolume: parseFloat(data.ACML_VOL),
              changeSign: data.PRDY_VRSS_SIGN,
              changeRate: parseFloat(data.PRDY_CTRT),
            });
          }
          return newMap;
        });
      };

      WebSocketManager.subscribe(company.code, handleWebSocketMessage);
    });

    return () => {
      relatedCompanies.forEach((company) => {
        WebSocketManager.unsubscribe(company.code, () => {});
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
                          {formatNumber(Math.abs(stockData.priceChange))}(
                          {stockData.changeRate.toFixed(2)}%)
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
