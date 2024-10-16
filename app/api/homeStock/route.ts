import { NextRequest, NextResponse } from 'next/server';
import { getValidToken } from '../../utils/kisApi/token.ts';

const MAX_RETRIES = 3;
const TIMEOUT = 10000; // 10 seconds

type DataType =
  | 'indexPrice'
  | 'stockCapitalization'
  | 'topStock'
  | 'stockDividends';

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES,
): Promise<Response> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    if (retries > 0) {
      console.log(`Retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dataType = searchParams.get('type') as DataType | null;

  if (!dataType) {
    return NextResponse.json(
      { error: '데이터 타입은 필수입니다.' },
      { status: 400 },
    );
  }

  try {
    const token = await getValidToken();

    if (!token) {
      return NextResponse.json(
        { error: 'API 토큰 발급 실패.' },
        { status: 500 },
      );
    }

    let url: string;
    let params: URLSearchParams;
    let trId: string;

    const headers = {
      'content-type': 'application/json; charset=utf-8',
      authorization: `Bearer ${token}`,
      appkey: process.env.NEXT_PUBLIC_KIS_API_KEY!,
      appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET!,
      tr_id: '',
      custtype: 'P',
    };

    switch (dataType) {
      case 'indexPrice': {
        url =
          'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-index-price';
        trId = 'FHPUP02100000';
        headers.tr_id = trId;

        const indexCodes = ['0001', '1001', '2001']; // 코스피, 코스닥, 코스피200
        const promises = indexCodes.map((code) =>
          fetchWithRetry(
            `${url}?FID_COND_MRKT_DIV_CODE=U&FID_INPUT_ISCD=${code}`,
            {
              method: 'GET',
              headers,
            },
          ).then((res) => res.json()),
        );
        const results = await Promise.all(promises);
        return NextResponse.json(results.map((r) => r.output[0]));
      }

      case 'stockCapitalization': {
        url =
          'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/ranking/market-cap';
        params = new URLSearchParams({
          FID_COND_MRKT_DIV_CODE: 'J',
          FID_COND_SCR_DIV_CODE: '20174',
          FID_INPUT_ISCD: '0000',
          FID_DIV_CLS_CODE: '0',
          FID_TRGT_CLS_CODE: '0',
          FID_TRGT_EXLS_CLS_CODE: '0',
          FID_INPUT_PRICE_1: '',
          FID_INPUT_PRICE_2: '',
          FID_VOL_CNT: '',
        });
        trId = 'FHPST01740000';
        break;
      }

      case 'topStock': {
        url =
          'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/volume-rank';
        params = new URLSearchParams({
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
        trId = 'FHPST01710000';
        break;
      }

      case 'stockDividends': {
        url =
          'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/ranking/dividend-rate';
        params = new URLSearchParams({
          CTS_AREA: '',
          GB1: '1',
          UPJONG: '0001',
          GB2: '0',
          GB3: '2',
          F_DT: '20230101',
          T_DT: '20240101',
          GB4: '0',
        });
        trId = 'HHKDB13470100';
        break;
      }
    }

    headers.tr_id = trId;
    const response = await fetchWithRetry(`${url}?${params}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 응답 에러:', errorText);
      throw new Error(
        `HTTP 오류! 상태: ${response.status}, 상세: ${errorText}`,
      );
    }

    const data = await response.json();

    if (data.rt_cd !== '0') {
      console.error('API 에러 응답:', data);
      throw new Error(`API 에러: ${data.msg1}`);
    }

    return NextResponse.json(data.output || []);
  } catch (error) {
    console.error('API 처리 중 오류:', error);
    let errorMessage = '데이터 가져오기 실패';
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
      if ('cause' in error && error.cause instanceof Error) {
        errorMessage += ` (${error.cause.message})`;
      }
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
