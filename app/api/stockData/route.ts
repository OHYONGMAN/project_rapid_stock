// app/api/stockData/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/app/utils/kisApi/token";
import { fetchHolidays } from "@/app/utils/kisApi/holiday";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    const timeUnit = searchParams.get("timeUnit");

    if (!symbol || !timeUnit || (timeUnit !== "M1" && timeUnit !== "D")) {
        console.error("Invalid parameters:", { symbol, timeUnit });
        return NextResponse.json(
            {
                error:
                    "Invalid or missing parameters. Only M1 and D time units are supported.",
            },
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

        console.log(
            `Fetching stock data for symbol: ${symbol}, timeUnit: ${timeUnit}`,
        );

        const holidays = await fetchHolidays();

        let url, params, trId;

        if (timeUnit === "M1") {
            // 분봉 데이터는 당일 데이터만 가져옴
            url =
                "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-time-itemchartprice";
            params = new URLSearchParams({
                FID_ETC_CLS_CODE: "",
                FID_COND_MRKT_DIV_CODE: "J",
                FID_INPUT_ISCD: symbol,
                FID_INPUT_HOUR_1: "090000", // 조회 시작 시각
                FID_PW_DATA_INCU_YN: "Y",
            });
            trId = "FHKST03010200";
        } else if (timeUnit === "D") {
            // 일봉 데이터는 최근 100일(휴장일 제외)을 가져옴
            const today = new Date();
            const pastDate = new Date(today);
            pastDate.setDate(today.getDate() - 100);

            const startDate = pastDate.toISOString().split("T")[0].replace(
                /-/g,
                "",
            );
            const endDate = today.toISOString().split("T")[0].replace(/-/g, "");

            url =
                "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice";
            params = new URLSearchParams({
                FID_COND_MRKT_DIV_CODE: "J",
                FID_INPUT_ISCD: symbol,
                FID_INPUT_DATE_1: startDate,
                FID_INPUT_DATE_2: endDate,
                FID_PERIOD_DIV_CODE: timeUnit,
                FID_ORG_ADJ_PRC: "0",
            });
            trId = "FHKST03010100";
        } else {
            console.error("Invalid time unit:", timeUnit);
            return NextResponse.json(
                { error: "Invalid time unit. Only M1 and D are supported." },
                { status: 400 },
            );
        }

        const headers = {
            "content-type": "application/json; charset=utf-8",
            authorization: `Bearer ${token}`,
            appkey: process.env.NEXT_PUBLIC_KIS_API_KEY!,
            appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET!,
            tr_id: trId,
            custtype: "P",
        };

        console.log("Sending request to:", url);
        console.log("Request params:", params.toString());
        console.log("Request headers:", headers);

        const response = await fetch(`${url}?${params}`, {
            method: "GET",
            headers,
        });

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            const errorText = await response.text();
            console.error("Error response:", errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Received data:", data);

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

        console.log("Processed data:", processedData);

        return NextResponse.json(processedData);
    } catch (error) {
        console.error("Failed to fetch stock data", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
        );
    }
}
