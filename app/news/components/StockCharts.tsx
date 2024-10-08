// app/news/components/StockCharts.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchStockData } from '@/app/utils/kisApi/fetchStockData';
import Chart, {
  ArgumentAxis,
  ValueAxis,
  Series,
  Legend,
  ScrollBar,
  ZoomAndPan,
  LoadingIndicator,
  Pane,
  Tooltip,
  Crosshair,
  Margin,
} from 'devextreme-react/chart';
import TooltipTemplate from './TooltipTemplate';

interface StockData {
  date: string; // Date 대신 string 사용
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function StockChart() {
  const [symbol, setSymbol] = useState('000660');
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchStockData(symbol);
        setStockData(data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch stock data:', error);
        setError('Failed to load stock data. Please try again later.');
      }
    };

    loadData();
  }, [symbol]);

  const customizePoint = useCallback((arg: any) => {
    if (arg.seriesName === 'Volume') {
      if (arg.data && arg.data.close >= arg.data.open) {
        return { color: '#1db2f5' };
      }
      return { color: '#ff7285' };
    }
    return null;
  }, []);

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
      {stockData.length > 0 ? (
        <Chart
          id="stock-chart"
          dataSource={stockData}
          title={`${symbol} 주가 차트`}
          customizePoint={customizePoint}
        >
          <Margin right={30} />
          <Series
            pane="Price"
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
          <Pane name="Price" />
          <Pane name="Volume" height={80} />
          <Legend visible={false} />
          <ArgumentAxis
            argumentType="datetime"
            tickInterval={{ months: 1 }}
            label={{ format: 'yyyy-MM-dd' }}
            valueFormatter={(value: string) => {
              const year = parseInt(value.slice(0, 4));
              const month = parseInt(value.slice(4, 6)) - 1;
              const day = parseInt(value.slice(6, 8));
              return new Date(year, month, day);
            }}
          />
          <ValueAxis pane="Price" />
          <ValueAxis pane="Volume" position="right" />
          <ZoomAndPan argumentAxis="both" />
          <ScrollBar visible={true} />
          <LoadingIndicator enabled={true} />
          <Tooltip
            enabled={true}
            shared={true}
            contentRender={TooltipTemplate}
          />
          <Crosshair enabled={true} />
        </Chart>
      ) : (
        <p>로딩 중...</p>
      )}
    </div>
  );
}
