'use client';

import React from 'react';
import StockRank from './StockRank.tsx';
import StockCapitalization from './StockCapitalization.tsx';

type Tab = {
  name: string;
  component: JSX.Element;
};

const tabs: Tab[] = [
  { name: '거래 상위', component: <StockRank /> },
  { name: '시가총액 상위', component: <StockCapitalization /> },
];

export default function Table({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const activeTab = searchParams.tab ? parseInt(searchParams.tab) : 0;
  const ActiveComponent = tabs[activeTab]?.component || tabs[0].component;

  return (
    <div className="mx-auto">
      <h2 className="mb-4 text-2xl font-semibold">TOP 종목</h2>

      <div className="tabs flex">
        {tabs.map((tab, index) => (
          <a
            key={index}
            href={`?tab=${index}`} // URL을 변경하여 서버에서 새로운 탭 로드
            className={`tab rounded-lg px-4 py-2 font-semibold hover:bg-g-100 ${
              activeTab === index ? 'text-bk' : 'text-g-700 hover:text-bk'
            }`}
          >
            {tab.name}
          </a>
        ))}
      </div>

      <div className="tab-content mt-4">{ActiveComponent}</div>
    </div>
  );
}
