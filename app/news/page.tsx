// app/news/page.tsx

'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const StockCharts = dynamic(() => import('./components/StockCharts'), {
  ssr: false,
});

export default function NewsPageLayout() {
  const [timeUnit, setTimeUnit] = useState<'D' | 'M1'>('D');

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Stock News and Prices</h1>
      <div className="mb-4">
        <button
          onClick={() => setTimeUnit('D')}
          className={`mr-2 px-4 py-2 rounded ${timeUnit === 'D' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          일봉
        </button>
        <button
          onClick={() => setTimeUnit('M1')}
          className={`px-4 py-2 rounded ${timeUnit === 'M1' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          분봉
        </button>
      </div>
      <StockCharts timeUnit={timeUnit} />
    </main>
  );
}
