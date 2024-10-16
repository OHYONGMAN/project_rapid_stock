export interface BaseStockData {
  stck_prpr: string; // 주식 현재가
  prdy_vrss: string; // 전일 대비
  prdy_ctrt: string; // 전일 대비율
  hts_kor_isnm: string; // 종목명
}

export interface StockRankData extends BaseStockData {
  acml_vol: string; // 누적 거래량
}

export interface IndexPriceData extends BaseStockData {
  bstp_nmix_prpr: string; // 지수 현재가
  bstp_nmix_prdy_vrss: string; // 지수 전일 대비
  bstp_nmix_prdy_ctrt: string; // 지수 전일 대비율
}

export interface StockDividendData extends BaseStockData {
  dvdn_ytm: string; // 배당 수익률
}

export type StockData = StockRankData | IndexPriceData | StockDividendData;

export const fetchStockData = async (
  dataType: string,
): Promise<StockData[]> => {
  try {
    const params = new URLSearchParams({ type: dataType });
    const response = await fetch(`/api/homeStock?${params}`);
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
