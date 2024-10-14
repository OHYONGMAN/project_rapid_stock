// app/news/components/StockChartTooltip.tsx

import React from 'react';

const formatNumber = new Intl.NumberFormat('ko-KR', {
  minimumFractionDigits: 0,
}).format;

interface StockChartTooltipProps {
  data: {
    argument?: string;
    points?: Array<{
      seriesName?: string;
      value?: number;
      originalValue?: number;
      originalArgument?: string;
      point?: {
        data?: {
          open?: number;
          high?: number;
          low?: number;
          close?: number;
        };
      };
    }>;
  };
}

export default function StockChartTooltip({ data }: StockChartTooltipProps) {
  if (!data || !data.points || data.points.length === 0) return null;

  const point = data.points[0];
  const { open, high, low, close } = point.point?.data || {};
  const volume = point.value;

  return (
    <div className="tooltip-template">
      <div>{data.argument}</div>
      {open !== undefined && (
        <div>
          <span>시가: {formatNumber(open)} 원</span>
        </div>
      )}
      {high !== undefined && (
        <div>
          <span>고가: {formatNumber(high)} 원</span>
        </div>
      )}
      {low !== undefined && (
        <div>
          <span>저가: {formatNumber(low)} 원</span>
        </div>
      )}
      {close !== undefined && (
        <div>
          <span>종가: {formatNumber(close)} 원</span>
        </div>
      )}
      {volume !== undefined && (
        <div>
          <span>거래량: {formatNumber(volume)} 주</span>
        </div>
      )}
    </div>
  );
}
