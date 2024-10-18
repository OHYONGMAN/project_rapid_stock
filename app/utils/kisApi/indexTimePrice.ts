export interface IndexTimePrice {
  time: string;
  price: number;
  change: number;
  changeRate: number;
  volume: number;
}

export const fetchIndexTimePrice = async (
  indexCode: string,
  timeInterval: string = '300',
): Promise<IndexTimePrice[]> => {
  try {
    const params = new URLSearchParams({
      indexCode,
      timeInterval,
    });

    const response = await fetch(`/api/indexTimePrice?${params}`);

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);

    return data;
  } catch (error) {
    console.error('API 요청 중 오류 발생:', error);
    throw error;
  }
};
