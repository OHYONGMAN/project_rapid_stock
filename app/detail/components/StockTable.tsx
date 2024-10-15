'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchTodayStockData, StockData } from '@/app/utils/kisApi/todayStock';
import webSocketManager from '@/app/utils/kisApi/websocketManager';

export default function StockTable() {
  const [symbol, setSymbol] = useState('005930'); // 종목 코드 상태 관리 (기본값: 삼성전자)
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    try {
      const data = await fetchTodayStockData(symbol);
      if (data && data.length > 0) {
        setStockData(data[0]);
      } else {
        setError('데이터를 불러오는 데 실패했습니다.');
      }
    } catch (err) {
      setError('데이터를 불러오는 데 실패했습니다.');
    }
  }, [symbol]);

  const handleRealTimeData = useCallback((data: StockData) => {
    setStockData(data);
  }, []);

  useEffect(() => {
    loadInitialData();
    webSocketManager.subscribe(symbol, handleRealTimeData);
    return () => {
      webSocketManager.unsubscribe(symbol, handleRealTimeData);
    };
  }, [symbol, handleRealTimeData, loadInitialData]);

  return (
    <div className="w-full">
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="w-full"
        placeholder="종목 코드를 입력하세요"
      />
      {error && <p className="text-red-500">{error}</p>}
      {stockData && (
        <table>
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
              <td>{stockData.currentPrice} 원</td>
              <td>{stockData.priceChange} 원</td>
              <td>{stockData.priceChangeRate}%</td>
              <td>{stockData.volume} 주</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
