'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Chart, {
  ArgumentAxis,
  ValueAxis,
  Series,
  Legend,
  ScrollBar,
  ZoomAndPan,
  LoadingIndicator,
  Tooltip,
  Crosshair,
  Aggregation,
} from 'devextreme-react/chart';
import { VisualRange } from 'devextreme-react/common/charts';
import CustomStore from 'devextreme/data/custom_store';
import TooltipTemplate from './TooltipTemplate';
import { fetchHistoricalData, subscribeToRealtimeData } from '../../utils/kisApi/stockData';

const minVisualRangeLength = { minutes: 10 };
const defaultVisualRange: VisualRange = { length: 'hour' };

function StockChart() {
  const [dataSource, setDataSource] = useState(null);
  const chartRef = useRef(null);

  const customizePoint = useCallback((arg: any) => {
    if (arg.seriesName === 'Volume') {
      const point = chartRef.current
        .instance()
        .getAllSeries()[0]
        .getPointsByArg(arg.argument)[0].data;
      if (point && point.close >= point.open) {
        return { color: '#407bd9' };
      }
      return { color: '#ef5350' };
    }
    return null;
  }, []);

  const calculateCandle = useCallback((e: any) => {
    const prices = e.data.map((d: any) => d.price);
    if (prices.length) {
      return {
        date: new Date(
          (e.intervalStart.valueOf() + e.intervalEnd.valueOf()) / 2,
        ),
        open: prices[0],
        high: Math.max.apply(null, prices),
        low: Math.min.apply(null, prices),
        close: prices[prices.length - 1],
      };
    }
    return null;
    }, []);
    
    useEffect(() => {
      const store: any = new CustomStore({
        key: 'date',
        load: () => fetchHistoricalData('005930'),  // Samsung Electronics stock code
        update: (key: string, values: any) => {
          return new Promise((resolve, reject) => {
            const chartInstance = chartRef.current?.instance();
            if (chartInstance) {
              const series = chartInstance.getSeriesByName('candlestick');
              if (series) {
                series.updateData(key, values);
                resolve(null);
              } else {
                reject(new Error('Series not found'));
              }
            } else {
              reject(new Error('Chart instance not found'));
            }
          });
        }      });
    
      setDataSource(store);
    
      const unsubscribe = subscribeToRealtimeData('005930', (data: any) => {
        store.push([{ type: 'update', key: data.date, data }]);
      });
    
      return () => {
        unsubscribe();
      };
    }, []);
    
    return (
      <Chart
      id="stock-chart"
      ref={chartRef}
      dataSource={dataSource}
      title="Samsung Electronics Stock Price"
      customizePoint={customizePoint}
    >
      <Series pane="Price" argumentField="date" type="candlestick">
        <Aggregation
          enabled={true}
          method="custom"
          calculate={calculateCandle}
        />
      </Series>
      <Series
        pane="Volume"
        name="Volume"
        argumentField="date"
        valueField="volume"
        color="#e60000"
        type="bar"
      >
        <Aggregation enabled={true} method="sum" />
      </Series>
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
      <Crosshair enabled={true} />
    </Chart>
  );
}

export default StockChart;