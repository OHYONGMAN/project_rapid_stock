import StockMarket from './components/StockMarket/StockMarket';
import StockTable from './components/StockRank/StockTable';

export default function Home({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  return (
    <div className="mx-auto w-[1442px] py-[60px] px-[80px]">
      <div className="flex">
        <div className="flex-1">
          <StockTable searchParams={searchParams} />
        </div>
        <div className="w-96">
          <StockMarket />
        </div>
      </div>
    </div>
  );
}
