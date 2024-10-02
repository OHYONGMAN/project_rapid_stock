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
      // 필요한 추가 파라미터가 있다면 여기에 추가
    });

    try {
      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
          appkey: CLIENT_ID || '',
          appsecret: CLIENT_SECRET || '',
          tr_id: 'FHPUP02100000', // 거래 ID
          custtype: 'P', // 개인
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('인덱스 데이터:', data);
        return data.output; // 인덱스 데이터 리턴
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
    <div className="max-w-4xl mx-auto mt-16 mx-20">
      <h2 className="text-2xl font-semibold mb-4">지수 정보</h2>
      {indexData ? (
        <table className="w-full table-auto border-collapse text-center border-t-2 border-black">
          <thead>
            <tr>
              <th className="py-4">지수명</th>
              <th className="py-4">현재가</th>
              <th className="py-4">전일 대비</th>
              <th className="py-4">등락률</th>
            </tr>
          </thead>
          <tbody>
            {indexData.map((data, index) => (
              <tr key={index} className="border-b hover:bg-g-100">
                <td className="py-4 px-2">
                  {index === 0
                    ? '코스피'
                    : index === 1
                      ? '코스피 200'
                      : '코스닥'}
                </td>
                <td className="py-4 px-2">{data.bstp_nmix_prpr}</td>{' '}
                {/* 현재가 */}
                <td className="py-4 px-2">
                  {data.bstp_nmix_prdy_vrss > 0 ? (
                    <div className="flex items-center justify-center text-primary">
                      <Image src={stockup} alt="상승" width={16} height={16} />
                      <span className="ml-2">{data.bstp_nmix_prdy_vrss}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-blue-500">
                      <Image
                        src={stockdown}
                        alt="하락"
                        width={16}
                        height={16}
                      />
                      <span className="ml-2">{data.bstp_nmix_prdy_vrss}</span>
                    </div>
                  )}
                </td>
                <td
                  className={`py-4 px-2 ${data.bstp_nmix_prdy_ctrt > 0 ? 'text-primary' : 'text-blue-500'}`}
                >
                  {data.bstp_nmix_prdy_ctrt > 0
                    ? `+${data.bstp_nmix_prdy_ctrt}%`
                    : `${data.bstp_nmix_prdy_ctrt}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>지수 데이터를 불러오는 중입니다...</p>
      )}
    </div>
  );
}
