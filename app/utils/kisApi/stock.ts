// app/utils/kisApi/stock.ts

// 주식 데이터 인터페이스 정의
interface StockData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

// 주식 데이터를 API에서 받아오는 함수 (일봉 데이터를 요청)
export const fetchStockData = async (
    symbol: string, // 종목 코드
    startDate: string, // 시작 날짜
    endDate: string, // 종료 날짜
): Promise<StockData[]> => {
    // API 요청에 필요한 파라미터 설정
    const params = new URLSearchParams({
        symbol, // 종목 코드
        timeUnit: "D", // 일봉만 요청
        startDate, // 시작 날짜
        endDate, // 종료 날짜
    });

    try {
        // 주식 데이터를 가져오기 위한 API 요청
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/stock?${params}`, // API 엔드포인트 호출
        );

        // 응답이 정상적이지 않을 경우 에러 처리
        if (!response.ok) {
            throw new Error(`HTTP 오류 발생! 상태: ${response.status}`);
        }

        // API로부터 받은 데이터를 JSON 형식으로 변환
        const data = await response.json();

        // 데이터를 StockData 형식으로 변환하여 반환
        return data.map((item: any): StockData => ({
            date: item.date, // 날짜 정보
            open: Number(item.open), // 시가
            high: Number(item.high), // 고가
            low: Number(item.low), // 저가
            close: Number(item.close), // 종가
            volume: Number(item.volume), // 거래량
        }));
    } catch (error) {
        // 데이터 요청 실패 시 에러 출력
        console.error("주식 데이터 요청에 실패했습니다.", error);
        throw error; // 에러 발생 시 상위 호출부로 전달
    }
};
