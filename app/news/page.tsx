// app/news/page.tsx

'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// 컴포넌트 동적 로딩 (SSR 제외)
const StockDailyChart = dynamic(() => import('./components/StockDailyChart'), {
  ssr: false,
});

const StockMinuteChart = dynamic(
  () => import('./components/StockMinuteChart'),
  {
    ssr: false,
  },
);

export default function NewsPageLayout() {
  const [timeUnit, setTimeUnit] = useState<'D' | 'M1'>('D'); // 일봉(D), 분봉(M1) 상태 관리

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Stock News and Prices</h1>

      {/* 일봉 및 분봉 선택 버튼 */}
      <div className="mb-4">
        <button
          onClick={() => setTimeUnit('D')} // 일봉 버튼 클릭 시 상태 변경
          className={`mr-2 px-4 py-2 rounded ${timeUnit === 'D' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          일봉
        </button>
        <button
          onClick={() => setTimeUnit('M1')} // 분봉 버튼 클릭 시 상태 변경
          className={`px-4 py-2 rounded ${timeUnit === 'M1' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          분봉
        </button>
      </div>

      {/* 조건부 컴포넌트 렌더링 */}
      {timeUnit === 'D' ? (
        <StockDailyChart /> // 일봉 차트 컴포넌트
      ) : (
        <StockMinuteChart /> // 분봉 차트 컴포넌트
      )}
    </main>
  );
}
