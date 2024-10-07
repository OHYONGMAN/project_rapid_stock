// app/news/components/NewsPage.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { connectWebSocket, closeWebSocket } from '@/app/utils/kisApi/websocket';

interface StockPrice {
  stck_prpr: number | string;
  stck_oprc: number | string;
  stck_hgpr: number | string;
  stck_lwpr: number | string;
  cntg_vol: number | string;
  acml_vol: number | string;
  prdy_vrss: number | string;
  prdy_ctrt: number | string;
}

export default function NewsPage() {
  const [symbol, setSymbol] = useState('000660');
  const [stockPrice, setStockPrice] = useState<StockPrice | null>(null);
  const [error, setError] = useState<string | null>(null);

  // REST API로 초기 데이터 가져오기
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch('/api/fetchStockData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ symbol }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch initial stock data');
        }

        const data = await response.json();
        const stockData = data.output2[0]; // 첫 번째 데이터 사용

        // 초기 데이터 설정
        setStockPrice({
          stck_prpr: stockData.stck_clpr,
          stck_oprc: stockData.stck_oprc,
          stck_hgpr: stockData.stck_hgpr,
          stck_lwpr: stockData.stck_lwpr,
          cntg_vol: stockData.cntg_vol,
          acml_vol: stockData.acml_vol,
          prdy_vrss: stockData.prdy_vrss,
          prdy_ctrt: stockData.prdy_ctrt,
        });
      } catch (error) {
        console.error(error);
        setError((error as Error).message);
      }
    };

    fetchInitialData();
  }, [symbol]);

  // WebSocket 연결 및 메시지 처리
  useEffect(() => {
    const handleWebSocketMessage = (data: any) => {
      console.log('Received WebSocket message:', data);
      try {
        // JSON 객체가 아니면 파싱
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }

        // 구독 성공 메시지 무시
        if (
          data.body.msg_cd === 'OPSP0000' &&
          data.body.msg1 === 'SUBSCRIBE SUCCESS'
        ) {
          console.log('WebSocket subscription successful');
          return;
        }

        // 주식 데이터 처리
        if (data.body && data.body.output) {
          const stockData = data.body.output;
          setStockPrice((prevState) => ({
            ...prevState,
            stck_prpr: stockData.stck_prpr || prevState?.stck_prpr,
            stck_oprc: stockData.stck_oprc || prevState?.stck_oprc,
            stck_hgpr: stockData.stck_hgpr || prevState?.stck_hgpr,
            stck_lwpr: stockData.stck_lwpr || prevState?.stck_lwpr,
            cntg_vol: stockData.cntg_vol || prevState?.cntg_vol,
            acml_vol: stockData.acml_vol || prevState?.acml_vol,
            prdy_vrss: stockData.prdy_vrss || prevState?.prdy_vrss,
            prdy_ctrt: stockData.prdy_ctrt || prevState?.prdy_ctrt,
          }));
        } else {
          console.error('Invalid stock data format:', data);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    const connect = async () => {
      const closeWebSocketConnection = await connectWebSocket(
        symbol,
        handleWebSocketMessage,
      );
      return closeWebSocketConnection;
    };

    let closeWebSocketConnection: () => void;

    connect().then((closeFn) => {
      closeWebSocketConnection = closeFn;
    });

    return () => {
      if (closeWebSocketConnection) {
        closeWebSocketConnection();
      }
      closeWebSocket();
    };
  }, [symbol]);

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
          <p>주식 현재가: {stockPrice.stck_prpr} 원</p>
          <p>시가: {stockPrice.stck_oprc} 원</p>
          <p>고가: {stockPrice.stck_hgpr} 원</p>
          <p>저가: {stockPrice.stck_lwpr} 원</p>
          <p>체결 거래량: {stockPrice.cntg_vol} 주</p>
          <p>거래량: {stockPrice.acml_vol} 주</p>
          <p>전일 대비: {stockPrice.prdy_vrss} 원</p>
          <p>전일 대비율: {stockPrice.prdy_ctrt}%</p>
        </div>
      ) : (
        <p>로딩 중...</p>
      )}
    </div>
  );
}
