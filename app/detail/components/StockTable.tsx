'use client';

import React, { useState, useEffect, useCallback } from 'react';
import webSocketManager from '@/app/utils/kisApi/websocketManager';

// 실시간 주식 데이터 인터페이스 정의
interface RealTimeData {
  symbol: string; // 종목 코드
  time: string; // 거래 시간
  price: number; // 현재 가격
  change: number; // 전일 대비 가격 변화
  changeRate: number; // 전일 대비 변화율 (%)
  open: number; // 시가
  high: number; // 고가
  low: number; // 저가
  volume: number; // 거래량
  changeSign: string; // 전일 대비 상승/하락/보합 표시
}

// 숫자 포맷팅 (한국 원화 스타일)
const formatNumber = new Intl.NumberFormat('ko-KR', {
  minimumFractionDigits: 0,
}).format;

// 주식 테이블 컴포넌트 정의
export default function StockTable() {
  const [symbol, setSymbol] = useState('005930'); // 종목 코드 상태 관리 (기본값: 삼성전자)
  const [stockData, setStockData] = useState<RealTimeData | null>(null); // 실시간 주식 데이터 상태 관리
  const [error, setError] = useState<string | null>(null); // 에러 메시지 상태 관리

  // 실시간 데이터 수신 시 호출되는 콜백 함수
  const handleRealTimeData = useCallback((data: RealTimeData) => {
    setStockData(data); // 수신된 데이터를 상태에 저장
  }, []);

  // 컴포넌트가 마운트되거나 종목 코드가 변경될 때 실행
  useEffect(() => {
    webSocketManager.subscribe(symbol, handleRealTimeData); // 웹소켓을 통해 실시간 데이터 구독

    // 컴포넌트 언마운트 또는 종목 코드 변경 시 구독 해제
    return () => {
      webSocketManager.unsubscribe(symbol, handleRealTimeData);
    };
  }, [symbol, handleRealTimeData]);

  return (
    <div className="w-full">
      {/* 종목 코드 입력 필드 */}
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)} // 사용자 입력에 따라 종목 코드 업데이트
        className="w-full"
        placeholder="종목 코드를 입력하세요"
      />
      {error && <p className="text-red-500">{error}</p>}{' '}
      {/* 에러 메시지 표시 */}
      {stockData ? (
        // 주식 데이터를 표시하는 테이블
        <table>
          <thead>
            <tr>
              <th>현재가</th>
              <th>전일 대비</th>
              <th>전일 대비율</th>
              <th>거래량</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{formatNumber(stockData.price)} 원</td> {/* 현재가 */}
              <td>
                {formatNumber(stockData.change)} 원 {/* 전일 대비 가격 변화 */}
              </td>
              <td>{stockData.changeRate.toFixed(2)}%</td> {/* 전일 대비율 */}
              <td>
                {formatNumber(stockData.volume)} 주 {/* 거래량 */}
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p>데이터를 로딩 중입니다...</p> // 데이터 로딩 중 메시지
      )}
    </div>
  );
}
