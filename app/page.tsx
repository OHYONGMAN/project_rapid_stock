import StockMarket from './components/StockMarket/StockMarket';
import StockTable from './components/StockRank/StockTable';
import MainNews from './components/News/News';
import './globals.css';

export default function Home({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  return (
    <div className="container mx-auto flex flex-col">
      <div className="container mx-auto flex gap-8 py-12   .">
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
