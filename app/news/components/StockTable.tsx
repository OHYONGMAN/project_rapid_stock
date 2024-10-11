// app/news/components/StockTable.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { connectWebSocket } from '@/app/utils/kisApi/websocket';

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
  askPrice: number;
  bidPrice: number;
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
    let disconnect: (() => void) | null = null;

    const setupWebSocket = async () => {
      try {
        disconnect = await connectWebSocket(symbol, handleRealTimeData);
      } catch (error) {
        console.error('웹소켓 연결 중 오류:', error);
        setError('웹소켓 연결에 실패했습니다.');
      }
    };

    setupWebSocket();

    return () => {
      if (disconnect) {
        disconnect();
      }
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
