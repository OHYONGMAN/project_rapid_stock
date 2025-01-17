import React from 'react';
import StockMarket from './components/StockMarket/StockMarket.tsx';
import StockTable from './components/StockRank/StockTable.tsx';
import MainNews from './components/News/News.tsx';
import './globals.css';

export default function Home({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  return (
    <div className="container mx-auto flex flex-col  pb-16">
      <div className="container mx-auto flex gap-8 py-12">
        <div className="w-full">
          <StockTable searchParams={searchParams} />
        </div>
        <div className="w-[40vw]">
          <StockMarket />
        </div>
      </div>
      <MainNews />
    </div>
  );
}
