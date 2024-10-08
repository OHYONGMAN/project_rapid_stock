// app/news/components/StockChart.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { fetchStockData } from '@/app/utils/kisApi/fetchStockData';

interface StockData {
  date: string; // Date 대신 string 사용
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function StockChart() {
  const [symbol, setSymbol] = useState('000660');
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchStockData(symbol);
        setStockData(data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch stock data:', error);
        setError('Failed to load stock data. Please try again later.');
      }
    };

    loadData();
  }, [symbol]);

  const formatDate = (dateString: string) => {
    // 'YYYYMMDD' 형식의 문자열을 'YYYY-MM-DD' 형식으로 변환
    return `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
  };

  return (
    <div className="w-full max-w-md">
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
        placeholder="종목 코드를 입력하세요"
      />
      {error && <p className="text-red-500">{error}</p>}
      {stockData.length > 0 ? (
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-2xl font-bold mb-2">{symbol} 주가 정보</h2>
          {stockData.map((data, index) => (
            <div key={index} className="mb-4 pb-2 border-b">
              <p>
                <strong>날짜:</strong> {formatDate(data.date)}
              </p>
              <p>
                <strong>시가:</strong> {data.open.toLocaleString()} 원
              </p>
              <p>
                <strong>고가:</strong> {data.high.toLocaleString()} 원
              </p>
              <p>
                <strong>저가:</strong> {data.low.toLocaleString()} 원
              </p>
              <p>
                <strong>종가:</strong> {data.close.toLocaleString()} 원
              </p>
              <p>
                <strong>거래량:</strong> {data.volume.toLocaleString()} 주
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>로딩 중...</p>
      )}
    </div>
  );
}
