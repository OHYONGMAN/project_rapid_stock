import React from 'react';
import StockMarket from './components/StockMarket/StockMarket.tsx';
import StockTable from './components/StockRank/StockTable.tsx';

export default function Home({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  return (
    <div className="container mx-auto flex gap-20 py-12">
      <div className="w-full">
        <StockTable searchParams={searchParams} />
      </div>
      <div className="w-[40vw]">
        <StockMarket />
      </div>
    </div>
  );
}
