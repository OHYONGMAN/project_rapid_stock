// app/news/components/NewsPage.tsx

'use client';

import { useState, useEffect } from 'react';
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

  // WebSocket 연결 및 메시지 처리
  useEffect(() => {
    const handleWebSocketMessage = (data: string) => {
      try {
        // 구독 성공 메시지 무시
        if (data.includes('SUBSCRIBE SUCCESS')) {
          console.log('WebSocket subscription successful');
          return;
        }

        // 필요한 데이터 추출
        const parsedData = data.split('|');
        const stockData = parsedData[3]?.split('^');

        if (stockData && stockData.length >= 13) {
          setStockPrice((prevState) => {
            const currentState: StockPrice = prevState || {
              stck_prpr: 0,
              stck_oprc: 0,
              stck_hgpr: 0,
              stck_lwpr: 0,
              cntg_vol: 0,
              acml_vol: 0,
              prdy_vrss: 0,
              prdy_ctrt: 0,
            };

            return {
              ...currentState,
              stck_prpr: stockData[2]
                ? Number(stockData[2]).toLocaleString()
                : 0, // 주식 현재가
              stck_oprc: stockData[6]
                ? Number(stockData[6]).toLocaleString()
                : 0, // 시가
              stck_hgpr: stockData[7]
                ? Number(stockData[7]).toLocaleString()
                : 0, // 고가
              stck_lwpr: stockData[8]
                ? Number(stockData[8]).toLocaleString()
                : 0, // 저가
              cntg_vol: stockData[12]
                ? Number(stockData[12]).toLocaleString()
                : 0, // 체결 거래량
              acml_vol: stockData[13]
                ? Number(stockData[13]).toLocaleString()
                : 0, // 누적 거래량
              prdy_vrss: stockData[4]
                ? Number(stockData[4]).toLocaleString()
                : 0, // 전일 대비
              prdy_ctrt: stockData[5]
                ? Number(stockData[5]).toLocaleString()
                : 0, // 전일 대비율
            };
          });
        } else {
          console.error('Invalid stock data format:', stockData);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', data, error);
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
        placeholder="Enter stock symbol"
      />
      {error && <p className="text-red-500">{error}</p>}
      {stockPrice ? (
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-2xl font-bold mb-2">{symbol}</h2>
          <p>주식 현재가: {stockPrice.stck_prpr}</p>
          <p>시가: {stockPrice.stck_oprc}</p>
          <p>고가: {stockPrice.stck_hgpr}</p>
          <p>저가: {stockPrice.stck_lwpr}</p>
          <p>체결 거래량: {stockPrice.cntg_vol}</p>
          <p>거래량: {stockPrice.acml_vol}</p>
          <p>전일 대비: {stockPrice.prdy_vrss}</p>
          <p>전일 대비율: {stockPrice.prdy_ctrt}%</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
