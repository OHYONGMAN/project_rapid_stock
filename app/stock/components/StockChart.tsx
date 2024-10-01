'use client'; // Next.js에서 클라이언트 측에서만 실행되는 코드를 나타냅니다.

import React, { useCallback, useEffect, useRef, useState } from 'react'; // React와 필요한 훅들을 가져옵니다.
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
} from 'devextreme-react/chart'; // DevExtreme Chart 컴포넌트와 관련된 모듈들을 가져옵니다.
import { VisualRange } from 'devextreme-react/common/charts'; // VisualRange 타입을 가져옵니다.
import CustomStore from 'devextreme/data/custom_store'; // DevExtreme의 CustomStore를 가져옵니다.
import { HubConnectionBuilder, HttpTransportType } from '@aspnet/signalr'; // SignalR을 사용하기 위한 모듈들을 가져옵니다.
import TooltipTemplate from './TooltipTemplate'; // 커스텀 툴팁 템플릿을 가져옵니다.

const minVisualRangeLength = { minutes: 10 }; // 최소 시각 범위 길이를 설정합니다.
const defaultVisualRange: VisualRange = { length: 'hour' }; // 기본 시각 범위를 설정합니다.

function StockChart() {
  const [dataSource, setDataSource] = useState(null); // 데이터 소스를 관리하기 위한 상태를 선언합니다.
  const chartRef = useRef(null); // Chart 컴포넌트에 대한 참조를 생성합니다.

  // customizePoint 함수는 포인트의 색상을 커스터마이징합니다.
  const customizePoint = useCallback((arg: any) => {
    if (arg.seriesName === 'Volume') {
      // 시리즈 이름이 'Volume'인 경우
      const point = chartRef.current
        .instance() // Chart 인스턴스를 가져옵니다.
        .getAllSeries()[0] // 모든 시리즈를 가져와 첫 번째 시리즈를 선택합니다.
        .getPointsByArg(arg.argument)[0].data; // 인수에 해당하는 포인트를 가져옵니다.
      if (point && point.close >= point.open) {
        // 포인트의 종가가 시가보다 크거나 같은 경우
        return { color: '#407bd9' }; // 포인트의 색상을 설정합니다.
      }
    }
    return null; // 기본 색상을 사용합니다.
  }, []);

  // calculateCandle 함수는 캔들스틱 데이터를 계산합니다.
  const calculateCandle = useCallback<IAggregationProps['calculate']>((e) => {
    const prices = e.data.map((d) => d.price); // 데이터에서 가격을 추출합니다.
    if (prices.length) {
      // 가격 데이터가 있는 경우
      return {
        date: new Date(
          (e.intervalStart.valueOf() + e.intervalEnd.valueOf()) / 2,
        ), // 날짜를 계산합니다.
        open: prices[0], // 시가
        high: Math.max.apply(null, prices), // 고가
        low: Math.min.apply(null, prices), // 저가
        close: prices[prices.length - 1], // 종가
      };
    }
    return null; // 데이터가 없는 경우 null을 반환합니다.
  }, []);

  // useEffect 훅을 사용하여 컴포넌트가 마운트될 때 실행되는 코드를 작성합니다.
  useEffect(() => {
    const hubConnection = new HubConnectionBuilder()
      .withUrl('https://js.devexpress.com/Demos/NetCore/stockTickDataHub', {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      }) // SignalR 허브 연결을 설정합니다.
      .build();

    const store: any = new CustomStore({
      load: () => hubConnection.invoke('getAllData'), // 데이터를 로드하는 함수를 정의합니다.
      key: 'date', // 데이터의 키 필드를 설정합니다.
    });

    hubConnection.start().then(() => {
      hubConnection.on('updateStockPrice', (data) => {
        store.push([{ type: 'insert', key: data.date, data }]); // 새로운 데이터를 추가합니다.
      });
      setDataSource(store); // 데이터 소스를 설정합니다.
    });
  }, []);

  return (
    <div>
      {/* 차트의 너비와 높이를 설정합니다. */}
      <Chart
        id="chart" // 차트의 고유 식별자를 설정합니다.
        ref={chartRef} // Chart 컴포넌트에 대한 참조를 설정합니다.
        dataSource={dataSource} // 차트에 표시할 데이터 소스를 설정합니다.
        title="" // 차트 제목을 설정합니다. 현재는 빈 문자열로 설정되어 있습니다.
        customizePoint={customizePoint} // 포인트 커스터마이징 함수를 설정합니다.
        className="w-[1300px] h-[700px]"
      >
        <Series pane="Price" argumentField="date" type="candlestick">
          {' '}
          {/* 캔들스틱 시리즈를 설정합니다. */}{' '}
          {/* 캔들스틱 시리즈를 설정합니다. */}
          <Aggregation
            enabled={true} // 집계를 활성화합니다.
            method="custom" // 커스텀 집계 방법을 사용합니다.
            calculate={calculateCandle} // 캔들스틱 데이터를 계산하는 함수를 설정합니다.
          />
        </Series>
        <Series
          pane="Volume" // 이 시리즈가 "Volume" 패널에 표시됨을 의미합니다.
          name="Volume" // 시리즈의 이름을 "Volume"으로 설정합니다.
          argumentField="date" // 인수 필드를 날짜로 설정합니다.
          valueField="volume" // 값 필드를 볼륨으로 설정합니다.
          color="#e60000" // 막대의 색상을 빨간색으로 설정합니다.
          type="bar" // 막대 차트 시리즈를 설정합니다.
        >
          <Aggregation enabled={true} method="sum" />{' '}
          {/* 합계를 계산하는 집계 방법을 설정합니다. */}
        </Series>
        <Pane name="Price"></Pane> {/* 가격 차트를 위한 패널을 설정합니다. */}
        <Pane name="Volume" height={200}></Pane>{' '}
        {/* 볼륨 차트를 위한 패널을 설정합니다. */}
        <Legend visible={false} /> {/* 범례를 숨깁니다. */}
        <ArgumentAxis
          argumentType="datetime" // 인수 축의 타입을 날짜/시간으로 설정합니다.
          minVisualRangeLength={minVisualRangeLength} // 최소 시각 범위를 설정합니다.
          defaultVisualRange={defaultVisualRange} // 기본 시각 범위를 설정합니다.
        />
        <ValueAxis placeholderSize={50} /> {/* 값 축을 설정합니다. */}
        <ZoomAndPan argumentAxis="both" /> {/* 줌 및 팬 기능을 설정합니다. */}
        <ScrollBar visible={true} /> {/* 스크롤바를 표시합니다. */}
        <LoadingIndicator enabled={true} />{' '}
        {/* 로딩 인디케이터를 활성화합니다. */}
        <Tooltip
          enabled={true} // 툴팁을 활성화합니다.
          shared={true} // 여러 시리즈에 대해 툴팁을 공유합니다.
          argumentFormat="shortDateShortTime" // 툴팁의 날짜/시간 형식을 설정합니다.
          contentRender={TooltipTemplate} // 커스텀 툴팁 템플릿을 설정합니다.
        />
        <Crosshair enabled={true}>
          {' '}
          {/* 크로스헤어를 활성화합니다. */}
          <HorizontalLine visible={false} /> {/* 수평선을 숨깁니다. */}
        </Crosshair>
      </Chart>
    </div>
  );
}

export default StockChart; // StockChart 컴포넌트를 내보냅니다.
