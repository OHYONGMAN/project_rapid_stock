'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Chart,
  CommonSeriesSettings,
  Series,
  ArgumentAxis,
  ValueAxis,
  Crosshair,
  Label,
  Legend,
  Font,
  Tooltip,
} from 'devextreme-react/chart';
import {
  fetchIndexTimePrice,
  IndexTimePrice,
} from '../../utils/kisApi/indexTimePrice';
import config from 'devextreme/core/config';

const licenseKey = process.env.NEXT_PUBLIC_DEVEXTREME_LICENSE_KEY;
config({ licenseKey });

const isValidTime = (timeString: string): boolean => {
  const hours = parseInt(timeString.slice(0, 2));
  const minutes = parseInt(timeString.slice(2, 4));
  return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
};

const formatTime = (arg: {
  value: string | number | Date;
  valueText: string;
}): string => {
  let timeString: string;
  if (typeof arg.value === 'string') {
    timeString = arg.value;
  } else if (arg.value instanceof Date) {
    timeString = arg.value.toTimeString().slice(0, 6);
  } else {
    timeString = arg.valueText;
  }

  if (!isValidTime(timeString)) {
    return '';
  }

  const hours = parseInt(timeString.slice(0, 2));
  const minutes = timeString.slice(2, 4);
  const formattedHours = hours < 10 ? `0${hours}` : hours.toString();
  return `${formattedHours}:${minutes}`;
};

interface StockChartProps {
  symbol: string;
}

const StockChart: React.FC<StockChartProps> = ({ symbol }) => {
  const [chartData, setChartData] = useState<IndexTimePrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchIndexTimePrice(symbol, '300');
        const filteredData = data.filter((item) => isValidTime(item.time));
        const reversedData = filteredData.reverse();
        setChartData(reversedData);
        setError(null);
      } catch (error) {
        console.error('데이터 fetching 오류:', error);
        setError('차트 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  const chartColor = useMemo(() => {
    if (chartData.length > 0) {
      return chartData[chartData.length - 1].change >= 0
        ? '#FF4136'
        : '#0074D9';
    }
    return '#000000'; // 기본 색상
  }, [chartData]);

  if (isLoading) return <p>차트 데이터를 불러오는 중입니다...</p>;
  if (error) return <p>Error: {error}</p>;
  if (chartData.length === 0) return <p>표시할 차트 데이터가 없습니다.</p>;

  return (
    <Chart id="chart" dataSource={chartData} height={180}>
      <CommonSeriesSettings
        argumentField="time"
        type="line"
        point={{ visible: false }}
      />
      <Series valueField="price" color={chartColor} />
      <ArgumentAxis
        valueMarginsEnabled={false}
        discreteAxisDivisionMode="crossLabels"
      >
        <Label customizeText={formatTime} />
      </ArgumentAxis>
      <ValueAxis />
      <Crosshair enabled={true} color="#949494" width={3} dashStyle="dot">
        <Label visible={true} backgroundColor="#949494">
          <Font color="#fff" size={12} />
        </Label>
      </Crosshair>
      <Legend visible={false} />
      <Tooltip
        enabled={true}
        contentRender={(tooltipData: any) => {
          const item = chartData.find(
            (item) => item.time === tooltipData.argument,
          );
          const textColor = item && item.change >= 0 ? '#FF4136' : '#0074D9';
          return (
            <div>
              <p>
                시간:{' '}
                {formatTime({
                  value: tooltipData.argument,
                  valueText: tooltipData.argumentText,
                })}
              </p>
              <p>지수: {tooltipData.value.toFixed(2)}</p>
              {item && (
                <>
                  <p style={{ color: textColor }}>
                    변화량: {item.change.toFixed(2)}
                  </p>
                  <p style={{ color: textColor }}>
                    변화율: {item.changeRate.toFixed(2)}%
                  </p>
                </>
              )}
            </div>
          );
        }}
      />
    </Chart>
  );
};

export default StockChart;
