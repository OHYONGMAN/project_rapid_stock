import StockMarket from './components/StockMarket/StockMarket';
import StockTable from './components/StockRank/StockTable';
import StockUp from './components/StockRank/StockUp';

export default function Home() {
  return (
    <div className="mx-auto w-[1442px] py-[60px] px-[80px]">
      <div className="flex">
        <div className="flex-1">
          <StockTable />
          <StockUp />
        </div>
        <div className="w-96">
          <StockMarket />
        </div>
      </div>
    </div>
  );
}
