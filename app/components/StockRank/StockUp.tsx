'use client';
import { useEffect, useState } from 'react';
import { fetchUpStock } from '../../utils/kisApi/stock-up';

export default function StockUp() {
  const [upStock, setUpStock] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchUpStock();
      setUpStock(data);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1>상승 주식 순위</h1>
      {upStock && upStock.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>순위</th>
              <th>종목명</th>
              <th>현재가</th>
              <th>변동량</th>
              <th>변동률</th>
              <th>거래량</th>
            </tr>
          </thead>
          <tbody>
            {upStock.map((stock) => (
              <tr key={stock.stck_shrn_iscd}>
                <td>{stock.data_rank}</td>
                <td>{stock.hts_kor_isnm}</td>
                <td>{stock.stck_prpr}</td>
                <td>
                  {stock.prdy_vrss} {stock.prdy_vrss_sign === '2' ? '▲' : '▼'}
                </td>
                <td>{stock.prdy_ctrt}%</td>
                <td>{stock.acml_vol}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>데이터를 가져오는 중입니다...</p>
      )}
    </div>
  );
}
