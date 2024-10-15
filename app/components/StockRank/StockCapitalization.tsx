import { getValidToken } from '../../api/token/router';

export default async function StockCapitalization() {
  const url =
    'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/ranking/market-cap';
  const CLIENT_ID = process.env.NEXT_PUBLIC_KIS_API_KEY;
  const CLIENT_SECRET = process.env.NEXT_PUBLIC_KIS_API_SECRET;

  const fetchStockCapitalization = async () => {
    const token = await getValidToken();

    if (!token) {
      console.error('유효한 토큰이 없습니다.');
      return null;
    }

    // API 요청에 필요한 쿼리 파라미터 설정
    const params = new URLSearchParams({
      fid_cond_mrkt_div_code: 'J', // 시장 분류 코드 (주식: J)
      fid_cond_scr_div_code: '20174', // 화면 분류 코드
      fid_div_cls_code: '0', // 0: 전체 (보통주, 우선주)
      fid_input_iscd: '0000', // 전체 종목 (0000: 전체, 0001: 거래소, 1001: 코스닥)
      fid_trgt_cls_code: '0', // 대상 구분 코드 (0: 전체)
      fid_trgt_exls_cls_code: '0', // 대상 제외 구분 코드 (0: 전체)
      fid_input_price_1: '', // 가격 필터 1 (빈 값으로 전체 범위)
      fid_input_price_2: '', // 가격 필터 2 (빈 값으로 전체 범위)
      fid_vol_cnt: '', // 거래량 필터 (빈 값으로 전체 범위)
    });

    try {
      // API 요청 실행
      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
          appkey: CLIENT_ID || '',
          appsecret: CLIENT_SECRET || '',
          tr_id: 'FHPST01740000', // API 거래 ID
          custtype: 'P', // 개인 고객
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('주식 데이터:', data);
        return data.output ? data.output.slice(0, 10) : [];
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

  const topStock = await fetchStockCapitalization();

  return (
    <>
      {topStock ? (
        <table className="w-full table-auto border-collapse text-center border-t-2 border-black">
          <tbody>
            {topStock.map((stock: any, index: number) => (
              <tr key={index} className="border-b hover:bg-g-100">
                <td className="py-4 px-2">{index + 1}</td>
                <td className="py-4 px-2">{stock.hts_kor_isnm}</td>
                <td className="py-4 px-2">{stock.stck_prpr}</td>
                {/* <td className='py-4 px-2'>{stock.prdy_vrss}</td> */}
                <td
                  className={`py-4 px-2 ${
                    stock.prdy_ctrt > 0 ? 'text-primary' : 'text-blue-500'
                  }`}
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
