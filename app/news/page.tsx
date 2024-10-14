'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// 컴포넌트 동적 로딩 설정 (서버 사이드 렌더링 제외)
// 이는 'devextreme-react'와 같은 클라이언트 전용 라이브러리를 사용할 때 필요
const StockChart = dynamic(() => import('./components/StockChart'), {
  ssr: false, // 서버 사이드 렌더링 비활성화
});

const StockTable = dynamic(() => import('./components/StockTable'), {
  ssr: false, // 서버 사이드 렌더링 비활성화
});

// 뉴스 페이지 컴포넌트 정의
export default function NewsPageLayout() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Stock News and Prices</h1>
      <StockChart /> {/* 주식 차트 컴포넌트 렌더링 */}
      <StockTable /> {/* 주식 테이블 컴포넌트 렌더링 */}
    </main>
  );
}
