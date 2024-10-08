// app/api/getWebSocketKey/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = {
            grant_type: "client_credentials",
            appkey: process.env.NEXT_PUBLIC_KIS_API_KEY,
            secretkey: process.env.NEXT_PUBLIC_KIS_API_SECRET,
        };

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_KIS_API_BASE_URL}/oauth2/Approval`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify(body),
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("웹소켓 접속키 발급 실패:", errorData);
            return NextResponse.json({
                error: "Failed to get WebSocket key",
                details: errorData,
            }, {
                status: response.status,
            });
        }

        const data = await response.json();
        return NextResponse.json({ approval_key: data.approval_key });
    } catch (error) {
        console.error("웹소켓 접속키 발급 중 에러 발생:", error);
        return NextResponse.json({ error: "Internal server error" }, {
            status: 500,
        });
    }
}
