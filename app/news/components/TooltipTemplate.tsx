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

interface PointInfo {
  points: any[];
  argumentText: string;
}

export default function TooltipTemplate({ points, argumentText }: PointInfo) {
  const ohlc = points.find((point) => point.seriesName === 'candlestick');
  const volume = points.find((point) => point.seriesName === 'Volume');

  return (
    <div className="tooltip-template">
      <div>{argumentText}</div>
      <div>
        <span>시가: </span>
        {formatCurrency(ohlc.openValue)}
      </div>
      <div>
        <span>고가: </span>
        {formatCurrency(ohlc.highValue)}
      </div>
      <div>
        <span>저가: </span>
        {formatCurrency(ohlc.lowValue)}
      </div>
      <div>
        <span>종가: </span>
        {formatCurrency(ohlc.closeValue)}
      </div>
      <div>
        <span>거래량: </span>
        {formatNumber(volume.value)}
      </div>
    </div>
  );
}