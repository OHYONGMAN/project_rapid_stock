// app/news/components/StockCharts.tsx

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchStockData,
  fetchMinuteData,
} from '@/app/utils/kisApi/fetchStockData';
import { connectWebSocket, closeWebSocket } from '@/app/utils/kisApi/websocket';
import { fetchHolidays } from '@/app/utils/kisApi/holiday';
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
import { getOpenDays, isMarketOpen } from '@/app/utils/kisApi/holiday';

interface StockData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

type TimeUnit = 'M1' | 'D' | 'W' | 'M' | 'Y';

export default function StockCharts() {
  const [symbol, setSymbol] = useState('000660');
  const [chartData, setChartData] = useState<StockData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('D');
  const lastTickRef = useRef<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [websocketClosed, setWebsocketClosed] = useState(true);
  const [openDays, setOpenDays] = useState<Set<string>>(new Set());

  const loadOpenDays = useCallback(async () => {
    try {
      const openDaysData = await getOpenDays();
      setOpenDays(openDaysData);
    } catch (error) {
      console.error('Failed to fetch open days:', error);
      setError('Failed to load market calendar. Some features may be limited.');
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const today = new Date();
      const holidays = await fetchHolidays();

      const formattedToday = today
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '');

      let isOpen = holidays.some(
        (holiday) =>
          holiday.bass_dt === formattedToday && holiday.opnd_yn === 'Y',
      );

      let targetDate = today;
      if (!isOpen) {
        console.warn(
          '오늘은 휴장일입니다. 가장 최근 개장일 데이터를 가져옵니다.',
        );
        // 가장 최근 개장일 찾기 (오늘 이전의 개장일만 고려)
        const recentOpenDay = holidays
          .filter(
            (holiday) =>
              holiday.opnd_yn === 'Y' && holiday.bass_dt < formattedToday,
          )
          .sort((a, b) => parseInt(b.bass_dt) - parseInt(a.bass_dt))[0];

        if (recentOpenDay) {
          targetDate = new Date(
            Number(recentOpenDay.bass_dt.slice(0, 4)),
            Number(recentOpenDay.bass_dt.slice(4, 6)) - 1,
            Number(recentOpenDay.bass_dt.slice(6, 8)),
          );
        } else {
          setError('최근 개장일을 찾을 수 없습니다.');
          setIsLoading(false);
          return;
        }
      }

      const startDate = targetDate
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '');
      const endDate = new Date().toISOString().split('T')[0].replace(/-/g, '');

      let stockData: StockData[];
      if (timeUnit === 'M1') {
        stockData = (await fetchMinuteData(symbol)).map((data) => ({
          ...data,
          date: new Date(data.date),
        }));
      } else {
        stockData = (
          await fetchStockData(symbol, timeUnit, startDate, endDate)
        ).map((data) => ({
          ...data,
          date: new Date(data.date),
        }));
      }

      setChartData(stockData);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch stock data:', error);
      setError('Failed to load stock data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeUnit]);

  useEffect(() => {
    loadOpenDays();
  }, [loadOpenDays]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleWebSocketMessage = (data: any) => {
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
          customizePoint={(pointInfo) => {
            if (pointInfo.seriesName === 'Volume') {
              return pointInfo.data.close >= pointInfo.data.open
                ? { color: '#1db2f5' }
                : { color: '#ff7285' };
            }
            return {};
          }}
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
            label={{
              format: 'yyyy-MM-dd',
              customizeText(arg) {
                const date = new Date(arg.value);
                const dateStr = date
                  .toISOString()
                  .split('T')[0]
                  .replace(/-/g, '');
                if (openDays.has(dateStr)) {
                  return arg.valueText;
                }
                return '';
              },
            }}
          />
          <ValueAxis pane="Price" />
          <ValueAxis pane="Volume" position="right" />
          <ZoomAndPan argumentAxis="both" />
          <ScrollBar visible />
          <LoadingIndicator enabled />
          <Tooltip enabled shared contentRender={TooltipTemplate} />
          <Crosshair enabled />
        </Chart>
      ) : (
        <p>데이터가 없습니다.</p>
      )}
    </div>
  );
}
