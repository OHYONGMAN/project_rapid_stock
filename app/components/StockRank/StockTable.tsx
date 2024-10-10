'use client';
import { useState } from 'react';
import StockRank from './StockRank';
import StockUp from './StockUp';

type Tab = {
  name: string;
  component: React.ComponentType;
};

const tabs: Tab[] = [
  { name: '거래 상위', component: StockRank },
  { name: '상승', component: StockUp },
];

export default function Table() {
  const [activeTab, setActiveTab] = useState(0);
  const ActiveComponent = tabs[activeTab].component;

  return (
    <div className="max-w-4xl mx-auto mr-20">
      <h2 className="text-2xl font-semibold mb-4">TOP 종목</h2>
      <div className="tabs flex">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`tab px-4 py-2 font-semibold rounded-lg hover:bg-g-100 ${
              activeTab === index ? 'text-bk' : 'text-g-700 hover:text-bk'
            }`}
            onClick={() => {
              console.log(`Switching to tab: ${tab.name}`);
              setActiveTab(index);
            }}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="tab-content mt-4">
        <ActiveComponent />
      </div>
    </div>
  );
}
