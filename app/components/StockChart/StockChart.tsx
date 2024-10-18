'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart,
  CommonSeriesSettings,
  Series,
  ArgumentAxis,
  Grid,
  Crosshair,
  Export,
  Legend,
  Point,
  Label,
  Font,
  Tooltip,
} from 'devextreme-react/chart';
import {
  fetchIndexTimePrice,
  IndexTimePrice,
} from '../../utils/kisApi/indexTimePrice';

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

export default function StockChart() {
  const [chartData, setChartData] = useState<IndexTimePrice[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchIndexTimePrice('0001', '300');
        const filteredData = data.filter((item) => isValidTime(item.time));
        setChartData(filteredData.reverse());
      } catch (error) {
        console.error('데이터 fetching 오류:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Chart id="chart" dataSource={chartData}>
      <CommonSeriesSettings argumentField="time">
        <Point visible={false} />
      </CommonSeriesSettings>
      <Series valueField="price" name="KOSPI" />
      <ArgumentAxis
        valueMarginsEnabled={false}
        discreteAxisDivisionMode="crossLabels"
      >
        <Label
          customizeText={(arg: {
            value: string | number | Date;
            valueText: string;
          }) => formatTime(arg)}
        />
        <Grid visible={true} />
      </ArgumentAxis>
      <Crosshair enabled={true} color="#949494" width={3} dashStyle="dot">
        <Label visible={true} backgroundColor="#949494">
          <Font color="#fff" size={12} />
        </Label>
      </Crosshair>
      <Legend
        verticalAlignment="bottom"
        horizontalAlignment="center"
        itemTextPosition="bottom"
      />
      <Export enabled={true} />
      <Tooltip
        enabled={true}
        contentRender={(tooltipData: any) => {
          const item = chartData.find(
            (item) => item.time === tooltipData.argument,
          );
          const textColor = item && item.change >= 0 ? '#FF4136' : '#0074D9';
          return (
            <div>
              <div>
                시간:{' '}
                {formatTime({
                  value: tooltipData.argument,
                  valueText: tooltipData.argumentText,
                })}
              </div>
              <div style={{ color: textColor }}>
                지수: {tooltipData.value.toFixed(2)}
              </div>
              {item && (
                <>
                  <div style={{ color: textColor }}>
                    변화량: {item.change.toFixed(2)}
                  </div>
                  <div style={{ color: textColor }}>
                    변화율: {item.changeRate.toFixed(2)}%
                  </div>
                </>
              )}
            </div>
          );
        }}
      />
    </Chart>
  );
}
