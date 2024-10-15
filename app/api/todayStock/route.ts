// API 라우트에서 클라이언트에게 데이터를 전달

import { NextRequest, NextResponse } from 'next/server';
import { getValidToken } from '@/app/utils/kisApi/token';

interface ApiResponse {
  output: {
    stck_prpr: string; // 현재가
    prdy_vrss: string; // 전일 대비
    prdy_ctrt: string; // 전일 대비율
    cntg_vol: string; // 거래량
  }[];
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
      'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-ccnl';
    const params = new URLSearchParams({
      FID_COND_MRKT_DIV_CODE: 'J',
      FID_INPUT_ISCD: symbol,
    });

    const headers = {
      'content-type': 'application/json; charset=utf-8',
      authorization: `Bearer ${token}`,
      appkey: process.env.NEXT_PUBLIC_KIS_API_KEY!,
      appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET!,
      tr_id: 'FHKST01010300',
      custtype: 'P', // 개인 고객 타입
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

    // 필요한 정보만 가공하여 반환
    const processedData = data.output.map((item) => ({
      currentPrice: item.stck_prpr,
      priceChange: item.prdy_vrss,
      priceChangeRate: item.prdy_ctrt,
      volume: item.cntg_vol,
    }));

    return NextResponse.json(processedData);
  } catch (error) {
    return NextResponse.json(
      { error: '주식 데이터 가져오기 실패', details: error.message },
      { status: 500 },
    );
  }
}
