'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchTodayStockData, StockData } from '@/app/utils/kisApi/todayStock';

interface StockTableProps {
  onSymbolSelect: (symbol: string) => void;
}

const formatNumber = (num: string) =>
  new Intl.NumberFormat('ko-KR').format(Number(num));

export default function StockTable({ onSymbolSelect }: StockTableProps) {
  const [symbol, setSymbol] = useState('005930');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    try {
      const data = await fetchTodayStockData(symbol);
      console.log('받아온 데이터:', data);
      setStockData(data);
      setError(null);
    } catch (err) {
      console.error('데이터 로딩 중 에러:', err);
      setError('데이터를 불러오는 데 실패했습니다.');
      setStockData(null);
    }
  }, [symbol]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loadInitialData();
  };

  const handleTableClick = () => {
    onSymbolSelect(symbol);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="w-full rounded border p-2"
          placeholder="종목 코드를 입력하세요"
        />
        <button
          type="submit"
          className="mt-2 rounded bg-blue-500 px-4 py-2 text-white"
        >
          검색
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      {stockData && (
        <table className="w-full cursor-pointer" onClick={handleTableClick}>
          <thead>
            <tr>
              <th>현재가</th>
              <th>전일 대비</th>
              <th>전일 대비율</th>
              <th>거래량</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{formatNumber(stockData.currentPrice)} 원</td>
              <td>{formatNumber(stockData.priceChange)} 원</td>
              <td>{stockData.priceChangeRate}%</td>
              <td>{formatNumber(stockData.totalVolume)} 주</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
