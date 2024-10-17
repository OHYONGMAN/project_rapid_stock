export interface BaseStockData {
  stck_prpr: string; // 주식 현재가
  prdy_vrss: string; // 전일 대비
  prdy_ctrt: string; // 전일 대비율
  hts_kor_isnm: string; // 종목명
}

export interface IndexPriceData {
  bstp_nmix_prpr: string; // 업종 지수 현재가
  bstp_nmix_prdy_vrss: string; // 업종 지수 전일 대비
  prdy_vrss_sign: string; // 전일 대비 부호
  bstp_nmix_prdy_ctrt: string; // 업종 지수 전일 대비율
  acml_vol: string; // 누적 거래량
  prdy_vol: string; // 전일 거래량
  acml_tr_pbmn: string; // 누적 거래 대금
  prdy_tr_pbmn: string; // 전일 거래 대금
  bstp_nmix_oprc: string; // 업종 지수 시가
  bstp_nmix_hgpr: string; // 업종 지수 최고가
  bstp_nmix_lwpr: string; // 업종 지수 최저가
  ascn_issu_cnt: string; // 상승 종목 수
  uplm_issu_cnt: string; // 상한 종목 수
  down_issu_cnt: string; // 하락 종목 수
  lslm_issu_cnt: string; // 하한 종목 수
}

export interface StockRankData extends BaseStockData {
  mksc_shrn_iscd: string; // 유가증권 단축 종목코드
  data_rank: string; // 데이터 순위
  acml_vol: string; // 누적 거래량
  prdy_vol: string; // 전일 거래량
  lstn_stcn: string; // 상장 주수
  avrg_vol: string; // 평균 거래량
  n_befr_clpr_vrss_prpr_rate: string; // N일전종가대비현재가대비율
  vol_inrt: string; // 거래량증가율
  vol_tnrt: string; // 거래량 회전율
  nday_vol_tnrt: string; // N일 거래량 회전율
  avrg_tr_pbmn: string; // 평균 거래 대금
  tr_pbmn_tnrt: string; // 거래대금회전율
  nday_tr_pbmn_tnrt: string; // N일 거래대금 회전율
  acml_tr_pbmn: string; // 누적 거래 대금
}

export interface StockCapitalizationData extends BaseStockData {
  mksc_shrn_iscd: string; // 유가증권 단축 종목코드
  data_rank: string; // 데이터 순위
  prdy_vrss: string; // 전일 대비
  prdy_vrss_sign: string; // 전일 대비 부호
  acml_vol: string; // 누적 거래량
  lstn_stcn: string; // 상장 주수
  stck_avls: string; // 시가 총액
  mrkt_whol_avls_rlim: string; // 시장 전체 시가총액 비중
}

export interface StockDividendData extends BaseStockData {
  rank: string; // 순위
  sht_cd: string; // 종목코드
  isin_name: string; // 종목명
  record_date: string; // 기준일
  per_sto_divi_amt: string; // 현금/주식배당금
  divi_rate: string; // 현금/주식배당률(%)
  divi_kind: string; // 배당종류
}

export type StockData =
  | IndexPriceData
  | StockRankData
  | StockCapitalizationData
  | StockDividendData;

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
