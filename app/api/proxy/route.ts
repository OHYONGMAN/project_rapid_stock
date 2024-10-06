// app/api/proxy/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { appkey, secretkey } = body;

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_KIS_API_BASE_URL}/oauth2/Approval`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
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
            console.error("외부 API 요청 실패:", errorData);
            return NextResponse.json({ error: "Failed to get approval key" }, {
                status: 500,
            });
        }

        const data = await response.json();
        return NextResponse.json({ approval_key: data.approval_key });
    } catch (error) {
        console.error("프록시 서버에서 에러 발생:", error);
        return NextResponse.json({ error: "Proxy server error" }, {
            status: 500,
        });
    }
}
