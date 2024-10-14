// app/news/components/StockChart.tsx

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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

interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const formatDate = (dateString: string): string => {
  const year = dateString.slice(0, 4);
  const month = dateString.slice(4, 6);
  const day = dateString.slice(6, 8);
  return `${Number(month)}월 ${Number(day)}일`;
};

const sortByDate = (a: StockData, b: StockData) => {
  const dateA = new Date(a.date.replace(/(\d+)월 (\d+)일/, '2023-$1-$2'));
  const dateB = new Date(b.date.replace(/(\d+)월 (\d+)일/, '2023-$1-$2'));
  return dateA.getTime() - dateB.getTime();
};

export default function StockChart() {
  const [symbol, setSymbol] = useState('005930');
  const [chartData, setChartData] = useState<StockData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef<any>(null);

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

      const stockData = await fetchStockData(
        symbol,
        startFormatted,
        endFormatted,
      );

      const formattedData = stockData
        .map((data) => ({
          ...data,
          date: formatDate(data.date),
        }))
        .sort(sortByDate);

      setChartData(formattedData);
    } catch (error) {
      setError('주식 데이터를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    loadData();
  }, [symbol, loadData]);

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
            ref={chartRef}
            dataSource={chartData}
            customizePoint={(pointInfo: any) => {
              const isUp = pointInfo.data.close >= pointInfo.data.open;
              return {
                color: isUp ? '#ff7285' : '#1db2f5',
                border: {
                  color: isUp ? '#ff7285' : '#1db2f5',
                  visible: true,
                  width: 2,
                },
                hoverStyle: {
                  border: {
                    visible: true,
                    color: isUp ? '#ff7285' : '#1db2f5',
                    width: 2,
                  },
                },
                width: 1,
                opacity: isUp ? 1 : 1,
              };
            }}
          >
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
            <Series
              pane="Volume"
              name="거래량"
              argumentField="date"
              valueField="volume"
              type="bar"
              color={'#ff7285'}
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
              contentRender={(props: any) => <StockChartTooltip data={props} />}
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
