import { stockMarketData } from '@/app/utils/kisApi/stockData';

export default async function StockMarket() {
  const topStock = await stockMarketData();

  return (
    <div className="max-w-4xl mx-auto mt-16">
      <h2 className="text-2xl font-semibold mb-4">TOP 종목</h2>
      <h3 className="text-lg font-semibold mb-4">거래 상위</h3>
      {topStock ? (
        <table className="w-full table-auto border-collapse text-center border-t-2 border-black">
          <thead>
            <tr className="border-b">
              <th className="py-4">종목명</th>
              <th className="py-4">종목 코드</th>
              <th className="py-4">현재가</th>
              <th className="py-4">전일 대비</th>
              <th className="py-4">변동률</th>
            </tr>
          </thead>
          <tbody>
            {topStock.map((stock: any, index: number) => (
              <tr key={index} className="border-b hover:bg-g-100">
                <td className="py-4 px-2">{stock.hts_kor_isnm}</td>
                <td className="py-4 px-2">{stock.mksc_shrn_iscd}</td>
                <td className="py-4 px-2">{stock.vi_prc}</td>
                <td
                  className={`py-4 px-2 ${
                    stock.vi_dmc_dprt > 0 ? 'text-primary' : 'text-blue-500'
                  }`}
                >
                  {stock.vi_dmc_dprt > 0
                    ? `+${stock.vi_dmc_dprt}%`
                    : `${stock.vi_dmc_dprt}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>주식 데이터를 불러오는 중입니다...</p>
      )}
    </div>
  );
}
