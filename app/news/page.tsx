import React from 'react';
import StockChart from './components/StockChart';

export default function NewsPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">주식 차트</h1>
      <StockChart />
    </div>
  );
}
