// app/utils/kisApi/fetchStockData.ts

export const fetchStockData = async (symbol: string) => {
    try {
        const response = await fetch(`/api/stockData?symbol=${symbol}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.map((item: any) => ({
            ...item,
            date: parseDateString(item.date), // Convert 'YYYYMMDD' to Date object
        }));
    } catch (error) {
        console.error("Failed to fetch stock data", error);
        throw error;
    }
};

function parseDateString(dateString: string): Date {
    const year = parseInt(dateString.substring(0, 4), 10);
    const month = parseInt(dateString.substring(4, 6), 10) - 1; // 월은 0-based
    const day = parseInt(dateString.substring(6, 8), 10);
    return new Date(year, month, day);
}
