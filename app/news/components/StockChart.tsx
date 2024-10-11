// app/news/components/StockChart.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchStockData } from '@/app/utils/kisApi/stock';
import { connectWebSocket } from '@/app/utils/kisApi/websocket';
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

interface RealTimeData {
  symbol: string;
  time: string;
  price: number;
  change: number;
  changeRate: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  changeSign: string;
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
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    const setupWebSocket = async () => {
      try {
        await loadData();

        const handleRealTimeData = (data: RealTimeData) => {
          setRealTimeData(data);

          setChartData((prevData) => {
            const newData = [...prevData];
            const lastIndex = newData.length - 1;
            if (lastIndex >= 0) {
              newData[lastIndex] = {
                ...newData[lastIndex],
                close: data.price,
                high: Math.max(newData[lastIndex].high, data.price),
                low: Math.min(newData[lastIndex].low, data.price),
                volume: data.volume,
              };
            }
            return newData;
          });
        };

        const disconnect = await connectWebSocket(symbol, handleRealTimeData);

        return () => {
          disconnect();
        };
      } catch (error) {
        console.error('웹소켓 연결 중 오류:', error);
        setError('웹소켓 연결에 실패했습니다.');
      }
    };

    setupWebSocket();
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
            dataSource={chartData}
            customizePoint={(pointInfo) => {
              return pointInfo.data.close >= pointInfo.data.open
                ? { color: '#1db2f5' }
                : { color: '#ff7285' };
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
              contentRender={(props) => (
                <StockChartTooltip
                  data={
                    props.originalArgument
                      ? props.points.find(
                          (p: any) => p.argument === props.originalArgument,
                        )
                      : undefined
                  }
                  realTimeData={realTimeData}
                />
              )}
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
