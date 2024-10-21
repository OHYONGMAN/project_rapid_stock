// 지수 시간별 가격 데이터 인터페이스
export interface IndexTimePrice {
  symbol: string; // 지수 코드
  time: string; // 시간
  price: number; // 가격
  change: number; // 변화량
  changeRate: number; // 변화율
  volume: number; // 거래량
}

// 지수 시간별 가격 데이터 조회 함수
export const fetchIndexTimePrice = async (
  indexCode: string,
  timeInterval: string = '300',
): Promise<IndexTimePrice[]> => {
  try {
    // API 요청 파라미터 설정
    const params = new URLSearchParams({
      indexCode,
      timeInterval,
    });

    // API 요청 실행
    const response = await fetch(`/api/indexTimePrice?${params}`);

    // HTTP 오류 처리
    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태: ${response.status}`);
    }

    // 응답 데이터 파싱
    const data: IndexTimePrice[] = await response.json();
    console.log(data);

    // 파싱된 데이터 반환
    return data;
  } catch (error) {
    // 오류 로깅 및 예외 전파
    console.error('API 요청 중 오류 발생:', error);
    throw error;
  }
};
