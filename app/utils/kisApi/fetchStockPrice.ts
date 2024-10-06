// app/utils/kisApi/fetchStockPrice.ts

export async function fetchStockPrice(symbol: string) {
    const response = await fetch(`/api/fetchStockData?symbol=${symbol}`);
    if (!response.ok) {
        throw new Error("Failed to fetch stock price");
    }
    const data = await response.json();
    return data;
}
