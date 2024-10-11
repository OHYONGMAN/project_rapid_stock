// app/api/websocket/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // 웹소켓 접속을 위한 인증 정보 설정
        const body = {
            grant_type: "client_credentials", // 인증 방식
            appkey: process.env.NEXT_PUBLIC_KIS_API_KEY, // 한국투자증권 API 앱 키
            secretkey: process.env.NEXT_PUBLIC_KIS_API_SECRET, // 한국투자증권 API 비밀키
        };

        // 필수 인증 정보가 없을 때 오류 처리
        if (!body.appkey || !body.secretkey) {
            throw new Error("API 자격 증명이 누락되었습니다.");
        }

        // 웹소켓 접속 키를 요청하는 POST API 호출
        const response = await fetch(
            `https://openapi.koreainvestment.com:9443/oauth2/Approval`, // 토큰 발급 API
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8", // JSON 형식으로 전송
                },
                body: JSON.stringify(body), // 요청 본문에 인증 정보 포함
            },
        );

        // 응답이 실패할 경우 오류 처리
        if (!response.ok) {
            const errorData = await response.json();
            console.error("웹소켓 접속키 발급 실패:", errorData);
            return NextResponse.json(
                {
                    error: "웹소켓 접속키 발급에 실패했습니다.",
                    details: errorData, // 오류 세부 정보 포함
                },
                {
                    status: response.status, // 응답 상태 코드 반영
                },
            );
        }

        // 성공적으로 받은 데이터에서 승인 키 추출
        const data = await response.json();
        return NextResponse.json({ approval_key: data.approval_key }); // 승인 키 반환
    } catch (error) {
        // 예외 발생 시 오류 메시지 처리
        console.error("웹소켓 접속키 발급 중 오류 발생:", error);
        return NextResponse.json(
            { error: "서버 내부 오류 발생" }, // 서버 오류 응답
            {
                status: 500, // 500 에러 상태 반환
            },
        );
    }
}
