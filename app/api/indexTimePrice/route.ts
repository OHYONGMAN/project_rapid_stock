import { NextRequest, NextResponse } from 'next/server';
import { getValidToken } from '../../utils/kisApi/token';

interface IndexTimePriceOutput {
  bsop_hour: string;
  bstp_nmix_prpr: string;
  bstp_nmix_prdy_vrss: string;
  prdy_vrss_sign: string;
  bstp_nmix_prdy_ctrt: string;
  acml_tr_pbmn: string;
  acml_vol: string;
  cntg_vol: string;
}

interface ApiResponse {
  output: IndexTimePriceOutput[];
  rt_cd: string;
  msg_cd: string;
  msg1: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const indexCode = searchParams.get('indexCode');
  const timeInterval = searchParams.get('timeInterval') || '300';

  if (!indexCode) {
    return NextResponse.json(
      { error: '지수 코드는 필수입니다.' },
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
      'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-index-timeprice';
    const params = new URLSearchParams({
      FID_COND_MRKT_DIV_CODE: 'U',
      FID_INPUT_ISCD: indexCode,
      FID_INPUT_HOUR_1: timeInterval,
    });

    const headers = {
      'content-type': 'application/json; charset=utf-8',
      authorization: `Bearer ${token}`,
      appkey: process.env.NEXT_PUBLIC_KIS_API_KEY!,
      appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET!,
      tr_id: 'FHPUP02110200',
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

    const processedData = data.output.map((item) => ({
      time: item.bsop_hour,
      price: parseFloat(item.bstp_nmix_prpr),
      change: parseFloat(item.bstp_nmix_prdy_vrss),
      changeRate: parseFloat(item.bstp_nmix_prdy_ctrt),
      volume: parseInt(item.acml_vol),
    }));

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('API 처리 중 오류:', error);
    const errorMessage =
      error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: '지수 데이터 가져오기 실패', details: errorMessage },
      { status: 500 },
    );
  }
}
