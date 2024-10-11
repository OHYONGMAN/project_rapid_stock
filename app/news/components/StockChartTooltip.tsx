// app/news/components/StockChartTooltip.tsx

import React from 'react';

const formatNumber = new Intl.NumberFormat('ko-KR', {
  minimumFractionDigits: 0,
}).format;

interface StockChartTooltipProps {
  data?: {
    argument?: string;
    closeValue?: number;
    highValue?: number;
    lowValue?: number;
    openValue?: number;
    seriesName?: string;
    value?: number;
  };
  realTimeData?: {
    price: number;
    change: number;
    changeRate: number;
    volume: number;
  } | null;
}

export default function StockChartTooltip({
  data,
  realTimeData,
}: StockChartTooltipProps) {
  if (!data) return null;

  const { argument, openValue, highValue, lowValue, closeValue, value } = data;

  return (
    <div className="tooltip-template">
      <div>{argument}</div>
      {openValue !== undefined && (
        <div>
          <span>시가: {formatNumber(openValue)} 원</span>
        </div>
      )}
      {highValue !== undefined && (
        <div>
          <span>고가: {formatNumber(highValue)} 원</span>
        </div>
      )}
      {lowValue !== undefined && (
        <div>
          <span>저가: {formatNumber(lowValue)} 원</span>
        </div>
      )}
      {closeValue !== undefined && (
        <div>
          <span>종가: {formatNumber(closeValue)} 원</span>
        </div>
      )}
      {value !== undefined && (
        <div>
          <span>거래량: {formatNumber(value)} 주</span>
        </div>
      )}
      {realTimeData && (
        <div>
          <strong>실시간 데이터</strong>
          <div>현재가: {formatNumber(realTimeData.price)} 원</div>
          <div>
            변동: {formatNumber(realTimeData.change)} 원 (
            {realTimeData.changeRate.toFixed(2)}%)
          </div>
          <div>거래량: {formatNumber(realTimeData.volume)} 주</div>
        </div>
      )}
    </div>
  );
}
