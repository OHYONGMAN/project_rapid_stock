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

// 주식 데이터 인터페이스 (주식 데이터를 명확하게 정의하는 인터페이스. 각 속성이 어떤 데이터를 나타내는지 설명)
interface StockData {
  name: string; // 종목 이름
  date: string; // 거래 일자 (YYYYMMDD 형식의 날짜)
  open: number; // 시가 (거래 시작 가격)
  high: number; // 고가 (당일 최고 거래 가격)
  low: number; // 저가 (당일 최저 거래 가격)
  close: number; // 종가 (거래 마감 가격)
  volume: number; // 거래량 (해당 일의 거래량)
}

// 날짜 포맷팅 함수 (YYYYMMDD 형식의 날짜를 MM월 DD일 형식으로 변환)
const formatDate = (dateString: string): string => {
  const year = dateString.slice(0, 4); // 연도 추출
  const month = dateString.slice(4, 6); // 월 추출
  const day = dateString.slice(6, 8); // 일 추출
  return `${Number(month)}월 ${Number(day)}일`; // "MM월 DD일" 형식으로 반환
};

// 날짜 기준 정렬 함수 (주식 데이터를 날짜 순으로 정렬하기 위한 함수)
const sortByDate = (a: StockData, b: StockData) => {
  // 문자열로 된 날짜를 실제 날짜로 변환한 후, 오름차순으로 정렬
  const dateA = new Date(a.date.replace(/(\d+)월 (\d+)일/, '2023-$1-$2'));
  const dateB = new Date(b.date.replace(/(\d+)월 (\d+)일/, '2023-$1-$2'));
  return dateA.getTime() - dateB.getTime(); // 날짜를 기준으로 정렬
};

// 가격 정보를 보여주는 컴포넌트 (해당 포인트의 주식 데이터를 화면에 표시)
const PriceInfo = React.memo(({ data }: { data: StockData | null }) => {
  if (!data) return null; // 데이터가 없으면 아무 것도 렌더링하지 않음

  // 숫자 포맷팅 함수 (숫자를 한국 원화 스타일로 포맷)
  const formatNumber = (num: number) =>
    new Intl.NumberFormat('ko-KR').format(num);

  return (
    <div className="absolute -top-3 left-7 z-10 text-sm">
      <span>시가: {formatNumber(data.open)}원</span> {/* 시가 표시 */}
      <span>고가: {formatNumber(data.high)}원</span> {/* 고가 표시 */}
      <span>저가: {formatNumber(data.low)}원</span> {/* 저가 표시 */}
      <span>종가: {formatNumber(data.close)}원</span> {/* 종가 표시 */}
      <span>거래량: {formatNumber(data.volume)}주</span> {/* 거래량 표시 */}
    </div>
  );
});

