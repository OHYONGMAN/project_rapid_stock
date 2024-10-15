// 클라이언트 측에서 주식 데이터를 가져오는 유틸리티 함수

// 주식 데이터 인터페이스 정의
export interface StockData {
  currentPrice: string;
  priceChange: string;
  priceChangeRate: string;
  volume: string;
}

// 주식 데이터를 API에서 직접 가져오는 함수 (화면에서 사용)
export const fetchTodayStockData = async (
  symbol: string,
): Promise<StockData[]> => {
  try {
    // API 호출을 위한 URL 파라미터 구성
    const params = new URLSearchParams({ symbol });

    const response = await fetch(
      `/api/todayStock?${params}`, // API 엔드포인트 호출
    );

    // API 응답이 정상적이지 않을 경우 에러 처리
    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태: ${response.status}`);
    }

    // 데이터를 JSON 형식으로 파싱하여 반환
    const data = await response.json();

    return data; // API에서 이미 처리된 데이터를 그대로 반환
  } catch (error) {
    throw new Error(`주식 데이터 요청 실패: ${error.message}`);
  }
};
