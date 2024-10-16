'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { fetchStockData } from '../../utils/kisApi/dailyStock.ts';
import Chart, {
  ArgumentAxis,
  ValueAxis,
  Series,
  ZoomAndPan,
  LoadingIndicator,
  Pane,
  Crosshair,
  Legend,
} from 'devextreme-react/chart';

interface StockData {
  name: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const formatDate = (dateString: string): string => {
  const month = dateString.slice(4, 6);
  const day = dateString.slice(6, 8);
  return `${Number(month)}월 ${Number(day)}일`;
};

const sortByDate = (a: StockData, b: StockData) => {
  const dateA = new Date(a.date.replace(/(\d+)월 (\d+)일/, '2023-$1-$2'));
  const dateB = new Date(b.date.replace(/(\d+)월 (\d+)일/, '2023-$1-$2'));
  return dateA.getTime() - dateB.getTime();
};

const PriceInfo = React.memo(({ data }: { data: StockData | null }) => {
  if (!data) return null;

  const formatNumber = (num: number) =>
    new Intl.NumberFormat('ko-KR').format(num);

  return (
    <div className="absolute -top-3 left-7 z-10 text-sm">
      <span>시가: {formatNumber(data.open)}원</span>
      <span>고가: {formatNumber(data.high)}원</span>
      <span>저가: {formatNumber(data.low)}원</span>
      <span>종가: {formatNumber(data.close)}원</span>
      <span>거래량: {formatNumber(data.volume)}주</span>
    </div>
  );
});

interface StockChartProps {
  symbol: string;
}

export default function StockChart({ symbol }: StockChartProps) {
  const [chartData, setChartData] = useState<StockData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef<any>(null);
  const [hoveredPoint, setHoveredPoint] = useState<StockData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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

      if (stockData.length > 0) {
        setHoveredPoint(stockData[stockData.length - 1]);
      }

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

  const handleChartHover = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (!containerRef.current || chartData.length === 0) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - containerRect.left;
        const chartWidth = containerRect.width;

        const index = Math.floor((mouseX / chartWidth) * chartData.length);
        const hoveredData = chartData[Math.min(index, chartData.length - 1)];

        setHoveredPoint((prevPoint) => {
          if (prevPoint?.date !== hoveredData.date) {
            return hoveredData;
          }
          return prevPoint;
        });
      }, 50);
    },
    [chartData],
  );

  const handleMouseLeave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setHoveredPoint(null);
  }, []);

  const memoizedChart = useMemo(
    () => (
      <Chart
        id="stock-chart"
        ref={chartRef}
        dataSource={chartData}
        commonSeriesSettings={{
          type: 'candlestick',
          argumentField: 'date',
          openValueField: 'open',
          highValueField: 'high',
          lowValueField: 'low',
          closeValueField: 'close',
          color: '#ff7285',
          reduction: {
            color: '#1db2f5',
          },
          barPadding: 0.3,
        }}
        customizePoint={(pointInfo: any) => {
          const isUp = pointInfo.data.close >= pointInfo.data.open;

          return {
            color: isUp ? '#ff7285' : '#1db2f5',
            border: {
              color: isUp ? '#ff7285' : '#1db2f5',
              visible: true,
              width: 3,
            },
            hoverStyle: {
              border: {
                visible: true,
                color: isUp ? '#ff7285' : '#1db2f5',
                width: 5,
              },
            },
            opacity: 1,
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
        <Pane name="Price" height="70%" />
        <Pane name="Volume" height="30%" />
        <ZoomAndPan argumentAxis="both" />
        <LoadingIndicator enabled={true} />
        <Crosshair enabled={true} />
        <Legend visible={false} />
      </Chart>
    ),
    [chartData],
  );

  return (
    <div className="mt-10 w-full">
      {error && <p className="mb-4 text-red-500">{error}</p>}
      {isLoading ? (
        <p>로딩 중...</p>
      ) : chartData.length > 0 ? (
        <div
          className="relative h-[500px] w-full"
          ref={containerRef}
          onMouseMove={handleChartHover}
          onMouseLeave={handleMouseLeave}
        >
          <PriceInfo data={hoveredPoint} />
          {memoizedChart}
        </div>
      ) : (
        <p>데이터가 없습니다.</p>
      )}
    </div>
  );
}
