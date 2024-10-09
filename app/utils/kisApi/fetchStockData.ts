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

const parseDate = (dateString: string, timeString?: string): string => {
    const [year, month, day] = [
        dateString.slice(0, 4),
        dateString.slice(4, 6),
        dateString.slice(6, 8),
    ];
    if (timeString) {
        const [hours, minutes] = [
            timeString.slice(0, 2),
            timeString.slice(2, 4),
        ];
        return `${year}-${month}-${day}T${hours}:${minutes}:00Z`;
    }
    return `${year}-${month}-${day}T00:00:00Z`;
};

export const fetchStockData = async (
    symbol: string,
    timeUnit: "D" | "W" | "M" | "Y",
): Promise<StockData[]> => {
    const today = new Date();
    const oneYearAgo = new Date(
        today.getFullYear() - 1,
        today.getMonth(),
        today.getDate(),
    );

    const formatDate = (date: Date) => {
        return date.toISOString().split("T")[0].replace(/-/g, "");
    };

    const params = new URLSearchParams({
        symbol,
        timeUnit,
        startDate: formatDate(oneYearAgo),
        endDate: formatDate(today),
    });

    try {
        const [response, openDays] = await Promise.all([
            fetch(`/api/stockData?${params}`),
            getOpenDays(),
        ]);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.length === 0 || !data.some((item: any) => item.close !== 0)) {
            throw new Error("Received insufficient or invalid data.");
        }

        return data
            .filter((item: any) =>
                openDays.has(item.date.split("T")[0].replace(/-/g, ""))
            )
            .map((item: any): StockData => ({
                date: parseDate(item.date, item.time),
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

export const fetchMinuteData = async (symbol: string): Promise<StockData[]> => {
    const params = new URLSearchParams({
        symbol,
        timeUnit: "M1",
    });

    try {
        const [response, openDays] = await Promise.all([
            fetch(`/api/stockData?${params}`),
            getOpenDays(),
        ]);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.length === 0 || !data.some((item: any) => item.close !== 0)) {
            throw new Error("Received insufficient or invalid data.");
        }

        return data
            .filter((item: any) =>
                openDays.has(item.date.split("T")[0].replace(/-/g, ""))
            )
            .map((item: any): StockData => ({
                date: parseDate(item.date, item.time),
                open: Number(item.open),
                high: Number(item.high),
                low: Number(item.low),
                close: Number(item.close),
                volume: Number(item.volume),
            }));
    } catch (error) {
        console.error("Failed to fetch minute data", error);
        throw error;
    }
};
