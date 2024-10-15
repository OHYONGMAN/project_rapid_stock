// 웹소켓 접속키 발급을 위한 API 엔드포인트

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // API 요청에 필요한 body 데이터 구성
    const body = {
      grant_type: 'client_credentials', // 클라이언트 자격 증명을 이용한 토큰 발급 방식
      appkey: process.env.NEXT_PUBLIC_KIS_API_KEY, // 앱 키
      secretkey: process.env.NEXT_PUBLIC_KIS_API_SECRET, // 앱 시크릿
    };

    // 앱 키 또는 시크릿이 누락된 경우 예외 처리
    if (!body.appkey || !body.secretkey) {
      throw new Error('API 자격 증명이 누락되었습니다.');
    }

    // API 호출하여 웹소켓 접속키 요청
    const response = await fetch(
      `https://openapi.koreainvestment.com:9443/oauth2/Approval`,
      {
        method: 'POST', // POST 메서드 사용
        headers: {
          'Content-Type': 'application/json; charset=utf-8', // JSON 형식의 요청 헤더
        },
        body: JSON.stringify(body), // 요청 바디에 자격 증명 포함
      },
    );

    // 호출 실패 시 에러 처리
    if (!response.ok) {
      const errorData = await response.json();
      console.error('웹소켓 접속키 발급 실패:', errorData);
      return NextResponse.json(
        {
          error: '웹소켓 접속키 발급에 실패했습니다.',
          details: errorData, // 실패한 응답 상세 정보 반환
        },
        {
          status: response.status, // 상태 코드 반환
        },
      );
    }

    const data = await response.json();
    // 성공 시 승인 키를 반환
    return NextResponse.json({ approval_key: data.approval_key });
  } catch (error) {
    // 예외 처리 (네트워크 에러 등)
    console.error('웹소켓 접속키 발급 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 내부 오류 발생' },
      {
        status: 500, // 내부 서버 오류 상태 코드
      },
    );
  }
}
