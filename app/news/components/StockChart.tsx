// app/news/components/StockChart.tsx

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Chart, {
  ArgumentAxis,
  ValueAxis,
  Aggregation,
  Legend,
  Series,
  ScrollBar,
  ZoomAndPan,
  LoadingIndicator,
  Pane,
  Tooltip,
  Crosshair,
  Margin,
  HorizontalLine,
  IAggregationProps,
} from 'devextreme-react/chart';
import TooltipTemplate from './Tooltip';

const minVisualRangeLength = { minutes: 10 };
const defaultVisualRange = { length: 'hour' };

interface StockChartProps {
  stockPrice: any; // 여기에 적절한 타입을 사용할 수 있습니다.
}

function StockChart({ stockPrice }: StockChartProps) {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const chartRef = useRef(null);

  // stockPrice가 변경될 때마다 데이터 추가
  useEffect(() => {
    if (stockPrice) {
      const newData = {
        date: new Date(),
        open: stockPrice.stck_oprc,
        high: stockPrice.stck_hgpr,
        low: stockPrice.stck_lwpr,
        close: stockPrice.stck_prpr,
        volume: stockPrice.acml_vol, // 거래량 추가
      };
      setDataSource((prevData) => [...prevData, newData]);
    }
  }, [stockPrice]);

  const customizePoint = useCallback((arg) => {
    if (arg.seriesName === '거래량' && chartRef.current) {
      const point = chartRef.current
        .instance()
        .getAllSeries()[0]
        .getPointsByArg(arg.argument)[0].data;

      if (point && point.close >= point.open) {
        return { color: '#1db2f5' };
      }
    }
    return null;
  }, []);

  const calculateCandle = useCallback<IAggregationProps['calculate']>((e) => {
    const prices = e.data.map((d) => d.price);
    if (prices.length) {
      const startTime = e.intervalStart?.valueOf() || Date.now(); // 현재 시간으로 기본값 설정
      const endTime = e.intervalEnd?.valueOf() || Date.now(); // 현재 시간으로 기본값 설정

      return {
        date: new Date((startTime + endTime) / 2),
        open: prices[0],
        high: Math.max.apply(null, prices),
        low: Math.min.apply(null, prices),
        close: prices[prices.length - 1],
      };
    }
    return null;
  }, []);

  return (
    <div>
      <Chart
        id="chart"
        ref={chartRef}
        dataSource={dataSource}
        title="주식 가격"
        customizePoint={customizePoint}
      >
        <Margin right={30} />
        <Series pane="Price" argumentField="date" type="candlestick">
          <Aggregation
            enabled={true}
            method="custom"
            calculate={calculateCandle}
          />
        </Series>
        <Series
          pane="Volume"
          name="거래량"
          argumentField="date"
          valueField="volume"
          color="red"
          type="bar"
        >
          <Aggregation enabled={true} method="sum" />
        </Series>
        <Pane name="Price" />
        <Pane name="Volume" height={80} />
        <Legend visible={false} />
        <ArgumentAxis
          argumentType="datetime"
          minVisualRangeLength={minVisualRangeLength}
          defaultVisualRange={defaultVisualRange}
        />
        <ValueAxis placeholderSize={50} />
        <ZoomAndPan argumentAxis="both" />
        <ScrollBar visible={true} />
        <LoadingIndicator enabled={true} />
        <Tooltip
          enabled={true}
          shared={true}
          argumentFormat="shortDateShortTime"
          contentRender={TooltipTemplate}
        />
        <Crosshair enabled={true}>
          <HorizontalLine visible={false} />
        </Crosshair>
      </Chart>
    </div>
  );
}

export default StockChart;
