import { getValidToken } from '../../utils/kisApi/token';
import Image from 'next/image';
import stockup from '../../../public/images/ico-stockup.svg';
import stockdown from '../../../public/images/ico-stockdown.svg';

export default async function StockDividends() {
  const url =
    'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/ranking/dividend-rate';
  const CLIENT_ID = process.env.NEXT_PUBLIC_KIS_API_KEY;
  const CLIENT_SECRET = process.env.NEXT_PUBLIC_KIS_API_SECRET;

  const fetchStockDividends = async () => {
    const token = await getValidToken();
    if (!token) {
      console.error('유효한 토큰이 없습니다.');
      return null;
    }
    const params = new URLSearchParams({
      CTS_AREA: '',
      GB1: '0',
      UPJONG: '0001',
      GB2: '0',
      GB3: '1',
      F_DT: '20200101',
      T_DT: '20240403',
      GB4: '0',
    });

    try {
      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
          appkey: CLIENT_ID || '',
          appsecret: CLIENT_SECRET || '',
          tr_id: 'FHPST01710000',
          custtype: 'P',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('주식 데이터:', data);
        return data.output.slice(0, 10);
      } else {
        const errorData = await response.json();
        console.error('주식 데이터 요청 실패:', errorData);
        return null;
      }
    } catch (error) {
      console.error('주식 데이터 요청 중 에러 발생:', error);
      return null;
    }
  };

  const stockDividends = await fetchStockDividends();
  return (
    <>
      {stockDividends ? (
        <table className="w-full table-auto border-collapse text-center border-t-2 border-black">
          <thead>
            <tr>
              <th className="py-4 px-2">순위</th>
              <th className="py-4 px-2">종목명</th>
              <th className="py-4 px-2">현재가</th>
              <th className="py-4 px-2">변동량</th>
              <th className="py-4 px-2">등락률</th>
            </tr>
          </thead>
          <tbody>
            {stockDividends.map((stock: any, index: number) => (
              <tr key={index} className="border-b hover:bg-g-100">
                <td className="py-4 px-2">{index + 1}</td>
                <td className="py-4 px-2">{stock.hts_kor_isnm}</td>
                <td className="py-4 px-2">{stock.stck_prpr}</td>
                <td className="py-4 px-2">
                  {stock.prdy_vrss > 0 ? (
                    <div className="flex items-center justify-center text-primary">
                      <Image src={stockup} alt="상승" width={16} height={16} />
                      <span className="ml-2">{stock.prdy_vrss}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-blue-500">
                      <Image
                        src={stockdown}
                        alt="하락"
                        width={16}
                        height={16}
                      />
                      <span className="ml-2">{stock.prdy_vrss}</span>
                    </div>
                  )}
                </td>
                <td
                  className={`py-4 px-2 ${stock.prdy_ctrt > 0 ? 'text-primary' : 'text-blue-500'}`}
                >
                  {stock.prdy_ctrt > 0
                    ? `+${stock.prdy_ctrt}%`
                    : `${stock.prdy_ctrt}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>주식 데이터를 불러오는 중입니다...</p>
      )}
    </>
  );
}
