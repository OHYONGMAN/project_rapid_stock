import { NextRequest, NextResponse } from 'next/server';
import { getValidToken } from '../../utils/kisApi/token.ts';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dataType = searchParams.get('type');

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

    switch (dataType) {
      case 'indexPrice':
        url =
          'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-index-price';
        params = new URLSearchParams({
          FID_COND_MRKT_DIV_CODE: 'U',
          FID_INPUT_ISCD: '0001', // 코스피 지수
        });
        trId = 'FHPUP02100000';
        break;
      case 'stockCapitalization':
        url =
          'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/ranking/market-cap';
        params = new URLSearchParams({
          FID_COND_MRKT_DIV_CODE: 'J',
          FID_COND_SCR_DIV_CODE: '20174',
          FID_INPUT_ISCD: '0000',
        });
        trId = 'FHPST01740000';
        break;
      case 'topStock':
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
      case 'stockDividends':
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
        trId = 'HHKDB13470100'; // 변경된 tr_id
        break;
      default:
        return NextResponse.json(
          { error: '잘못된 데이터 타입입니다.' },
          { status: 400 },
        );
    }

    const headers = {
      'content-type': 'application/json; charset=utf-8',
      authorization: `Bearer ${token}`,
      appkey: process.env.NEXT_PUBLIC_KIS_API_KEY!,
      appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET!,
      tr_id: trId,
      custtype: 'P',
    };

    const response = await fetch(`${url}?${params}`, {
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
    return NextResponse.json(
      { error: '데이터 가져오기 실패', details: error.message },
      { status: 500 },
    );
  }
}
