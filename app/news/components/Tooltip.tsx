// app/news/components/Tooltip.tsx

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

export default function TooltipTemplate(pointInfo) {
  const volume = pointInfo.points.filter(
    (point: { seriesName: string }) => point.seriesName === '거래량',
  )[0];

  const prices = pointInfo.points.filter(
    (point: { seriesName: string }) => point.seriesName !== '거래량',
  )[0];

  return (
    <div className="tooltip-template">
      <div>{pointInfo.argumentText}</div>
      <div>
        <span>시가: </span>
        {prices && prices.openValue ? formatCurrency(prices.openValue) : 'N/A'}
      </div>
      <div>
        <span>고가: </span>
        {prices && prices.highValue ? formatCurrency(prices.highValue) : 'N/A'}
      </div>
      <div>
        <span>저가: </span>
        {prices && prices.lowValue ? formatCurrency(prices.lowValue) : 'N/A'}
      </div>
      <div>
        <span>종가: </span>
        {prices && prices.closeValue
          ? formatCurrency(prices.closeValue)
          : 'N/A'}
      </div>
      <div>
        <span>거래량: </span>
        {volume && volume.value ? formatNumber(volume.value) : 'N/A'}
      </div>
    </div>
  );
}
