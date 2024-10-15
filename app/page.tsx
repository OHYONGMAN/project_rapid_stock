import StockMarket from './components/StockMarket/StockMarket';
import StockTable from './components/StockRank/StockTable';

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
      <div className="w-96">
        <StockMarket />
      </div>
    </div>
  );
}
