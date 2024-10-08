// app/api/stockData/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/app/utils/kisApi/token";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
        return NextResponse.json({ error: "Symbol is required" }, {
            status: 400,
        });
    }

    try {
        const token = await getValidToken();

        if (!token) {
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
            FID_INPUT_DATE_2: "20241030",
            FID_PERIOD_DIV_CODE: "D",
            FID_ORG_ADJ_PRC: "0",
        });

        const response = await fetch(`${url}?${params}`, {
            method: "GET",
            headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.rt_cd !== "0") {
            throw new Error(`API error: ${data.msg1}`);
        }

        const formattedData = data.output2.map((item: any) => ({
            date: item.stck_bsop_date, // Keep as string 'YYYYMMDD'
            open: parseFloat(item.stck_oprc),
            high: parseFloat(item.stck_hgpr),
            low: parseFloat(item.stck_lwpr),
            close: parseFloat(item.stck_clpr),
            volume: parseInt(item.acml_vol, 10),
        }));

        return NextResponse.json(formattedData);
    } catch (error) {
        console.error("Failed to fetch stock data", error);
        return NextResponse.json({ error: "Internal server error" }, {
            status: 500,
        });
    }
}
