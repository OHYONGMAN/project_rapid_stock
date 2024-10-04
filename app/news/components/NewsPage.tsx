'use client';

import { useState, useEffect } from 'react';
import { fetchStockPrice } from '@/app/api/fetchStockData/route';
import { connectWebSocket, closeWebSocket } from '@/app/utils/kisApi/websocket';

interface StockPrice {
  stck_prpr: number;
  prdy_vrss: number;
  prdy_ctrt: number;
  acml_vol: number;
}

export default function NewsPage() {
  const [symbol, setSymbol] = useState('000660');
  const [stockPrice, setStockPrice] = useState<StockPrice | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const data = await fetchStockPrice(symbol);
        setStockPrice(data);
      } catch (error) {
        console.error('Error fetching initial stock price:', error);
        setError('Failed to fetch initial stock price.');
      }
    };

    const handleWebSocketMessage = (data: any) => {
      setStockPrice((prevState) => ({
        ...prevState,
        stck_prpr: data.stck_prpr || prevState?.stck_prpr,
        prdy_vrss: data.prdy_vrss || prevState?.prdy_vrss,
        prdy_ctrt: data.prdy_ctrt || prevState?.prdy_ctrt,
        acml_vol: data.acml_vol || prevState?.acml_vol,
      }));
    };

    fetchInitialData();
    const closeWebSocketConnection = connectWebSocket(
      symbol,
      handleWebSocketMessage,
    );

    return () => {
      closeWebSocketConnection.then((closeFn) => {
        closeFn();
      });
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
          <p>Current Price: {stockPrice.stck_prpr}</p>
          <p>Change: {stockPrice.prdy_vrss}</p>
          <p>Change Rate: {stockPrice.prdy_ctrt}%</p>
          <p>Volume: {stockPrice.acml_vol}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
