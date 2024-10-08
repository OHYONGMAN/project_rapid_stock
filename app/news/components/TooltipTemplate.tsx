// app/news/components/TooltipTemplate.tsx

'use client';

import React from 'react';

const formatCurrency = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  minimumFractionDigits: 0,
}).format;

const formatNumber = new Intl.NumberFormat('ko-KR', {
  minimumFractionDigits: 0,
}).format;

interface TooltipProps {
  data?: {
    argument: Date;
    seriesName: string;
    openValue: number;
    highValue: number;
    lowValue: number;
    closeValue: number;
    value: number;
  };
}

export default function TooltipTemplate(props: TooltipProps) {
  if (!props.data) {
    return <div>데이터가 없습니다</div>; // data가 없을 때 처리
  }

  const { argument, openValue, highValue, lowValue, closeValue, value } =
    props.data;

  return (
    <div className="tooltip-template">
      <div>{argument.toLocaleDateString()}</div>
      <div>
        <span>시가: </span>
        {formatCurrency(openValue)}
      </div>
      <div>
        <span>고가: </span>
        {formatCurrency(highValue)}
      </div>
      <div>
        <span>저가: </span>
        {formatCurrency(lowValue)}
      </div>
      <div>
        <span>종가: </span>
        {formatCurrency(closeValue)}
      </div>
      <div>
        <span>거래량: </span>
        {formatNumber(value)}
      </div>
    </div>
  );
}
