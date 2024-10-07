import { getValidToken } from "@/app/utils/kisApi/token";

export const fetchStockData = async (symbol: string) => {
    try {
        const response = await fetch("/api/fetchStockData", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ symbol }),
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            console.error("Failed to fetch stock data", errorDetails);
            throw new Error(
                `Failed to fetch stock data: ${
                    errorDetails?.error || "Unknown error"
                }`,
            );
        }

        const responseData = await response.json();

        // 응답 구조 유효성 검사
        if (!responseData.output2) {
            throw new Error("Invalid response structure: missing output2");
        }

        // 주식 데이터를 맵핑하여 반환
        const output = responseData.output2;
        return output.map((item: any) => ({
            date: item.stck_bsop_date,
            close: parseFloat(item.stck_clpr),
            open: parseFloat(item.stck_oprc),
            high: parseFloat(item.stck_hgpr),
            low: parseFloat(item.stck_lwpr),
            volume: parseInt(item.acml_vol, 10), // acml_vo → acml_vol 로 수정
        }));
    } catch (error) {
        console.error("Failed to fetch stock data", error);
        throw error; // 오류를 호출자에게 전달
    }
};
