'use client';

import React from 'react';
import StockChart from '../components/StockChart/StockChart';

export default function DetailPage() {
  return (
    <div>
      <h1>실시간 주식 차트</h1>
      <StockChart />
    </div>
  );
}
