// app/news/components/StockCharts.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchStockData } from '@/app/utils/kisApi/fetchStockData';
import { getOpenDays } from '@/app/utils/kisApi/holiday';
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
import TooltipTemplate from './TooltipTemplate';

// 주식 데이터 인터페이스 정의
interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 날짜를 한국어 형식으로 변환하는 함수
const formatDate = (dateString: string): string => {
  const year = dateString.slice(0, 4);
  const month = dateString.slice(4, 6);
  const day = dateString.slice(6, 8);
  return `${Number(month)}월 ${Number(day)}일`;
};

// 주식 차트 컴포넌트
export default function StockCharts({ timeUnit }: { timeUnit: 'D' }) {
  const [symbol, setSymbol] = useState('000660');
  const [chartData, setChartData] = useState<StockData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openDays, setOpenDays] = useState<string[]>([]);

  // 개장일 데이터를 불러오는 함수
  const loadOpenDays = useCallback(async () => {
    try {
      const openDaysSet = await getOpenDays();
      const openDaysArray = Array.from(openDaysSet);
      setOpenDays(openDaysArray);
    } catch (error) {
      setError('개장일 데이터를 불러오는 데 실패했습니다.');
    }
  }, []);

  useEffect(() => {
    loadOpenDays();
  }, [loadOpenDays]);

  // 주식 데이터를 불러오는 함수
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - 100);

      const startFormatted = startDate
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '');
      const endFormatted = today.toISOString().split('T')[0].replace(/-/g, '');

      let stockData = await fetchStockData(
        symbol,
        startFormatted,
        endFormatted,
      );

      // 개장일에 해당하는 데이터만 필터링
      stockData = stockData.filter((data) =>
        openDays.includes(data.date.replace(/-/g, '')),
      );

      // 날짜 변환 (월 일 형식)
      stockData = stockData.map((data) => ({
        ...data,
        date: formatDate(data.date),
      }));

      // 날짜를 숫자로 변환하여 오름차순 정렬
      stockData.sort((a, b) => {
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

      if (stockData.length === 0) {
        throw new Error('선택한 기간에 대한 데이터가 없습니다.');
      }

      setChartData(stockData);
    } catch (error) {
      setError('주식 데이터를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [symbol, openDays]);

  useEffect(() => {
    if (openDays.length > 0) {
      loadData();
    }
  }, [loadData, openDays]);

  return (
    <div className="w-full">
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
        placeholder="종목 코드를 입력하세요"
      />
      {error && <p className="text-red-500">{error}</p>}
      {isLoading ? (
        <p>로딩 중...</p>
      ) : chartData.length > 0 ? (
        <div className="h-[400px] w-full">
          <Chart
            id="stock-chart"
            dataSource={chartData}
            customizePoint={(pointInfo) => {
              return pointInfo.data.close >= pointInfo.data.open
                ? { color: '#1db2f5' }
                : { color: '#ff7285' };
            }}
          >
            {/* 가격 시리즈 */}
            <Series
              pane="Price"
              name="가격"
              argumentField="date"
              type="candlestick"
              openValueField="open"
              highValueField="high"
              lowValueField="low"
              closeValueField="close"
            />
            {/* 거래량 시리즈 */}
            <Series
              pane="Volume"
              name="거래량" // 거래량 시리즈 명칭이 '거래량'으로 설정
              argumentField="date"
              valueField="volume"
              type="bar"
            />
            <ArgumentAxis argumentType="string" tickInterval="day" />
            <ValueAxis pane="Price" />
            <ValueAxis pane="Volume" position="right" />
            <Pane name="Price" />
            <Pane name="Volume" height={100} />
            <ZoomAndPan argumentAxis="both" />
            <ScrollBar visible={true} />
            <LoadingIndicator enabled={true} />
            <Tooltip
              enabled={true}
              shared={true}
              contentRender={TooltipTemplate} // 툴팁에 데이터 전달
            />
            <Crosshair enabled={true} />
            <Legend visible={false} />
          </Chart>
        </div>
      ) : (
        <p>데이터가 없거나 로딩 중입니다.</p>
      )}
    </div>
  );
}
