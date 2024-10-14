import { getValidToken } from '../../utils/kisApi/token';
import Image from 'next/image';
import stockup from '../../../public/images/ico-stockup.svg';
import stockdown from '../../../public/images/ico-stockdown.svg';

export default async function StockRank() {
  const url =
    'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-index-price';
  const CLIENT_ID = process.env.NEXT_PUBLIC_KIS_API_KEY;
  const CLIENT_SECRET = process.env.NEXT_PUBLIC_KIS_API_SECRET;

  const fetchIndexPrice = async (indexCode) => {
    const token = await getValidToken();

    if (!token) {
      console.error('유효한 토큰이 없습니다.');
      return null;
    }

    const params = new URLSearchParams({
      FID_COND_MRKT_DIV_CODE: 'U', // 업종(U)
      FID_INPUT_ISCD: indexCode, // 종목 코드
    });

    try {
      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
          appkey: CLIENT_ID || '',
          appsecret: CLIENT_SECRET || '',
          tr_id: 'FHPUP02100000',
          custtype: 'P',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // console.log('인덱스 데이터:', data);
        return data.output;
      } else {
        const errorData = await response.json();
        console.error('인덱스 데이터 요청 실패:', errorData);
        return null;
      }
    } catch (error) {
      console.error('인덱스 데이터 요청 중 에러 발생:', error);
      return null;
    }
  };

  const indexCodes = ['0001', '2001', '1001']; // 코스피, 코스피 200, 코스닥 종목 코드
  const indexDataPromises = indexCodes.map(fetchIndexPrice);
  const indexData = await Promise.all(indexDataPromises);

  return (
    <div className="w-[460px] mx-auto mx-20">
      <h2 className="text-2xl font-semibold mb-4">오늘의 증시</h2>
      {indexData ? (
        <div className="flex flex-col gap-4">
          {indexData.map((data, index) => (
            <div
              key={index}
              className="flex bg-g-100 p-4 rounded-lg items-center gap-5"
            >
              <h3 className="flex-1 font-semibold text-left">
                {index === 0 ? '코스피' : index === 1 ? '코스피 200' : '코스닥'}
              </h3>
              <p className="text-right ">{data.bstp_nmix_prpr}</p>
              <div className="w-16 flex items-center justify-between ml-2">
                {data.bstp_nmix_prdy_vrss > 0 ? (
                  <div className="w-full flex text-primary flex items-center">
                    <Image src={stockup} alt="상승" width={16} height={16} />
                    <p className="flex-1 text-right">
                      {data.bstp_nmix_prdy_vrss}
                    </p>
                  </div>
                ) : (
                  <div className="w-full flex text-blue-500 flex items-center">
                    <Image src={stockdown} alt="하락" width={16} height={16} />
                    <p className="flex-1 text-right">
                      {data.bstp_nmix_prdy_vrss}
                    </p>
                  </div>
                )}
              </div>
              <p
                className={`w-16 text-right  ${data.bstp_nmix_prdy_ctrt > 0 ? 'text-primary' : 'text-blue-500'}`}
              >
                {' '}
                {data.bstp_nmix_prdy_ctrt > 0
                  ? `+${data.bstp_nmix_prdy_ctrt}%`
                  : `${data.bstp_nmix_prdy_ctrt}%`}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>지수 데이터를 불러오는 중입니다...</p>
      )}
    </div>
  );
}
