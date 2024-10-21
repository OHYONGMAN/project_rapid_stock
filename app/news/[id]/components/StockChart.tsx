'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchStockData } from '../../../utils/kisApi/dailyStock.ts';
import Chart, {
  ArgumentAxis,
  ValueAxis,
  Series,
  ZoomAndPan,
  LoadingIndicator,
  Pane,
  Crosshair,
  Legend,
  Tooltip,
} from 'devextreme-react/chart';
import config from 'devextreme/core/config';

const licenseKey = process.env.NEXT_PUBLIC_DEVEXTREME_LICENSE_KEY;
config({ licenseKey });

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

const formatNumber = (num: string | number) => {
  return new Intl.NumberFormat('ko-KR').format(Number(num));
};

interface StockChartProps {
  symbol: string;
}

export default function StockChart({ symbol }: StockChartProps) {
  const [chartData, setChartData] = useState<StockData[]>([]);
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
      console.error('주식 데이터를 불러오는 데 실패했습니다.', error);
      setError(
        '주식 데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    loadData();
  }, [symbol, loadData]);

  const customizeTooltip = (pointInfo: any) => {
    const { point } = pointInfo;
    const { date, open, high, low, close, volume } = point.data;

    return {
      html: `
        <div>
          <p><b>${date}</b></p>
          <p>시가: ${formatNumber(open)}원</p>
          <p>고가: ${formatNumber(high)}원</p>
          <p>저가: ${formatNumber(low)}원</p>
          <p>종가: ${formatNumber(close)}원</p>
          <p>거래량: ${formatNumber(volume)}주</p>
        </div>
      `,
    };
  };

  const memoizedChart = useMemo(
    () => (
      <Chart
        id="stock-chart"
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
        <Tooltip
          enabled={true}
          customizeTooltip={customizeTooltip}
          shared={true}
        />
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
        <div className="relative h-[500px] w-full">{memoizedChart}</div>
      ) : (
        <p>데이터가 없습니다.</p>
      )}
    </div>
  );
}
