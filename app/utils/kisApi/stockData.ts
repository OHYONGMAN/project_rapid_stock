import { getValidToken, forceTokenRefresh, cleanupToken } from './token';

// 인기 종목 데이터를 가져오는 함수
export const fetchTopStocks = async (retryCount: number = 0): Promise<any> => {
  // 최대 재시도 횟수를 초과하면 종료
  if (retryCount > 3) {
    console.error('최대 재시도 횟수를 초과했습니다.');
    await cleanupToken();
    return null;
  }

  // 유효한 토큰을 얻음
  const token = await getValidToken();
  if (!token) {
    console.error('유효한 토큰을 얻을 수 없습니다.');
    return null;
  }

  // API 요청에 필요한 쿼리스트링을 생성 (쿼리스트링은 URL에 포함되는 데이터를 나타내는 문자열을 뜻함)
  const params = new URLSearchParams({
    FID_COND_MRKT_DIV_CODE: 'J',
    FID_COND_SCR_DIV_CODE: '20171',
    FID_INPUT_ISCD: '0000',
    FID_DIV_CLS_CODE: '0',
    FID_BLNG_CLS_CODE: '0',
    FID_TRGT_CLS_CODE: '111111111',
    FID_TRGT_EXLS_CLS_CODE: '0000000000',
    FID_INPUT_PRICE_1: '0',
    FID_INPUT_PRICE_2: '1000000',
    FID_VOL_CNT: '100000',
    FID_INPUT_DATE_1: '',
  });

  // API 요청
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_KIS_API_BASE_URL
      }/uapi/domestic-stock/v1/quotations/volume-rank?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
          appkey: process.env.NEXT_PUBLIC_KIS_API_KEY!,
          appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET!,
          tr_id: 'FHPST01710000',
          custtype: 'P',
        },
      },
    );

    if (response.ok) {
      const data = await response.json();
      return data.output.slice(0, 10);
    } else {
      const errorData = await response.json();
      console.error('주식 데이터 요청 실패:', errorData);

      if (errorData.msg_cd === 'EGW00123') {
        console.log('토큰이 만료되어 강제 갱신 후 재시도합니다.');
        await forceTokenRefresh();
        return fetchTopStocks(retryCount + 1);
      }

      return null;
    }
  } catch (error) {
    console.error('주식 데이터 요청 중 에러 발생:', error);
    return null;
  }
};

// 애플리케이션 종료 시 호출
export const cleanup = async (): Promise<void> => {
  await cleanupToken();
};
