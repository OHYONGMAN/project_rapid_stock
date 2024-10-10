// app/utils/kisApi/fetchStockData.ts

import { getOpenDays } from "@/app/utils/kisApi/holiday";

interface StockData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

const parseDate = (dateString: string): string => {
    const [year, month, day] = [
        dateString.slice(0, 4),
        dateString.slice(4, 6),
        dateString.slice(6, 8),
    ];
    return `${year}-${month}-${day}`; // 시간 정보 없이 날짜만 변환
};

// 일봉 데이터를 100일 가져오기
export const fetchStockData = async (
    symbol: string,
    startDate: string,
    endDate: string,
): Promise<StockData[]> => {
    const params = new URLSearchParams({
        symbol,
        timeUnit: "D",
        startDate,
        endDate,
    });

    try {
        const openDays = await getOpenDays();

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/stockData?${params}`,
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return data
            .filter((item: any) =>
                openDays.has(item.date.split("T")[0].replace(/-/g, "")) // 개장일만 필터링
            )
            .map((item: any): StockData => ({
                date: item.date, // 여기서 날짜를 변환하지 않음
                open: Number(item.open),
                high: Number(item.high),
                low: Number(item.low),
                close: Number(item.close),
                volume: Number(item.volume),
            }));
    } catch (error) {
        console.error("Failed to fetch stock data", error);
        throw error;
    }
};

// 분봉 데이터는 당일만 가져오기
export const fetchMinuteData = async (symbol: string): Promise<StockData[]> => {
    const params = new URLSearchParams({ symbol, timeUnit: "M1" });

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/stockData?${params}`,
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const openTime = 90000;
        const closeTime = 153000;

        return data
            .filter((item: any) => {
                const currentTime = parseInt(item.stck_cntg_hour, 10);

                return currentTime >= openTime && currentTime <= closeTime;
            })
            .map((item: any): StockData => ({
                date: parseDate(item.stck_bsop_date),
                open: Number(item.stck_oprc),
                high: Number(item.stck_hgpr),
                low: Number(item.stck_lwpr),
                close: Number(item.stck_prpr || item.stck_clpr),
                volume: Number(item.cntg_vol || item.acml_vol),
            }));
    } catch (error) {
        console.error("Failed to fetch minute data", error);
        throw error;
    }
};
