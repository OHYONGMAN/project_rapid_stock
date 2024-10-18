'use client';

import React, { useState } from 'react';
import StockRank from './StockRank.tsx';
import StockCapitalization from './StockCapitalization.tsx';

const tabs = [
  { name: '거래 상위', component: <StockRank /> },
  { name: '시가총액 상위', component: <StockCapitalization /> },
];

export default function StockTable({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const [activeTab, setActiveTab] = useState(parseInt(searchParams.tab || '0'));

  return (
    <div className="mx-auto">
      <h2 className="mb-4 text-2xl font-semibold">TOP 종목</h2>

      <div className="tabs flex">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`tab rounded-lg px-4 py-2 font-semibold hover:bg-g-100 ${
              activeTab === index ? 'text-bk' : 'text-g-700 hover:text-bk'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="tab-content mt-4">{tabs[activeTab]?.component}</div>
    </div>
  );
}
