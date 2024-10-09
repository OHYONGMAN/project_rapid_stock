// app/api/getWebSocketKey/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = {
            grant_type: "client_credentials",
            appkey: process.env.NEXT_PUBLIC_KIS_API_KEY,
            secretkey: process.env.NEXT_PUBLIC_KIS_API_SECRET,
        };

        if (!body.appkey || !body.secretkey) {
            throw new Error("Missing API credentials");
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
                    error: "Failed to get WebSocket key",
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
        console.error("웹소켓 접속키 발급 중 에러 발생:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            {
                status: 500,
            },
        );
    }
}
