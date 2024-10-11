// app/news/components/StockDailyChart.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchStockData } from '@/app/utils/kisApi/stock';
import Chart, {
  ArgumentAxis,
  ValueAxis,
  Series,
  ScrollBar,
  ZoomAndPan,
  LoadingIndicator,
  Pane,
  Tooltip,
  Crosshair,
  Legend,
} from 'devextreme-react/chart';
import StockChartTooltip from './StockChartTooltip';

// 주식 데이터 인터페이스 정의
interface StockData {
  date: string; // 날짜
  open: number; // 시가
  high: number; // 고가
  low: number; // 저가
  close: number; // 종가
  volume: number; // 거래량
}

// 날짜를 한국어 형식으로 변환하는 함수 (YYYYMMDD -> MM월 DD일)
const formatDate = (dateString: string): string => {
  const year = dateString.slice(0, 4);
  const month = dateString.slice(4, 6);
  const day = dateString.slice(6, 8);
  return `${Number(month)}월 ${Number(day)}일`;
};

// 주식 차트를 렌더링하는 컴포넌트
export default function StockChart() {
  const [symbol, setSymbol] = useState('000660'); // 종목 코드 상태 관리
  const [chartData, setChartData] = useState<StockData[]>([]); // 차트 데이터 상태 관리
  const [error, setError] = useState<string | null>(null); // 에러 메시지 상태 관리
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리
  const [timeUnit, setTimeUnit] = useState<'D' | 'W' | 'M'>('D'); // 시간 단위 상태 관리 (일봉/주봉/월봉)

  // 주식 데이터를 가져와 차트에 표시하는 함수
  const loadData = useCallback(async () => {
    setIsLoading(true); // 로딩 시작
    setError(null); // 에러 초기화
    try {
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - 500); // 최근 500일 데이터를 가져오기 위한 시작 날짜 설정

      // 날짜를 'YYYYMMDD' 형식으로 변환
      const startFormatted = startDate
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '');
      const endFormatted = today.toISOString().split('T')[0].replace(/-/g, '');

      // 주식 데이터를 API에서 가져옴 (일/주/월 단위로)
      const stockData = await fetchStockData(
        symbol,
        startFormatted,
        endFormatted,
        timeUnit,
      );

      // 가져온 데이터를 'MM월 DD일' 형식으로 변환
      const formattedData = stockData.map((data) => ({
        ...data,
        date: formatDate(data.date),
      }));

      // 날짜 데이터를 기준으로 정렬
      formattedData.sort((a, b) => {
        const [monthA, dayA] = a.date
          .split('월')
          .map((part) => parseInt(part, 10));
        const [monthB, dayB] = b.date
          .split('월')
          .map((part) => parseInt(part, 10));

        if (monthA === monthB) {
          return dayA - dayB;
        }
        return monthA - monthB;
      });

      // 데이터가 없을 때 예외 처리
      if (formattedData.length === 0) {
        throw new Error('선택한 기간에 대한 데이터가 없습니다.');
      }

      setChartData(formattedData); // 차트 데이터 업데이트
    } catch (error) {
      setError('주식 데이터를 불러오는 데 실패했습니다.'); // 에러 메시지 설정
    } finally {
      setIsLoading(false); // 로딩 완료
    }
  }, [symbol, timeUnit]); // 종목 코드 및 시간 단위 변경 시 데이터를 다시 로드

  // 컴포넌트가 마운트될 때 데이터를 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="w-full">
      {/* 종목 코드를 입력할 수 있는 텍스트 입력창 */}
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
        placeholder="종목 코드를 입력하세요"
      />
      {/* 일봉, 주봉, 월봉 선택 버튼 */}
      <div className="flex space-x-2 mb-4">
        <button
          className={`p-2 border rounded ${timeUnit === 'D' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setTimeUnit('D')}
        >
          일봉
        </button>
        <button
          className={`p-2 border rounded ${timeUnit === 'W' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setTimeUnit('W')}
        >
          주봉
        </button>
        <button
          className={`p-2 border rounded ${timeUnit === 'M' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setTimeUnit('M')}
        >
          월봉
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}{' '}
      {/* 에러 메시지 출력 */}
      {isLoading ? (
        <p>로딩 중...</p> // 로딩 중일 때 표시
      ) : chartData.length > 0 ? (
        <div className="h-[400px] w-full">
          <Chart
            id="stock-chart"
            dataSource={chartData} // 차트에 표시할 데이터 설정
            customizePoint={(pointInfo) => {
              return pointInfo.data.close >= pointInfo.data.open
                ? { color: '#1db2f5' } // 상승일 때 파란색
                : { color: '#ff7285' }; // 하락일 때 빨간색
            }}
          >
            {/* 가격 시리즈 */}
            <Series
              pane="Price"
              name="가격"
              argumentField="date" // X축 데이터 (날짜)
              type="candlestick" // 캔들스틱 차트 타입
              openValueField="open" // 시가
              highValueField="high" // 고가
              lowValueField="low" // 저가
              closeValueField="close" // 종가
            />
            {/* 거래량 시리즈 */}
            <Series
              pane="Volume"
              name="거래량"
              argumentField="date" // X축 데이터 (날짜)
              valueField="volume" // 거래량
              type="bar" // 막대 차트 타입
            />
            <ArgumentAxis argumentType="string" tickInterval="day" />{' '}
            {/* X축 설정 */}
            <ValueAxis pane="Price" /> {/* 가격 축 */}
            <ValueAxis pane="Volume" position="right" /> {/* 거래량 축 */}
            <Pane name="Price" /> {/* 가격 표시 영역 */}
            <Pane name="Volume" height={100} /> {/* 거래량 표시 영역 */}
            <ZoomAndPan argumentAxis="both" /> {/* 줌 및 팬 기능 */}
            <ScrollBar visible={true} /> {/* 스크롤 바 표시 */}
            <LoadingIndicator enabled={true} /> {/* 로딩 인디케이터 */}
            <Tooltip
              enabled={true}
              shared={true}
              contentRender={StockChartTooltip} // 툴팁으로 데이터 표시
            />
            <Crosshair enabled={true} /> {/* 크로스헤어 기능 */}
            <Legend visible={false} /> {/* 범례 숨김 */}
          </Chart>
        </div>
      ) : (
        <p>데이터가 없거나 로딩 중입니다.</p> // 데이터가 없을 때 표시
      )}
    </div>
  );
}
