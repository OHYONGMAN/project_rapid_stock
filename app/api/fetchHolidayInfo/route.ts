// app/api/fetchHolidayInfo/route.ts

import { NextResponse } from "next/server";
import { getValidToken } from "@/app/utils/kisApi/token";

export async function GET() {
    try {
        const url =
            "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/chk-holiday";
        const token = await getValidToken();
        if (!token) {
            throw new Error("Access token is missing");
        }

        const today = new Date();
        const formattedToday = today.toISOString().split("T")[0].replace(
            /-/g,
            "",
        );

        const response = await fetch(
            `${url}?BASS_DT=${formattedToday}&CTX_AREA_NK=&CTX_AREA_FK=`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    authorization: `Bearer ${token}`,
                    appkey: process.env.NEXT_PUBLIC_KIS_API_KEY || "",
                    appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET || "",
                    tr_id: "CTCA0903R",
                    custtype: "P",
                },
            },
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch holidays: ${response.statusText}`);
        }

        const data = await response.json();

        // 응답 데이터 구조 확인 및 로깅
        console.log("Holiday API Response:", JSON.stringify(data, null, 2));

        if (!data.output || !Array.isArray(data.output)) {
            throw new Error("Invalid holiday data structure");
        }

        // 휴일 데이터 가공
        const holidayInfo = data.output.map((item: any) => ({
            bass_dt: item.bass_dt,
            opnd_yn: item.opnd_yn,
        }));

        return NextResponse.json(holidayInfo);
    } catch (error: any) {
        console.error("Failed to fetch holiday data:", error);
        return NextResponse.json(
            { error: "Failed to fetch holiday data", details: error.message },
            { status: 500 },
        );
    }
}
