export interface StockData {
  currentPrice: string;
  priceChange: string;
  priceChangeRate: string;
  totalVolume: string;
}

export const fetchTodayStockData = async (
  symbol: string,
): Promise<StockData> => {
  try {
    const params = new URLSearchParams({ symbol });

    const response = await fetch(`/api/todayStock?${params}`);

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('API 요청 중 오류 발생:', error);
    throw error;
  }
};
