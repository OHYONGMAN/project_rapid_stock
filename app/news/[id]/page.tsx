'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// 컴포넌트 동적 로딩 설정 (서버 사이드 렌더링 제외)
const StockChart = dynamic(() => import('./components/StockChart.tsx'), {
  ssr: false,
});

const StockTable = dynamic(() => import('./components/StockTable.tsx'), {
  ssr: false,
});

export default function NewsPageLayout() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol((prevSymbol) => (prevSymbol === symbol ? null : symbol));
  };

  return (
    <div className="w-full">
      <StockTable onSymbolSelect={handleSymbolSelect} />
      {selectedSymbol && <StockChart symbol={selectedSymbol} />}
    </div>
  );
}
