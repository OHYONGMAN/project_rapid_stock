// app/api/stockData/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/app/utils/kisApi/token";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const timeUnit = searchParams.get("timeUnit");

    if (!symbol || !timeUnit) {
        return NextResponse.json({ error: "Missing required parameters" }, {
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

        let url, params, trId;

        if (timeUnit === "M1") {
            // 분봉 데이터 요청
            url =
                "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-time-itemchartprice";
            params = new URLSearchParams({
                FID_ETC_CLS_CODE: "",
                FID_COND_MRKT_DIV_CODE: "J",
                FID_INPUT_ISCD: symbol,
                FID_INPUT_HOUR_1: startDate || "090000", // 시작 시간, 기본값 9시
                FID_PW_DATA_INCU_YN: "Y",
            });
            trId = "FHKST03010200";
        } else {
            // 일/주/월/년 데이터 요청
            url =
                "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice";
            params = new URLSearchParams({
                FID_COND_MRKT_DIV_CODE: "J",
                FID_INPUT_ISCD: symbol,
                FID_INPUT_DATE_1: startDate || "",
                FID_INPUT_DATE_2: endDate || "",
                FID_PERIOD_DIV_CODE: timeUnit,
                FID_ORG_ADJ_PRC: "0",
            });
            trId = "FHKST03010100";
        }

        const headers = {
            "content-type": "application/json; charset=utf-8",
            authorization: `Bearer ${token}`,
            appkey: process.env.NEXT_PUBLIC_KIS_API_KEY!,
            appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET!,
            tr_id: trId,
            custtype: "P",
        };

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

        // 응답 데이터 처리
        const processedData = data.output2.map((item: any) => ({
            date: item.stck_bsop_date,
            time: item.stck_cntg_hour,
            open: parseFloat(item.stck_oprc),
            high: parseFloat(item.stck_hgpr),
            low: parseFloat(item.stck_lwpr),
            close: parseFloat(item.stck_prpr || item.stck_clpr),
            volume: parseInt(item.cntg_vol || item.acml_vol, 10),
        }));

        return NextResponse.json(processedData);
    } catch (error) {
        console.error("Failed to fetch stock data", error);
        return NextResponse.json({ error: "Internal server error" }, {
            status: 500,
        });
    }
}
