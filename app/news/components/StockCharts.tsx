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

interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockChartsProps {
  timeUnit: 'D'; // 일봉 데이터를 처리하기 위한 명확한 타입 정의
}

export default function StockCharts({ timeUnit }: StockChartsProps) {
  const [symbol, setSymbol] = useState('000660');
  const [chartData, setChartData] = useState<StockData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openDays, setOpenDays] = useState<string[]>([]); // 거래일 데이터를 배열로 저장

  const loadOpenDays = useCallback(async () => {
    try {
      const openDaysSet = await getOpenDays();
      const openDaysArray = Array.from(openDaysSet); // Set을 배열로 변환
      setOpenDays(openDaysArray);
    } catch (error) {
      setError('Failed to load market calendar.');
    }
  }, []);

  useEffect(() => {
    loadOpenDays();
  }, [loadOpenDays]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - 100); // 100일 전부터 데이터 가져옴

      const startFormatted = startDate
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '');
      const endFormatted = today.toISOString().split('T')[0].replace(/-/g, '');

      const stockData = await fetchStockData(
        symbol,
        startFormatted,
        endFormatted,
      ); // timeUnit 인수 제거

      stockData.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      // 데이터가 빈 경우에 대한 처리를 추가
      if (stockData.length === 0) {
        throw new Error('No data available for the selected time period.');
      }

      setChartData(stockData);
    } catch (error) {
      setError('Failed to load stock data.');
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

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
            <Series
              pane="Price"
              name="Price"
              argumentField="date"
              type="candlestick"
              openValueField="open"
              highValueField="high"
              lowValueField="low"
              closeValueField="close"
            />
            <Series
              pane="Volume"
              name="Volume"
              argumentField="date"
              valueField="volume"
              type="bar"
            />
            <ArgumentAxis
              argumentType="string" // Discrete 방식 대신 string 사용
              tickInterval="day"
              label={{ format: 'MMM dd' }} // 일봉이므로 일 단위 포맷
            />

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
              contentRender={TooltipTemplate}
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
