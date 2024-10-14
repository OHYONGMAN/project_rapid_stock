// app/api/websocket/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = {
            grant_type: "client_credentials",
            appkey: process.env.NEXT_PUBLIC_KIS_API_KEY,
            secretkey: process.env.NEXT_PUBLIC_KIS_API_SECRET,
        };

        if (!body.appkey || !body.secretkey) {
            throw new Error("API 자격 증명이 누락되었습니다.");
        }

        const response = await fetch(
            `https://openapi.koreainvestment.com:9443/oauth2/Approval`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
                body: JSON.stringify(body),
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("웹소켓 접속키 발급 실패:", errorData);
            return NextResponse.json(
                {
                    error: "웹소켓 접속키 발급에 실패했습니다.",
                    details: errorData,
                },
                {
                    status: response.status,
                },
            );
        }

        const data = await response.json();
        return NextResponse.json({ approval_key: data.approval_key });
    } catch (error) {
        console.error("웹소켓 접속키 발급 중 오류 발생:", error);
        return NextResponse.json(
            { error: "서버 내부 오류 발생" },
            {
                status: 500,
            },
        );
    }
}
