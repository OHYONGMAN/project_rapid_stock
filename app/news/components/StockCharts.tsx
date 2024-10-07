// app/news/components/StockCharts.tsx

'use client';

import React, { useEffect, useState } from 'react';

const StockCharts = () => {
  const [stockData, setStockData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/fetchStockData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ symbol: '000660' }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stock data');
        }

        const data = await response.json();
        setStockData(
          data.output2.map((item: any) => ({
            date: item.stck_bsop_date,
            close: parseFloat(item.stck_clpr),
            open: parseFloat(item.stck_oprc),
            high: parseFloat(item.stck_hgpr),
            low: parseFloat(item.stck_lwpr),
          })),
        );
      } catch (error) {
        console.error('데이터 요청 중 오류 발생:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>SK하이닉스 주가 정보</h2>
      {stockData.length > 0 ? (
        <ul>
          {stockData.map((item, index) => (
            <li key={index}>
              날짜: {item.date}, 종가: {item.close}원, 시가: {item.open}원,
              최고가: {item.high}원, 최저가: {item.low}원
            </li>
          ))}
        </ul>
      ) : (
        <p>데이터 로딩 중...</p>
      )}
    </div>
  );
};

export default StockCharts;
