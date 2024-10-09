// app/api/proxy/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/app/utils/kisApi/token";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const targetPath = url.pathname.replace("/api/proxy", "");
    const targetUrl =
        `https://openapi.koreainvestment.com:9443${targetPath}${url.search}`;

    try {
        const token = await getValidToken();

        if (!token) {
            return NextResponse.json({ error: "Failed to get access token" }, {
                status: 500,
            });
        }

        const headers = {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Bearer ${token}`,
            appkey: process.env.NEXT_PUBLIC_KIS_API_KEY!,
            appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET!,
            tr_id: url.searchParams.get("tr_id") || "",
            custtype: "P",
        };

        const response = await fetch(targetUrl, {
            method: "GET",
            headers: headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, {
            status: 500,
        });
    }
}

export async function POST(req: NextRequest) {
    const url = new URL(req.url);
    const targetPath = url.pathname.replace("/api/proxy", "");
    const targetUrl = `https://openapi.koreainvestment.com:9443${targetPath}`;

    try {
        const token = await getValidToken();

        if (!token) {
            return NextResponse.json({ error: "Failed to get access token" }, {
                status: 500,
            });
        }

        const headers = {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Bearer ${token}`,
            appkey: process.env.NEXT_PUBLIC_KIS_API_KEY!,
            appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET!,
            custtype: "P",
        };

        const body = await req.json();

        const response = await fetch(targetUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, {
            status: 500,
        });
    }
}
