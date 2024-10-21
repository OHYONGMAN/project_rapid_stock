// Next.js API 라우트 핸들러
import { NextRequest, NextResponse } from 'next/server';
import { getValidToken } from '../../utils/kisApi/token';

// API 응답에서 받는 개별 시간대별 지수 데이터 인터페이스
interface IndexTimePriceOutput {
  bsop_hour: string; // 시간
  bstp_nmix_prpr: string; // 현재가
  bstp_nmix_prdy_vrss: string; // 전일 대비
  prdy_vrss_sign: string; // 전일 대비 부호
  bstp_nmix_prdy_ctrt: string; // 전일 대비율
  acml_tr_pbmn: string; // 누적 거래대금
  acml_vol: string; // 누적 거래량
  cntg_vol: string; // 체결량
}

// API 전체 응답 구조 인터페이스
interface ApiResponse {
  output: IndexTimePriceOutput[];
  rt_cd: string; // 성공 여부 코드
  msg_cd: string; // 메시지 코드
  msg1: string; // 응답 메시지
}

// GET 요청 처리 함수
export async function GET(req: NextRequest) {
  // URL에서 쿼리 파라미터 추출
  const { searchParams } = new URL(req.url);
  const indexCode = searchParams.get('indexCode');
  const timeInterval = searchParams.get('timeInterval') || '300'; // 기본값 5분

  // 지수 코드 유효성 검사
  if (!indexCode) {
    return NextResponse.json(
      { error: '지수 코드는 필수입니다.' },
      { status: 400 },
    );
  }

  try {
    // API 토큰 획득
    const token = await getValidToken();

    // 토큰 발급 실패 시 에러 응답
    if (!token) {
      return NextResponse.json(
        { error: 'API 토큰 발급 실패.' },
        { status: 500 },
      );
    }

    // API 요청 URL 및 파라미터 설정
    const url =
      'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-index-timeprice';
    const params = new URLSearchParams({
      FID_COND_MRKT_DIV_CODE: 'U',
      FID_INPUT_ISCD: indexCode,
      FID_INPUT_HOUR_1: timeInterval,
    });

    // API 요청 헤더 설정
    const headers = {
      'content-type': 'application/json; charset=utf-8',
      authorization: `Bearer ${token}`,
      appkey: process.env.NEXT_PUBLIC_KIS_API_KEY!,
      appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET!,
      tr_id: 'FHPUP02110200',
      custtype: 'P',
    };

    // API 요청 실행
    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers,
    });

    // HTTP 오류 처리
    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태: ${response.status}`);
    }

    // API 응답 데이터 파싱
    const data: ApiResponse = await response.json();

    // API 오류 응답 처리
    if (data.rt_cd !== '0') {
      throw new Error(`API 에러: ${data.msg1}`);
    }

    // 응답 데이터 가공
    const processedData = data.output.map((item) => ({
      symbol: indexCode,
      time: item.bsop_hour,
      price: parseFloat(item.bstp_nmix_prpr),
      change: parseFloat(item.bstp_nmix_prdy_vrss),
      changeRate: parseFloat(item.bstp_nmix_prdy_ctrt),
      volume: parseInt(item.acml_vol),
    }));

    // 가공된 데이터 반환
    return NextResponse.json(processedData);
  } catch (error) {
    // 오류 로깅 및 에러 응답 생성
    console.error('API 처리 중 오류:', error);
    const errorMessage =
      error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: '지수 데이터 가져오기 실패', details: errorMessage },
      { status: 500 },
    );
  }
}
