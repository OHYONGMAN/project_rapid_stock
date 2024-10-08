// app/news/components/NewsPage.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { connectWebSocket, closeWebSocket } from '@/app/utils/kisApi/websocket';

interface StockPrice {
  stck_prpr: number;
  stck_oprc: number;
  stck_hgpr: number;
  stck_lwpr: number;
  cntg_vol: number;
  acml_vol: number;
  prdy_vrss: number;
  prdy_ctrt: number;
  prdy_vrss_sign: string;
}

export default function NewsPage() {
  const [symbol, setSymbol] = useState('000660');
  const [stockPrice, setStockPrice] = useState<StockPrice | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(`/api/stockData?symbol=${symbol}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Invalid data received from API');
        }
        const stockData = data[0];
        setStockPrice({
          stck_prpr: parseFloat(stockData.close) || 0,
          stck_oprc: parseFloat(stockData.open) || 0,
          stck_hgpr: parseFloat(stockData.high) || 0,
          stck_lwpr: parseFloat(stockData.low) || 0,
          cntg_vol: parseFloat(stockData.volume) || 0,
          acml_vol: parseFloat(stockData.volume) || 0,
          prdy_vrss: parseFloat(stockData.prdy_vrss) || 0,
          prdy_ctrt: parseFloat(stockData.prdy_ctrt) || 0,
          prdy_vrss_sign: stockData.prdy_vrss_sign || '3', // '3'은 보합을 의미
        });
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError(
          `Failed to fetch initial stock data: ${(error as Error).message}`,
        );
      }
    };

    fetchInitialData();
  }, [symbol]);

  useEffect(() => {
    const handleWebSocketMessage = (data: StockPrice) => {
      setStockPrice((prevState) => ({
        ...prevState,
        ...data,
      }));
    };

    let closeWebSocketConnection: (() => void) | undefined;

    const connect = async () => {
      try {
        closeWebSocketConnection = await connectWebSocket(
          symbol,
          handleWebSocketMessage,
        );
      } catch (error) {
        console.error('WebSocket connection error:', error);
        setError(`Failed to connect to WebSocket: ${(error as Error).message}`);
      }
    };

    connect();

    return () => {
      if (closeWebSocketConnection) {
        closeWebSocketConnection();
      }
      closeWebSocket();
    };
  }, [symbol]);
  const formatChangeDirection = (changeSign: string, value: number) => {
    if (changeSign === '1') return `▲ ${value.toLocaleString()}`;
    if (changeSign === '2') return `▼ ${value.toLocaleString()}`;
    return value.toLocaleString();
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
      {stockPrice ? (
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-2xl font-bold mb-2">{symbol}</h2>
          <p>주식 현재가: {stockPrice.stck_prpr.toLocaleString()} 원</p>
          <p>시가: {stockPrice.stck_oprc.toLocaleString()} 원</p>
          <p>고가: {stockPrice.stck_hgpr.toLocaleString()} 원</p>
          <p>저가: {stockPrice.stck_lwpr.toLocaleString()} 원</p>
          <p>체결 거래량: {stockPrice.cntg_vol.toLocaleString()} 주</p>
          <p>누적 거래량: {stockPrice.acml_vol.toLocaleString()} 주</p>
          <p>
            전일 대비:{' '}
            {formatChangeDirection(
              stockPrice.prdy_vrss_sign,
              stockPrice.prdy_vrss,
            )}{' '}
            원
          </p>
          <p>
            전일 대비율:{' '}
            {formatChangeDirection(
              stockPrice.prdy_vrss_sign,
              stockPrice.prdy_ctrt,
            )}
            %
          </p>
        </div>
      ) : (
        <p>로딩 중...</p>
      )}
    </div>
  );
}
