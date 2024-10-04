import StockTable from './components/StockRank/StockRank';
import StockMarket from './components/StockMarket/StockMarket';
import StockUp from './components/StockRank/StockUp';
import StockRank from './components/StockRank/StockUp';

export default function Home() {
  return (
    <div className="mx-auto w-[1442px] py-[60px] px-[80px]">
      <div className="flex">
        <div className="flex-1">
          {/* <StockTable /> */}
          <StockRank />
          <StockUp />
        </div>
        <div className="w-96">
          <StockMarket />
        </div>
      </div>
    </div>
    <>
      <StockRank />
      <StockMarket />
    </>
  );
}
