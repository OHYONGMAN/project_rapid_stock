// app/news/components/StockChartTooltip.tsx

'use client';

import React from 'react';

// 숫자를 천 단위로 포맷팅하는 함수 (KRW, 거래량용)
const formatNumber = new Intl.NumberFormat('ko-KR', {
  minimumFractionDigits: 0,
}).format;

export default function StockChartTooltip(pointInfo: any) {
  // 거래량 정보 필터링
  const volume = pointInfo.points.filter(
    (point: { seriesName: string }) => point.seriesName === '거래량',
  )[0];

  // 가격 정보 필터링
  const prices = pointInfo.points.filter(
    (point: { seriesName: string }) => point.seriesName !== '거래량',
  )[0];

  if (!prices) return <div>데이터가 없습니다.</div>;

  // 날짜 정보
  const formattedDate = prices.argument; // 차트에서 이미 문자열로 날짜가 제공됨

  return (
    <div className="tooltip-template">
      <div>{formattedDate}</div>
      <div>
        <span>시가: {formatNumber(prices.openValue)} 원</span>
      </div>
      <div>
        <span>고가: {formatNumber(prices.highValue)} 원</span>
      </div>
      <div>
        <span>저가: {formatNumber(prices.lowValue)} 원</span>
      </div>
      <div>
        <span>종가: {formatNumber(prices.closeValue)} 원</span>
      </div>
      <div>
        <span>
          {/* 거래량이 있는 경우 "주"를 붙이고, 없는 경우 N/A 표시 */}
          거래량:{' '}
          {volume && volume.value ? `${formatNumber(volume.value)} 주` : 'N/A'}
        </span>
      </div>
    </div>
  );
}
