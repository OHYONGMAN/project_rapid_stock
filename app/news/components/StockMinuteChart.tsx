// app/news/components/StockMinuteChart.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchMinuteData } from '@/app/utils/kisApi/stock';
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

export default function StockMinuteChart() {
  const [symbol, setSymbol] = useState('000660');
  const [chartData, setChartData] = useState<StockData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const KST_START_HOUR = 9;
  const KST_END_HOUR = 15;

  const loadMinuteData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const minuteData = await fetchMinuteData(symbol);

      const filteredData = minuteData.filter((item) => {
        const itemDate = new Date(item.date);
        const kstHours = itemDate.getUTCHours() + 9;

        return kstHours >= KST_START_HOUR && kstHours <= KST_END_HOUR;
      });

      setChartData(filteredData);
    } catch (error) {
      setError('Failed to load minute stock data.');
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    loadMinuteData();
  }, [loadMinuteData]);

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
            id="minute-stock-chart"
            dataSource={chartData}
            customizePoint={(pointInfo) =>
              pointInfo.data.close >= pointInfo.data.open
                ? { color: '#1db2f5' }
                : { color: '#ff7285' }
            }
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
              argumentType="datetime"
              tickInterval="hour"
              label={{ format: 'HH:mm' }}
              visualRange={{
                startValue: new Date(new Date().setUTCHours(0, 0, 0, 0)),
                endValue: new Date(new Date().setUTCHours(6, 30, 0, 0)),
              }}
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
              contentRender={StockChartTooltip}
            />
            <Crosshair enabled={true} />
            <Legend visible={false} />
          </Chart>
        </div>
      ) : (
        <p>
          분봉 데이터를 로드할 수 없습니다. (Data length: {chartData.length})
        </p>
      )}
    </div>
  );
}
