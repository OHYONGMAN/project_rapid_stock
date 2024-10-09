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

  if (!prices) return <div>데이터가 없습니다.</div>;

  const validDate = new Date(prices.argument);
  if (isNaN(validDate.getTime())) {
    return <div>유효하지 않은 날짜입니다.</div>;
  }

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
      <div>{dateFormat.format(validDate)}</div>
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
        <span>거래량: {volume ? formatNumber(volume.value) : 'N/A'}</span>
      </div>
    </div>
  );
}
