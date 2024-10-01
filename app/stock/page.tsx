import { fetchTopStocks } from '../utils/kisApi';

export default async function StockPage() {
  const topStocks = await fetchTopStocks();

  return (
    <div>
      <h1>주식 데이터</h1>
      {topStocks ? (
        <ul>
          {topStocks.map((stock: any, index: number) => (
            <li key={index}>
              {index + 1}. {stock.hts_kor_isnm} - 현재가 : {stock.stck_prpr} -
              전일 대비 가격 변동률: {stock.prdy_ctrt}%
            </li>
          ))}
        </ul>
      ) : (
        <p>주식 데이터를 불러오는 중입니다...</p>
      )}
    </div>
  );
}
