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
    console.log('API 요청 URL:', `/api/todayStock?${params}`);

    const response = await fetch(`/api/todayStock?${params}`);
    console.log('API 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태: ${response.status}`);
    }

    const data = await response.json();
    console.log('API 응답 데이터:', data);

    return data;
  } catch (error) {
    console.error('API 요청 중 오류 발생:', error);
    throw error;
  }
};
