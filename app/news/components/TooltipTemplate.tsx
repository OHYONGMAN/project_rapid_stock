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

export default function TooltipTemplate(pointInfo: any) {
  const volume = pointInfo.points.filter(
    (point: { seriesName: string }) => point.seriesName === 'Volume',
  )[0];
  const prices = pointInfo.points.filter(
    (point: { seriesName: string }) => point.seriesName !== 'Volume',
  )[0];

  const dateFormat = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });

  return (
    <div className="tooltip-template">
      <div>{dateFormat.format(prices.argument)}</div>
      <div>
        <span>시가: {formatCurrency(prices.openValue)}</span>
      </div>
      <div>
        <span>고가: {formatCurrency(prices.highValue)}</span>
      </div>
      <div>
        <span>저가: {formatCurrency(prices.lowValue)}</span>
      </div>
      <div>
        <span>종가: {formatCurrency(prices.closeValue)} </span>
      </div>
      <div>
        <span>거래량: {formatNumber(volume.value)}</span>
      </div>
    </div>
  );
}
