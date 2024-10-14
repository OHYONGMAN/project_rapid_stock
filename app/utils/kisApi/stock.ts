// 주식 데이터를 가져오는 유틸리티 함수 정의

// 주식 데이터 인터페이스 정의
interface StockData {
    name: string; // 종목 이름
    date: string; // 거래 일자
    open: number; // 시가
    high: number; // 고가
    low: number; // 저가
    close: number; // 종가
    volume: number; // 거래량
}

// 주식 데이터를 API에서 받아오는 함수 (일봉 데이터를 요청)
// symbol: 종목 코드, startDate: 시작 날짜, endDate: 종료 날짜
export const fetchStockData = async (
    symbol: string,
    startDate: string,
    endDate: string,
): Promise<StockData[]> => {
    // API 요청에 필요한 파라미터 설정
    const params = new URLSearchParams({
        symbol, // 종목 코드
        timeUnit: "D", // 일봉 데이터 요청 ("D": 일봉)
        startDate, // 시작 날짜 (YYYYMMDD 형식)
        endDate, // 종료 날짜 (YYYYMMDD 형식)
    });

    try {
        // 주식 데이터를 가져오기 위한 API 요청
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/stock?${params}`, // 백엔드 API 엔드포인트 호출
        );

        // 응답이 정상적이지 않을 경우 에러 처리
        if (!response.ok) {
            throw new Error(`HTTP 오류 발생! 상태: ${response.status}`);
        }

        // API로부터 받은 데이터를 JSON 형식으로 변환
        const data = await response.json();

        // 종목 이름을 output1에서 추출 (필요할 경우 추가적인 확인 필요)
        const stockName = data.output1?.hts_kor_isnm || "종목 이름 없음"; // 종목 이름 가져오기

        // 데이터를 StockData 형식으로 변환하여 반환
        return data.map((item: any): StockData => ({
            name: stockName, // 종목명
            date: item.date, // 거래 일자
            open: Number(item.open), // 시가
            high: Number(item.high), // 고가
            low: Number(item.low), // 저가
            close: Number(item.close), // 종가
            volume: Number(item.volume), // 거래량
        }));
    } catch (error) {
        // 데이터 요청 실패 시 에러 출력 및 상위 호출부로 전달
        console.error("주식 데이터 요청에 실패했습니다.", error);
        throw error;
    }
};
