import { NextRequest, NextResponse } from 'next/server';
import { getValidToken } from '../../utils/kisApi/token.ts';

interface ApiResponse {
  output: {
    stck_prpr: string; // 주식 현재가
    prdy_vrss: string; // 전일 대비
    prdy_ctrt: string; // 전일 대비율
    acml_vol: string; // 누적 거래량
  };
  rt_cd: string;
  msg_cd: string;
  msg1: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json(
      { error: '종목 코드는 필수입니다.' },
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

    const url =
      'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-price';
    const params = new URLSearchParams({
      FID_COND_MRKT_DIV_CODE: 'J',
      FID_INPUT_ISCD: symbol,
    });

    const headers = {
      'content-type': 'application/json; charset=utf-8',
      authorization: `Bearer ${token}`,
      appkey: process.env.NEXT_PUBLIC_KIS_API_KEY!,
      appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET!,
      tr_id: 'FHKST01010100',
      custtype: 'P',
    };

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태: ${response.status}`);
    }

    const data: ApiResponse = await response.json();

    if (data.rt_cd !== '0') {
      throw new Error(`API 에러: ${data.msg1}`);
    }

    const processedData = {
      currentPrice: data.output.stck_prpr,
      priceChange: data.output.prdy_vrss,
      priceChangeRate: data.output.prdy_ctrt,
      totalVolume: data.output.acml_vol,
    };

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('API 처리 중 오류:', error);
    return NextResponse.json(
      { error: '주식 데이터 가져오기 실패', details: error.message },
      { status: 500 },
    );
  }
}
