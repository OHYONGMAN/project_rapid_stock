// app/api/fetchStockData/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/app/utils/kisApi/token";

export async function POST(req: NextRequest) {
    try {
        const { symbol } = await req.json();
        const token = await getValidToken();

        if (!token) {
            console.error("Failed to get access token");
            return NextResponse.json({ error: "Failed to get access token" }, {
                status: 500,
            });
        }

        const url =
            "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice";
        const headers = {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Bearer ${token}`,
            appkey: process.env.NEXT_PUBLIC_KIS_API_KEY!,
            appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET!,
            tr_id: "FHKST03010100",
            custtype: "P",
        };
        const params = new URLSearchParams({
            FID_COND_MRKT_DIV_CODE: "J",
            FID_INPUT_ISCD: symbol,
            FID_INPUT_DATE_1: "20241001",
            FID_INPUT_DATE_2: "20241001",
            FID_PERIOD_DIV_CODE: "D",
            FID_ORG_ADJ_PRC: "0",
        });

        const response = await fetch(`${url}?${params}`, {
            method: "GET",
            headers,
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            console.error("Failed to fetch stock data", {
                status: response.status,
                statusText: response.statusText,
                errorDetails,
            });
            return NextResponse.json({
                error: "Failed to fetch stock data",
                details: errorDetails,
            }, { status: 500 });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching stock data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, {
            status: 500,
        });
    }
}
