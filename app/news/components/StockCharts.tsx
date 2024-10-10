// app/news/components/StockCharts.tsx

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchStockData,
  fetchMinuteData,
} from '@/app/utils/kisApi/fetchStockData';
import { connectWebSocket, closeWebSocket } from '@/app/utils/kisApi/websocket';
import { getOpenDays, isMarketOpen } from '@/app/utils/kisApi/holiday';
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
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

type TimeUnit = 'M1' | 'D';

export default function StockCharts() {
  const [symbol, setSymbol] = useState('000660');
  const [chartData, setChartData] = useState<StockData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('D');
  const lastTickRef = useRef<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [websocketClosed, setWebsocketClosed] = useState(true);
  const [openDays, setOpenDays] = useState<Set<string>>(new Set());

  // 개장일 정보를 불러오는 함수
  const loadOpenDays = useCallback(async () => {
    try {
      console.log('Loading open days...');
      const openDaysData = await getOpenDays();
      console.log('Open days loaded:', openDaysData.size);
      setOpenDays(openDaysData);
    } catch (error) {
      console.error('Failed to fetch open days:', error);
      setError('Failed to load market calendar. Some features may be limited.');
    }
  }, []);

  // 컴포넌트 마운트 시 개장일 불러오기
  useEffect(() => {
    loadOpenDays();
  }, [loadOpenDays]);

  // 주식 데이터를 불러오는 함수
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Loading stock data...');
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - 100);

      const startFormatted = startDate
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '');
      const endFormatted = today.toISOString().split('T')[0].replace(/-/g, '');

      let stockData: StockData[];
      if (timeUnit === 'M1') {
        stockData = await fetchMinuteData(symbol);
      } else {
        stockData = await fetchStockData(
          symbol,
          'D',
          startFormatted,
          endFormatted,
        );
      }

      console.log('Fetched stock data:', stockData.length);
      console.log('First date:', stockData[0]?.date);
      console.log('Last date:', stockData[stockData.length - 1]?.date);
      console.log('Open days:', openDays.size);

      // 날짜를 오름차순으로 정렬
      stockData.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      // 모든 날짜를 생성
      const allDates = [];
      let currentDate = new Date(stockData[0].date);
      const lastDate = new Date(stockData[stockData.length - 1].date);
      while (currentDate <= lastDate) {
        allDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // 모든 날짜에 대해 데이터 생성 (휴장일은 직전 거래일 데이터 사용)
      let lastValidData: StockData | null = null;
      const filledData = allDates
        .map((date) => {
          const dateString = date.toISOString().split('T')[0];
          const dataForDate = stockData.find((item) => {
            const itemDate = new Date(item.date).toISOString().split('T')[0];
            return itemDate === dateString;
          });

          if (dataForDate) {
            lastValidData = dataForDate;
            return { ...dataForDate, date: dateString };
          } else if (lastValidData) {
            return { ...lastValidData, date: dateString };
          }
          return null;
        })
        .filter((item): item is StockData => item !== null);

      console.log('Filled data:', filledData.length);
      console.log('First filled date:', filledData[0]?.date);
      console.log('Last filled date:', filledData[filledData.length - 1]?.date);

      setChartData(filledData as StockData[]);
    } catch (error) {
      console.error('Failed to fetch stock data:', error);
      setError('Failed to load stock data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeUnit, openDays]);

  // 데이터 로드 시마다 차트 업데이트
  useEffect(() => {
    if (openDays.size > 0) {
      loadData();
    }
  }, [loadData, openDays]);

  // 웹소켓 연결을 통한 실시간 데이터 처리
  useEffect(() => {
    const connectWebSocketWithMarketCheck = async () => {
      if (timeUnit !== 'M1') return;
      const today = new Date();
      const isOpen = await isMarketOpen(today);

      if (!isOpen) {
        console.error(
          '오늘은 주식시장이 개장하지 않으므로 WebSocket을 연결하지 않습니다.',
        );
        setWebsocketClosed(true);
        return;
      }

      setWebsocketClosed(false);
      connectWebSocket(symbol, handleWebSocketMessage);
    };

    connectWebSocketWithMarketCheck();

    return () => {
      closeWebSocket();
    };
  }, [symbol, timeUnit]);

  // 실시간 데이터 업데이트
  const handleWebSocketMessage = (data: any) => {
    const now = new Date();
    const newTick: StockData = {
      date: now.toISOString().split('T')[0],
      open: parseFloat(data.stck_oprc) || 0,
      high: parseFloat(data.stck_hgpr) || 0,
      low: parseFloat(data.stck_lwpr) || 0,
      close: parseFloat(data.stck_prpr) || 0,
      volume: parseInt(data.cntg_vol, 10) || 0,
    };

    setChartData((prevData) => {
      if (lastTickRef.current && lastTickRef.current.date === newTick.date) {
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
        {['M1', 'D'].map((unit) => (
          <button
            key={unit}
            onClick={() => setTimeUnit(unit as TimeUnit)}
            className={`mr-2 px-4 py-2 rounded ${
              timeUnit === unit ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {unit === 'M1' ? '분봉' : '일봉'}
          </button>
        ))}
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {isLoading ? (
        <p>로딩 중...</p>
      ) : chartData.length > 0 ? (
        <div style={{ height: '400px', width: '100%' }}>
          {' '}
          {/* 명시적 크기 지정 */}
          <Chart
            id="stock-chart"
            dataSource={chartData}
            customizePoint={(pointInfo) => {
              if (pointInfo.seriesName === 'Volume') {
                return pointInfo.data.close >= pointInfo.data.open
                  ? { color: '#1db2f5' }
                  : { color: '#ff7285' };
              }
              return {};
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
              argumentType="datetime"
              tickInterval="day"
              label={{ format: 'MMM dd' }}
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
        <p>데이터가 없거나 로딩 중입니다. (Data length: {chartData.length})</p>
      )}
    </div>
  );
}
