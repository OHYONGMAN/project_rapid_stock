// app/api/getWebSocketKey/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/app/utils/kisApi/token";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { appkey, secretkey } = body;

        const token = await getValidToken();

        if (!token) {
            return NextResponse.json({ error: "Failed to get valid token" }, {
                status: 500,
            });
        }

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_KIS_API_BASE_URL}/oauth2/Approval`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    grant_type: "client_credentials",
                    appkey,
                    secretkey,
                }),
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("웹소켓 접속키 발급 실패:", errorData);
            return NextResponse.json({ error: "Failed to get WebSocket key" }, {
                status: 500,
            });
        }

        const data = await response.json();
        return NextResponse.json({ approval_key: data.approval_key });
    } catch (error) {
        console.error("웹소켓 접속키 발급 중 에러 발생:", error);
        return NextResponse.json({ error: "Failed to get WebSocket key" }, {
            status: 500,
        });
    }
}
