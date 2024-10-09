// app/news/components/StockCharts.tsx

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchStockData,
  fetchMinuteData,
} from '@/app/utils/kisApi/fetchStockData';
import { connectWebSocket, closeWebSocket } from '@/app/utils/kisApi/websocket';
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
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

type TimeUnit = 'M1' | 'D' | 'W' | 'M' | 'Y';

interface CustomPointInfo {
  seriesName?: string;
  data?: {
    open: number;
    close: number;
  };
}

const isMarketOpen = () => {
  const now = new Date();
  const day = now.getDay(); // 일요일: 0, 월요일: 1, ... 토요일: 6
  const hour = now.getHours();

  // 주말이나 거래 시간 외인 경우
  if (day === 0 || day === 6 || hour < 9 || hour > 15) {
    return false;
  }

  return true;
};

export default function StockCharts() {
  const [symbol, setSymbol] = useState('000660');
  const [chartData, setChartData] = useState<StockData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('D');
  const lastTickRef = useRef<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      let data;
      if (timeUnit === 'M1') {
        data = await fetchMinuteData(symbol);
      } else {
        data = await fetchStockData(symbol, timeUnit);
      }

      // 콘솔에 데이터 출력하여 확인
      console.log('Fetched data:', data);

      const formattedData = data.map((item: any) => ({
        ...item,
        date: new Date(item.date),
      }));
      setChartData(formattedData);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch stock data:', error);
      setError('Failed to load stock data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeUnit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (timeUnit !== 'M1' || !isMarketOpen()) {
      console.log('시장 개장 시간이 아니므로 WebSocket을 연결하지 않습니다.');
      return;
    }

    const handleWebSocketMessage = (data: any) => {
      console.log('WebSocket received data:', data);

      const now = new Date();
      const newTick: StockData = {
        date: now,
        open: parseFloat(data.stck_oprc),
        high: parseFloat(data.stck_hgpr),
        low: parseFloat(data.stck_lwpr),
        close: parseFloat(data.stck_prpr),
        volume: parseInt(data.cntg_vol, 10),
      };

      setChartData((prevData) => {
        if (
          lastTickRef.current &&
          lastTickRef.current.date.getMinutes() === now.getMinutes()
        ) {
          const updatedData = [...prevData];
          const lastIndex = updatedData.length - 1;
          updatedData[lastIndex] = {
            ...updatedData[lastIndex],
            high: Math.max(updatedData[lastIndex].high, newTick.high),
            low: Math.min(updatedData[lastIndex].low, newTick.low),
            close: newTick.close,
            volume: updatedData[lastIndex].volume + newTick.volume,
          };
          return updatedData;
        } else {
          return [...prevData, newTick];
        }
      });

      lastTickRef.current = newTick;
    };

    let closeWebSocketConnection: (() => void) | undefined;

    const connect = async () => {
      try {
        closeWebSocketConnection = await connectWebSocket(
          symbol,
          handleWebSocketMessage,
        );
      } catch (error) {
        console.error('WebSocket connection error:', error);
        setError(`Failed to connect to WebSocket: ${(error as Error).message}`);
      }
    };

    connect();

    return () => {
      if (closeWebSocketConnection) {
        closeWebSocketConnection();
      }
      closeWebSocket();
    };
  }, [symbol, timeUnit]);

  const customizePoint = useCallback((pointInfo: CustomPointInfo) => {
    if (pointInfo.seriesName === 'Volume') {
      if (pointInfo.data && pointInfo.data.close >= pointInfo.data.open) {
        return { color: '#1db2f5' };
      }
      return { color: '#ff7285' };
    }
    return {};
  }, []);

  const getChartTitle = () => {
    const unitMap = { M1: '분봉', D: '일', W: '주', M: '월', Y: '년' };
    return `${symbol} 주가 차트 (${unitMap[timeUnit]})`;
  };

  return (
    <div className="w-full">
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
        placeholder="종목 코드를 입력하세요"
      />
      <div className="mb-4">
        {['M1', 'D', 'W', 'M', 'Y'].map((unit) => (
          <button
            key={unit}
            onClick={() => setTimeUnit(unit as TimeUnit)}
            className={`mr-2 px-4 py-2 rounded ${
              timeUnit === unit ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {unit === 'M1' ? '분봉' : unit}
          </button>
        ))}
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {isLoading ? (
        <p>로딩 중...</p>
      ) : chartData.length > 0 ? (
        <Chart
          id="stock-chart"
          dataSource={chartData}
          title={getChartTitle()}
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
            tickInterval={{
              minutes: timeUnit === 'M1' ? 10 : undefined,
              days: timeUnit === 'D' ? 7 : undefined,
              weeks: timeUnit === 'W' ? 1 : undefined,
              months: timeUnit === 'M' ? 1 : undefined,
              years: timeUnit === 'Y' ? 1 : undefined,
            }}
            label={{
              format: timeUnit === 'M1' ? 'HH:mm' : 'yyyy-MM-dd',
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
        <p>데이터가 없습니다.</p>
      )}
    </div>
  );
}
