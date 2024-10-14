'use client';

import React from 'react';

// 숫자 포맷팅을 위한 형식 지정 (한국 원화 스타일)
const formatNumber = new Intl.NumberFormat('ko-KR', {
  minimumFractionDigits: 0, // 소수점 이하 자릿수 0
}).format;

interface StockChartTooltipProps {
  data: {
    argument?: string; // 날짜 정보
    points?: Array<{
      seriesName?: string; // 시리즈 이름
      value?: number; // 값 (거래량)
      originalValue?: number; // 원래 값
      originalArgument?: string; // 원래 날짜 정보
      point?: {
        data?: {
          open?: number; // 시가
          high?: number; // 고가
          low?: number; // 저가
          close?: number; // 종가
        };
      };
    }>;
  };
}

// 툴팁 컴포넌트
export default function StockChartTooltip({ data }: StockChartTooltipProps) {
  // 데이터가 없거나 포인트가 없으면 아무것도 표시하지 않음
  if (!data || !data.points || data.points.length === 0) return null;

  const point = data.points[0]; // 첫 번째 포인트 데이터 가져오기
  const { open, high, low, close } = point.point?.data || {}; // 시가, 고가, 저가, 종가 추출
  const volume = point.value; // 거래량 추출

  return (
    <div className="tooltip-template">
      <div>{data.argument}</div> {/* 날짜 표시 */}
      {open !== undefined && (
        <div>
          <span>시가: {formatNumber(open)} 원</span> {/* 시가 표시 */}
        </div>
      )}
      {high !== undefined && (
        <div>
          <span>고가: {formatNumber(high)} 원</span> {/* 고가 표시 */}
        </div>
      )}
      {low !== undefined && (
        <div>
          <span>저가: {formatNumber(low)} 원</span> {/* 저가 표시 */}
        </div>
      )}
      {close !== undefined && (
        <div>
          <span>종가: {formatNumber(close)} 원</span> {/* 종가 표시 */}
        </div>
      )}
      {volume !== undefined && (
        <div>
          <span>거래량: {formatNumber(volume)} 주</span> {/* 거래량 표시 */}
        </div>
      )}
    </div>
  );
}
