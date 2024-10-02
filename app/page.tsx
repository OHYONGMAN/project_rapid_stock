import StockRank from './components/StockRank/StockRank';
import StockMarket from './components/StockMarket/StockMarket';

export default function Home() {
  return (
    <div className="mx-auto w-[1442px] py-[60px] px-[80px]">
      {' '}
      {/* 전체 너비, 패딩 설정 */}
      <div className="flex">
        <div className="flex-1">
          <StockRank />
        </div>
        <div className="w-96">
          {' '}
          {/* StockMarket 컴포넌트 너비 */}
          <StockMarket />
        </div>
      </div>
    </div>
  );
}
