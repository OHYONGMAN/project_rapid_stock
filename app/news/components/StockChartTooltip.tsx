// app/news/components/StockChartTooltip.tsx

'use client';

import React from 'react';

// 숫자를 천 단위로 포맷팅하는 함수 (한국 원화 형식)
const formatNumber = new Intl.NumberFormat('ko-KR', {
  minimumFractionDigits: 0,
}).format;

// 주식 차트에서 툴팁을 렌더링하는 컴포넌트
export default function StockChartTooltip(pointInfo: any) {
  // 거래량 데이터를 필터링하여 가져옴 (시리즈 이름이 '거래량'인 데이터를 추출)
  const volume = pointInfo.points.filter(
    (point: { seriesName: string }) => point.seriesName === '거래량',
  )[0];

  // 가격 정보를 필터링하여 가져옴 (시리즈 이름이 '거래량'이 아닌 데이터를 추출)
  const prices = pointInfo.points.filter(
    (point: { seriesName: string }) => point.seriesName !== '거래량',
  )[0];

  // 가격 정보가 없을 경우 예외 처리
  if (!prices) return <div>데이터가 없습니다.</div>;

  // 날짜 정보를 차트에서 받아서 포맷팅하지 않고 그대로 사용
  const formattedDate = prices.argument;

  return (
    <div className="tooltip-template">
      {/* 날짜 출력 */}
      <div>{formattedDate}</div>

      {/* 시가, 고가, 저가, 종가 출력 */}
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

      {/* 거래량 출력, 거래량 데이터가 없으면 'N/A' 표시 */}
      <div>
        <span>
          거래량:{' '}
          {volume && volume.value ? `${formatNumber(volume.value)} 주` : 'N/A'}
        </span>
      </div>
    </div>
  );
}
