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
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - 365);

        const dateRange = [];
        let currentDate = new Date(pastDate);
        while (currentDate <= today) {
            dateRange.push(
                currentDate.toISOString().split("T")[0].replace(/-/g, ""),
            );
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const holidayInfoPromises = dateRange.map((date) =>
            fetch(`${url}?BASS_DT=${date}&CTX_AREA_NK=&CTX_AREA_FK=`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    authorization: `Bearer ${token}`,
                    appkey: process.env.NEXT_PUBLIC_KIS_API_KEY || "",
                    appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET || "",
                    tr_id: "CTCA0903R",
                    custtype: "P",
                },
            }).then((response) => {
                if (!response.ok) {
                    console.error(
                        `Failed to fetch holidays for ${date}: ${response.statusText}`,
                    );
                    return null; // 에러를 무시하고 null 반환
                }
                return response.json();
            })
        );

        const holidayDataArray = await Promise.all(holidayInfoPromises);
        const holidayInfo = holidayDataArray
            .filter((data) => data !== null)
            .flatMap((data) =>
                data.output?.map((item: any) => ({
                    bass_dt: item.bass_dt,
                    opnd_yn: item.opnd_yn,
                })) || []
            );

        return NextResponse.json(holidayInfo);
    } catch (error: any) {
        console.error("Failed to fetch holiday data:", error);
        return NextResponse.json(
            { error: "Failed to fetch holiday data", details: error.message },
            { status: 500 },
        );
    }
}
