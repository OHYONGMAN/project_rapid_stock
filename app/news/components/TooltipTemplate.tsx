'use client'; // Next.js에서 클라이언트 측에서만 렌더링되는 컴포넌트를 나타냅니다.

import React from 'react'; // React 라이브러리를 가져옵니다.

// 통화를 형식화하는 함수입니다.
const formatCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency', // 통화 형식으로 설정합니다.
  currency: 'USD', // 통화 단위를 USD로 설정합니다.
  minimumFractionDigits: 0, // 소수점 이하 자릿수를 0으로 설정합니다.
}).format;

// 숫자를 형식화하는 함수입니다.
const formatNumber = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0, // 소수점 이하 자릿수를 0으로 설정합니다.
}).format;

// TooltipTemplate 컴포넌트를 정의합니다.
export default function TooltipTemplate(pointInfo: {
  points: any; // 포인트 데이터 배열입니다.
  argumentText: string; // 인수 텍스트입니다.
}) {
  // 'Volume' 시리즈의 포인트를 필터링하여 가져옵니다.
  const volume = pointInfo.points.filter(
    (point: { seriesName: string }) => point.seriesName === 'Volume',
  )[0];

  // 'Volume'이 아닌 시리즈의 포인트를 필터링하여 가져옵니다.
  const prices = pointInfo.points.filter(
    (point: { seriesName: string }) => point.seriesName !== 'Volume',
  )[0];

  // 툴팁 템플릿을 렌더링합니다.
  return (
    <div className="tooltip-template">
      <div>{pointInfo.argumentText}</div> {/* 인수 텍스트를 표시합니다. */}
      <div>
        <span>Open: </span>
        {formatCurrency(prices.openValue)}{' '}
        {/* 개장가를 통화 형식으로 표시합니다. */}
      </div>
      <div>
        <span>High: </span>
        {formatCurrency(prices.highValue)}{' '}
        {/* 최고가를 통화 형식으로 표시합니다. */}
      </div>
      <div>
        <span>Low: </span>
        {formatCurrency(prices.lowValue)}{' '}
        {/* 최저가를 통화 형식으로 표시합니다. */}
      </div>
      <div>
        <span>Close: </span>
        {formatCurrency(prices.closeValue)}{' '}
        {/* 종가를 통화 형식으로 표시합니다. */}
      </div>
      <div>
        <span>Volume: </span>
        {formatNumber(volume.value)} {/* 거래량을 숫자 형식으로 표시합니다. */}
      </div>
    </div>
  );
}
