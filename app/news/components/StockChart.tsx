'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchStockData } from '@/app/utils/kisApi/stock';
import Chart, {
  ArgumentAxis,
  ValueAxis,
  Series,
  ScrollBar,
  ZoomAndPan,
  LoadingIndicator,
  Pane,
  Tooltip,
  Crosshair,
  Legend,
} from 'devextreme-react/chart';
import StockChartTooltip from './StockChartTooltip';

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
  return `${Number(month)}월 ${Number(day)}일`; // 월과 일을 숫자형으로 변환 후 반환
};

// 날짜 기준 정렬 함수
const sortByDate = (a: StockData, b: StockData) => {
  const dateA = new Date(a.date.replace(/(\d+)월 (\d+)일/, '2023-$1-$2')); // 월, 일을 YYYY-MM-DD 형식으로 변환
  const dateB = new Date(b.date.replace(/(\d+)월 (\d+)일/, '2023-$1-$2')); // 동일한 형식으로 비교
  return dateA.getTime() - dateB.getTime(); // 시간 비교
};

export default function StockChart() {
  const [symbol, setSymbol] = useState('005930'); // 종목 코드 상태 관리 (삼성전자 기본값)
  const [chartData, setChartData] = useState<StockData[]>([]); // 차트 데이터 상태 관리
  const [name, setName] = useState(''); // 종목 이름 상태 관리
  const [error, setError] = useState<string | null>(null); // 에러 상태 관리
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리
  const chartRef = useRef<any>(null); // 차트 DOM 참조

  // 주식 데이터를 로드하는 함수
  const loadData = useCallback(async () => {
    setIsLoading(true); // 로딩 상태 시작
    setError(null); // 에러 초기화
    try {
      const today = new Date(); // 현재 날짜 가져오기
      const startDate = new Date(); // 시작 날짜 생성
      startDate.setDate(today.getDate() - 100); // 현재 날짜 기준 100일 전 설정

      // 날짜를 YYYYMMDD 형식으로 변환
      const startFormatted = startDate
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '');
      const endFormatted = today.toISOString().split('T')[0].replace(/-/g, '');

      // 주식 데이터를 API로부터 가져오기
      const stockData = await fetchStockData(
        symbol, // 종목 코드
        startFormatted, // 시작 날짜
        endFormatted, // 종료 날짜
      );

      console.log('API 응답 데이터:', stockData); // 데이터 로그로 확인

      // 가져온 데이터에서 종목 이름 설정
      if (stockData.length > 0) {
        setName(stockData[0].name || '종목 이름 없음'); // 첫 번째 데이터의 종목 이름으로 설정
      }

      // 가져온 데이터를 포맷팅 후 상태에 저장
      const formattedData = stockData
        .map((data) => ({
          ...data,
          date: formatDate(data.date), // 날짜 포맷팅
        }))
        .sort(sortByDate); // 날짜 기준 정렬

      setChartData(formattedData); // 정렬된 데이터를 상태에 저장
    } catch (error) {
      setError('주식 데이터를 불러오는 데 실패했습니다.'); // 에러 발생 시 메시지 설정
    } finally {
      setIsLoading(false); // 로딩 상태 종료
    }
  }, [symbol]);

  // 컴포넌트 마운트 및 종목 코드 변경 시 데이터 로드
  useEffect(() => {
    loadData();
  }, [symbol, loadData]);

  return (
    <div className="w-full">
      {/* 종목 코드 입력 필드 */}
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)} // 사용자가 입력한 종목 코드로 상태 업데이트
        className="w-full p-2 mb-4 border rounded"
        placeholder="종목 코드를 입력하세요"
      />
      {error && <p className="text-red-500">{error}</p>}{' '}
      {/* 에러 메시지 표시 */}
      {isLoading ? (
        <p>로딩 중...</p> // 로딩 중인 상태 표시
      ) : chartData.length > 0 ? (
        <div className="h-[400px] w-full">
          {/* 종목 이름 출력 */}
          <h3>{name || '종목 이름을 불러오고 있습니다.'}</h3>
          {/* DevExtreme 차트 컴포넌트 */}
          <Chart
            id="stock-chart"
            ref={chartRef} // 차트 참조 설정
            dataSource={chartData} // 차트 데이터 소스 설정
            customizePoint={(pointInfo: any) => {
              const isUp = pointInfo.data.close >= pointInfo.data.open; // 종가가 시가보다 높으면 상승
              return {
                color: isUp ? '#ff7285' : '#1db2f5', // 상승 시 빨강, 하락 시 파랑
                border: {
                  color: isUp ? '#ff7285' : '#1db2f5',
                  visible: true,
                  width: 2, // 경계선 두께 설정
                },
                hoverStyle: {
                  border: {
                    visible: true,
                    color: isUp ? '#ff7285' : '#1db2f5', // 마우스오버 시 동일한 색상 유지
                    width: 2,
                  },
                },
                width: 1,
                opacity: isUp ? 1 : 1, // 불투명도 설정 (현재 동일)
              };
            }}
          >
            {/* 캔들스틱 시리즈 (가격 데이터) */}
            <Series
              pane="Price" // 가격 영역에 표시
              name="가격" // 시리즈 이름
              argumentField="date" // 날짜 필드
              type="candlestick" // 차트 유형
              openValueField="open" // 시가 필드
              highValueField="high" // 고가 필드
              lowValueField="low" // 저가 필드
              closeValueField="close" // 종가 필드
            />
            {/* 거래량 바 시리즈 */}
            <Series
              pane="Volume" // 거래량 영역에 표시
              name="거래량" // 시리즈 이름
              argumentField="date" // 날짜 필드
              valueField="volume" // 거래량 필드
              type="bar" // 차트 유형 (막대 차트)
              color={'#ff7285'} // 색상
            />
            <ArgumentAxis argumentType="string" tickInterval="day" />{' '}
            {/* X축 */}
            <ValueAxis pane="Price" /> {/* Y축 (가격) */}
            <ValueAxis pane="Volume" position="right" /> {/* Y축 (거래량) */}
            <Pane name="Price" /> {/* 가격 영역 */}
            <Pane name="Volume" height={100} /> {/* 거래량 영역 */}
            <ZoomAndPan argumentAxis="both" /> {/* 줌 및 팬 기능 */}
            <ScrollBar visible={true} /> {/* 스크롤바 표시 */}
            <LoadingIndicator enabled={true} /> {/* 로딩 표시 */}
            <Tooltip
              enabled={true} // 툴팁 활성화
              shared={true} // 공유 툴팁
              contentRender={(props: any) => <StockChartTooltip data={props} />} // 툴팁 렌더링
            />
            <Crosshair enabled={true} /> {/* 크로스헤어 표시 */}
            <Legend visible={false} /> {/* 범례 숨김 */}
          </Chart>
        </div>
      ) : (
        <p>데이터가 없거나 로딩 중입니다.</p> // 데이터가 없거나 로딩 중일 때 메시지 표시
      )}
    </div>
  );
}