// StockChart 컴포넌트 (주식 차트를 렌더링하는 메인 컴포넌트)
export default function StockChart() {
  const [symbol, setSymbol] = useState('005930'); // 종목 코드를 관리하는 상태
  const [chartData, setChartData] = useState<StockData[]>([]); // 차트에 표시할 주식 데이터를 관리하는 상태
  const [name, setName] = useState(''); // 종목 이름을 관리하는 상태
  const [error, setError] = useState<string | null>(null); // 에러 메시지를 관리하는 상태
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태를 관리하는 상태
  const chartRef = useRef<any>(null); // 차트 DOM 요소에 대한 참조
  const [hoveredPoint, setHoveredPoint] = useState<StockData | null>(null); // 현재 마우스로 가리키고 있는 데이터 포인트를 관리하는 상태
  const containerRef = useRef<HTMLDivElement>(null); // 차트 컨테이너 요소에 대한 참조
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null); // 마우스 움직임 이벤트의 디바운스 타이머 관리

  // 주식 데이터를 로드하는 비동기 함수. 주어진 종목 코드를 기준으로 데이터를 불러옴
  const loadData = useCallback(async () => {
    setIsLoading(true); // 로딩 상태 true로 설정
    setError(null); // 에러 상태 초기화
    try {
      const today = new Date(); // 현재 날짜
      const startDate = new Date();
      startDate.setDate(today.getDate() - 100); // 100일 전의 날짜 계산

      // 시작 및 종료 날짜를 YYYYMMDD 형식으로 변환
      const startFormatted = startDate
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '');
      const endFormatted = today.toISOString().split('T')[0].replace(/-/g, '');

      // KIS API로부터 주식 데이터를 불러옴
      const stockData = await fetchStockData(
        symbol,
        startFormatted,
        endFormatted,
      );

      // 데이터가 있을 경우 종목 이름과 최신 데이터를 설정
      if (stockData.length > 0) {
        setName(stockData[0].name || '종목 이름 없음');
        setHoveredPoint(stockData[stockData.length - 1]); // 최신 데이터 설정
      }

      // 데이터 포맷팅 및 정렬 후 차트 데이터로 설정
      const formattedData = stockData
        .map((data) => ({
          ...data,
          date: formatDate(data.date),
        }))
        .sort(sortByDate);

      setChartData(formattedData); // 차트 데이터로 저장
    } catch (error) {
      setError('주식 데이터를 불러오는 데 실패했습니다.'); // 에러 발생 시 메시지 설정
    } finally {
      setIsLoading(false); // 로딩 상태 false로 설정
    }
  }, [symbol]);

  // 컴포넌트가 마운트될 때 주식 데이터를 로드
  useEffect(() => {
    loadData(); // 데이터를 로드
  }, [symbol, loadData]);

  // 차트 위에서 마우스를 움직일 때 호출되는 함수. 해당 데이터 포인트를 찾음
  const handleChartHover = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current); // 기존 디바운스 타이머 초기화
      }

      debounceTimerRef.current = setTimeout(() => {
        if (!containerRef.current || chartData.length === 0) return; // 컨테이너나 데이터가 없으면 종료

        const containerRect = containerRef.current.getBoundingClientRect(); // 컨테이너의 위치와 크기를 가져옴
        const mouseX = e.clientX - containerRect.left; // 마우스 X 좌표 계산
        const chartWidth = containerRect.width; // 차트 너비 계산

        // 마우스 위치에 해당하는 데이터 인덱스 계산
        const index = Math.floor((mouseX / chartWidth) * chartData.length);
        const hoveredData = chartData[Math.min(index, chartData.length - 1)]; // 해당하는 데이터 포인트 찾기

        // 이전에 가리키고 있던 데이터와 다르면 업데이트
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

  // 마우스가 차트 밖으로 나갔을 때 호출되는 함수. 선택된 포인트 초기화
  const handleMouseLeave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current); // 디바운스 타이머 초기화
    }
    setHoveredPoint(null); // 선택된 포인트 초기화
  }, []);

  // 차트를 메모이제이션하여 성능 최적화
  const memoizedChart = useMemo(
    () => (
      <Chart
        id="stock-chart"
        ref={chartRef}
        dataSource={chartData}
        commonSeriesSettings={{
          type: 'candlestick', // 캔들스틱 차트 유형
          argumentField: 'date', // 날짜 필드
          openValueField: 'open', // 시가 필드
          highValueField: 'high', // 고가 필드
          lowValueField: 'low', // 저가 필드
          closeValueField: 'close', // 종가 필드
          color: '#ff7285', // 상승 시 빨간색
          reduction: {
            color: '#1db2f5', // 하락 시 파란색
          },
          barPadding: 0.3, // 막대 간의 간격 설정
        }}
        customizePoint={(pointInfo: any) => {
          const isUp = pointInfo.data.close >= pointInfo.data.open; // 상승 여부 확인

          return {
            color: isUp ? '#ff7285' : '#1db2f5', // 상승이면 빨강, 하락이면 파랑 설정
            border: {
              color: isUp ? '#ff7285' : '#1db2f5', // 테두리 색상 설정
              visible: true,
              width: 3, // 테두리 두께 설정
            },
            hoverStyle: {
              border: {
                visible: true,
                color: isUp ? '#ff7285' : '#1db2f5', // 호버 시 테두리 색상 설정
                width: 5, // 호버 시 테두리 두께
              },
            },
            opacity: 1, // 불투명도 설정
          };
        }}
      >
        {/* 캔들스틱 차트 설정 */}
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
        {/* 거래량 막대 차트 설정 */}
        <Series
          pane="Volume"
          name="거래량"
          argumentField="date"
          valueField="volume"
          type="bar"
          color={'#ff7285'} // 거래량 막대 색상 설정
        />
        {/* 축 설정 */}
        <ArgumentAxis argumentType="string" tickInterval="day" />{' '}
        {/* X축 설정 */}
        <ValueAxis pane="Price" /> {/* Y축 설정 (가격 차트) */}
        <ValueAxis pane="Volume" position="right" />{' '}
        {/* Y축 설정 (거래량 차트) */}
        <Pane name="Price" height="70%" /> {/* 가격 차트 높이 설정 */}
        <Pane name="Volume" height="30%" /> {/* 거래량 차트 높이 설정 */}
        <ZoomAndPan argumentAxis="both" /> {/* 줌 및 팬 기능 활성화 */}
        <LoadingIndicator enabled={true} /> {/* 로딩 인디케이터 표시 */}
        <Crosshair enabled={true} /> {/* 십자선 활성화 */}
        <Legend visible={false} /> {/* 범례 비활성화 */}
      </Chart>
    ),
    [chartData],
  );

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-4">Stock News and Prices</h1>
      {/* 종목 코드 입력 필드 */}
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)} // 사용자 입력에 따라 종목 코드 변경
        className="w-full p-2 mb-4 border rounded"
        placeholder="종목 코드를 입력하세요"
      />
      {error && <p className="text-red-500 mb-4">{error}</p>}{' '}
      {/* 에러 메시지 표시 */}
      {isLoading ? (
        <p>로딩 중...</p> /* 로딩 중일 때 표시 */
      ) : chartData.length > 0 ? (
        <div
          className="h-[500px] w-full relative"
          ref={containerRef}
          onMouseMove={handleChartHover} // 차트 위에서 마우스 움직임 처리
          onMouseLeave={handleMouseLeave} // 차트 밖으로 마우스가 나갈 때 처리
        >
          <PriceInfo data={hoveredPoint} />{' '}
          {/* 선택된 포인트의 가격 정보 표시 */}
          {memoizedChart} {/* 메모이제이션된 차트 표시 */}
        </div>
      ) : (
        <p>데이터가 없거나 로딩 중입니다.</p> /* 데이터가 없을 때 표시 */
      )}
    </div>
  );
}
