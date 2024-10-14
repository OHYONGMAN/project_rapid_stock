'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { fetchStockData } from '@/app/utils/kisApi/stock';
import Chart, {
  ArgumentAxis,
  ValueAxis,
  Series,
  ScrollBar,
  ZoomAndPan,
  LoadingIndicator,
  Pane,
  Crosshair,
  Legend,
} from 'devextreme-react/chart';

// 주식 데이터 인터페이스
interface StockData {
  name: string; // 종목 이름
  date: string; // 거래 일자
  open: number; // 시가
  high: number; // 고가
  low: number; // 저가
  close: number; // 종가
  volume: number; // 거래량
}

// 날짜 포맷팅 함수 (YYYYMMDD -> MM월 DD일)
const formatDate = (dateString: string): string => {
  const year = dateString.slice(0, 4);
  const month = dateString.slice(4, 6);
  const day = dateString.slice(6, 8);
  return `${Number(month)}월 ${Number(day)}일`;
};

// 날짜 기준 정렬 함수
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
    <div className="absolute top-2 left-2 p-2 bg-white bg-opacity-90 rounded shadow-md z-10">
      <div className="text-sm font-semibold mb-1">{data.date}</div>
      <div>시가: {formatNumber(data.open)}원</div>
      <div>고가: {formatNumber(data.high)}원</div>
      <div>저가: {formatNumber(data.low)}원</div>
      <div>종가: {formatNumber(data.close)}원</div>
    </div>
  );
});

const VolumeInfo = React.memo(({ data }: { data: StockData | null }) => {
  if (!data) return null;

  const formatNumber = (num: number) =>
    new Intl.NumberFormat('ko-KR').format(num);

  return (
    <div className="absolute bottom-2 left-2 p-2 bg-white bg-opacity-90 rounded shadow-md z-10">
      <div>거래량: {formatNumber(data.volume)}주</div>
    </div>
  );
});

export default function StockChart() {
  const [symbol, setSymbol] = useState('005930');
  const [chartData, setChartData] = useState<StockData[]>([]);
  const [name, setName] = useState('');
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
        setName(stockData[0].name || '종목 이름 없음');
        setHoveredPoint(stockData[stockData.length - 1]); // 초기값으로 최신 데이터 설정
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
      }, 50); // 50ms 디바운스
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
        <Pane name="Price" />
        <Pane name="Volume" height={100} />
        <ZoomAndPan argumentAxis="both" />
        <ScrollBar visible={true} />
        <LoadingIndicator enabled={true} />
        <Crosshair enabled={true} />
        <Legend visible={false} />
      </Chart>
    ),
    [chartData],
  );

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-4">Stock News and Prices</h1>
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
        placeholder="종목 코드를 입력하세요"
      />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {isLoading ? (
        <p>로딩 중...</p>
      ) : chartData.length > 0 ? (
        <div
          className="h-[500px] w-full relative"
          ref={containerRef}
          onMouseMove={handleChartHover}
          onMouseLeave={handleMouseLeave}
        >
          <h3 className="text-xl font-semibold mb-2">{name}</h3>
          <PriceInfo data={hoveredPoint} />
          <VolumeInfo data={hoveredPoint} />
          {memoizedChart}
        </div>
      ) : (
        <p>데이터가 없거나 로딩 중입니다.</p>
      )}
    </div>
  );
}
