// app/news/page.tsx

'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// 컴포넌트 동적 로딩 (SSR 제외)
const StockChart = dynamic(() => import('./components/StockChart'), {
  ssr: false,
});

const StockTable = dynamic(() => import('./components/StockTable'), {
  ssr: false,
});

export default function NewsPageLayout() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Stock News and Prices</h1>
      <StockChart />
      <StockTable />
    </main>
  );
}
