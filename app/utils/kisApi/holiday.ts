// app/utils/kisApi/holiday.ts

export interface HolidayInfo {
    bass_dt: string;
    opnd_yn: "Y" | "N";
}

let cachedHolidays: HolidayInfo[] = [];
let cachedOpenDays: Set<string> = new Set();
let lastFetchTime: number | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day

export const fetchHolidays = async (): Promise<HolidayInfo[]> => {
    const now = Date.now();

    if (
        cachedHolidays.length > 0 &&
        lastFetchTime &&
        now - lastFetchTime < CACHE_DURATION
    ) {
        return cachedHolidays;
    }

    try {
        const response = await fetch(`/api/fetchHolidayInfo`);

        if (!response.ok) {
            throw new Error(`Failed to fetch holidays: ${response.status}`);
        }

        const data = await response.json();

        console.log("Fetched holiday data:", JSON.stringify(data, null, 2)); // 디버깅용 로그

        if (!Array.isArray(data)) {
            throw new Error(
                "Invalid data structure received from holidays API",
            );
        }

        cachedHolidays = data;
        cachedOpenDays = new Set(
            data.filter((h) => h.opnd_yn === "Y").map((h) => h.bass_dt),
        );
        lastFetchTime = now;
        return cachedHolidays;
    } catch (error) {
        console.error("Failed to fetch holiday data:", error);
        throw error;
    }
};

export const isMarketOpen = async (date: Date): Promise<boolean> => {
    try {
        if (cachedOpenDays.size === 0) {
            await fetchHolidays();
        }
        const formattedDate = date.toISOString().split("T")[0].replace(
            /-/g,
            "",
        );
        return cachedOpenDays.has(formattedDate);
    } catch (error) {
        console.error("Failed to check if market is open:", error);
        return false; // 에러 발생 시 기본적으로 시장이 닫혀있다고 가정
    }
};

export const getOpenDays = async (): Promise<Set<string>> => {
    try {
        if (cachedOpenDays.size === 0) {
            await fetchHolidays();
        }
        return cachedOpenDays;
    } catch (error) {
        console.error("Failed to get open days:", error);
        return new Set(); // 에러 발생 시 빈 Set 반환
    }
};
