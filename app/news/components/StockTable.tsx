// app/news/components/StockTable.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import webSocketManager from '@/app/utils/kisApi/websocketManager';

interface RealTimeData {
  symbol: string;
  time: string;
  price: number;
  change: number;
  changeRate: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  changeSign: string;
}

const formatNumber = new Intl.NumberFormat('ko-KR', {
  minimumFractionDigits: 0,
}).format;

export default function StockTable() {
  const [symbol, setSymbol] = useState('005930');
  const [stockData, setStockData] = useState<RealTimeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRealTimeData = useCallback((data: RealTimeData) => {
    setStockData(data);
  }, []);

  useEffect(() => {
    webSocketManager.subscribe(symbol, handleRealTimeData);

    return () => {
      webSocketManager.unsubscribe(symbol, handleRealTimeData);
    };
  }, [symbol, handleRealTimeData]);

  return (
    <div className="w-full">
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
        placeholder="종목 코드를 입력하세요"
      />
      {error && <p className="text-red-500">{error}</p>}
      {stockData ? (
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">현재가</th>
              <th className="border p-2">전일 대비</th>
              <th className="border p-2">전일 대비율</th>
              <th className="border p-2">거래량</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">{formatNumber(stockData.price)} 원</td>
              <td className="border p-2">
                {formatNumber(stockData.change)} 원
              </td>
              <td className="border p-2">{stockData.changeRate.toFixed(2)}%</td>
              <td className="border p-2">
                {formatNumber(stockData.volume)} 주
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p>데이터를 로딩 중입니다...</p>
      )}
    </div>
  );
}
