// app/api/stockData/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/app/utils/kisApi/token";
import { fetchHolidays } from "@/app/utils/kisApi/holiday";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    const timeUnit = searchParams.get("timeUnit");

    if (!symbol || !timeUnit) {
        return NextResponse.json(
            { error: "Missing required parameters" },
            { status: 400 },
        );
    }

    try {
        const token = await getValidToken();

        if (!token) {
            console.error("Failed to get access token");
            return NextResponse.json(
                { error: "Failed to get access token" },
                { status: 500 },
            );
        }

        // 365일 날짜 범위 계산
        const today = new Date();
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - 365);

        const startDate = pastDate.toISOString().split("T")[0].replace(
            /-/g,
            "",
        );
        const endDate = today.toISOString().split("T")[0].replace(/-/g, "");

        const holidays = await fetchHolidays();

        let url, params, trId;

        if (timeUnit === "M1") {
            url =
                "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-time-itemchartprice";
            params = new URLSearchParams({
                FID_ETC_CLS_CODE: "",
                FID_COND_MRKT_DIV_CODE: "J",
                FID_INPUT_ISCD: symbol,
                FID_INPUT_HOUR_1: "090000",
                FID_PW_DATA_INCU_YN: "Y",
            });
            trId = "FHKST03010200";
        } else {
            url =
                "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice";
            params = new URLSearchParams({
                FID_COND_MRKT_DIV_CODE: "J",
                FID_INPUT_ISCD: symbol,
                FID_INPUT_DATE_1: startDate, // 365일 이전 날짜
                FID_INPUT_DATE_2: endDate, // 오늘 날짜
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
            console.error(`HTTP error! status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.rt_cd !== "0") {
            console.error(`API error: ${data.msg1}`);
            throw new Error(`API error: ${data.msg1}`);
        }

        const filteredData = data.output2.filter((item: any) =>
            holidays.some(
                (holiday) =>
                    holiday.bass_dt === item.stck_bsop_date &&
                    holiday.opnd_yn === "Y",
            )
        );

        const processedData = filteredData.map((item: any) => ({
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
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
