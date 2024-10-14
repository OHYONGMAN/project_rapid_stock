// 주식 데이터 조회 API 엔드포인트

import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/app/utils/kisApi/token";

// GET 요청 처리 함수 (일봉/주봉/월봉 데이터를 조회)
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url); // URL 파라미터에서 symbol과 timeUnit 값을 추출
    const symbol = searchParams.get("symbol"); // 주식 종목 코드를 받아옴
    const timeUnit = searchParams.get("timeUnit"); // 데이터의 시간 단위를 받아옴

    // 잘못된 파라미터 확인
    if (!symbol || !timeUnit || !["D", "W", "M"].includes(timeUnit)) {
        console.error("잘못된 파라미터:", { symbol, timeUnit });
        return NextResponse.json(
            {
                error:
                    "잘못되거나 누락된 파라미터입니다. D (일봉), W (주봉), M (월봉) 시간 단위만 지원됩니다.",
            },
            { status: 400 },
        );
    }

    try {
        const token = await getValidToken(); // 유효한 API 접근 토큰을 받아옴

        // 토큰이 없으면 에러 반환
        if (!token) {
            console.error("액세스 토큰 발급 실패");
            return NextResponse.json(
                { error: "액세스 토큰 발급에 실패했습니다." },
                { status: 500 },
            );
        }

        // 최근 500일의 데이터를 요청할 날짜 계산 (일/주/월)
        const today = new Date(); // 현재 날짜를 기준으로 설정
        const pastDate = new Date(today); // 기준 날짜를 생성
        pastDate.setDate(today.getDate() - 100); // 지난 100일의 데이터를 조회

        // 날짜를 YYYYMMDD 형식으로 변환하여 API에 전달할 수 있도록 가공
        const startDate = pastDate.toISOString().split("T")[0].replace(
            /-/g,
            "",
        );
        const endDate = today.toISOString().split("T")[0].replace(/-/g, "");

        // 기간별 데이터를 요청하는 API URL과 파라미터 설정
        const url =
            "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice";
        const params = new URLSearchParams({
            FID_COND_MRKT_DIV_CODE: "J", // 시장 구분 코드
            FID_INPUT_ISCD: symbol, // 주식 종목 코드
            FID_INPUT_DATE_1: startDate, // 시작 날짜
            FID_INPUT_DATE_2: endDate, // 끝 날짜
            FID_PERIOD_DIV_CODE: timeUnit, // 시간 단위 (D:일봉, W:주봉, M:월봉)
            FID_ORG_ADJ_PRC: "0", // 원래 가격을 사용하는지 여부
        });
        const trId = "FHKST03010100"; // 거래 ID

        // API 호출에 필요한 헤더 설정
        const headers = {
            "content-type": "application/json; charset=utf-8", // 요청의 데이터 타입을 명시
            authorization: `Bearer ${token}`, // API 토큰
            appkey: process.env.NEXT_PUBLIC_KIS_API_KEY!, // 앱 키
            appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET!, // 앱 시크릿
            tr_id: trId, // 거래 ID
            custtype: "P", // 고객 타입 (개인)
        };

        // API 호출
        const response = await fetch(`${url}?${params}`, {
            method: "GET",
            headers, // 헤더 포함
        });

        // 호출 실패 시 에러 처리
        if (!response.ok) {
            console.error(`HTTP 오류! 상태: ${response.status}`);
            const errorText = await response.text();
            console.error("에러 응답:", errorText);
            throw new Error(`HTTP 오류! 상태: ${response.status}`);
        }

        const data = await response.json(); // API 응답 데이터를 JSON으로 파싱

        // API 오류 시 에러 메시지 반환
        if (data.rt_cd !== "0") {
            console.error(`API 에러: ${data.msg1}`);
            throw new Error(`API 에러: ${data.msg1}`);
        }

        // 종목 이름 추출
        const stockName = data.output1.hts_kor_isnm; // 종목명

        // 받은 데이터를 가공하여 필요한 형식으로 변환
        const processedData = data.output2.map((item: any) => ({
            name: stockName, // 종목명
            date: item.stck_bsop_date, // 거래 일자
            open: parseFloat(item.stck_oprc), // 시가
            high: parseFloat(item.stck_hgpr), // 고가
            low: parseFloat(item.stck_lwpr), // 저가
            close: parseFloat(item.stck_prpr || item.stck_clpr), // 종가
            volume: parseInt(item.cntg_vol || item.acml_vol, 10), // 거래량
        }));

        // 가공된 데이터를 JSON으로 반환
        return NextResponse.json(processedData);
    } catch (error) {
        // API 호출 실패 시 에러 처리
        console.error("주식 데이터 가져오기 실패:", error);
        return NextResponse.json(
            {
                error: "서버 내부 오류",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
        );
    }
}
