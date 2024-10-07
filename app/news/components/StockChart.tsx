// app/news/components/StockChart.tsx

'use client';

import React, { useEffect, useState } from 'react';
import Chart, {
  Series,
  ArgumentAxis,
  ValueAxis,
  Label,
  Tooltip,
  Legend,
} from 'devextreme-react/chart';
import { NextPage } from 'next';
import { connectWebSocket, closeWebSocket } from '@/app/utils/kisApi/websocket';
import axios from 'axios';
import { getValidToken } from '@/app/utils/kisApi/token';

interface StockData {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

const StockChart: NextPage = () => {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [symbol, setSymbol] = useState('000660');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const token = await getValidToken();
        if (!token) {
          throw new Error('Failed to get access token');
        }

        const response = await axios.get(
          'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice',
          {
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              Authorization: `Bearer ${token}`,
              appkey: process.env.NEXT_PUBLIC_KIS_API_KEY!,
              appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET!,
              tr_id: 'FHKST03010100',
            },
            params: {
              FID_COND_MRKT_DIV_CODE: 'J',
              FID_INPUT_ISCD: symbol,
              FID_INPUT_DATE_1: '20230101',
              FID_INPUT_DATE_2: '20231001',
              FID_PERIOD_DIV_CODE: 'D',
              FID_ORG_ADJ_PRC: '0',
            },
          },
        );

        const output = response.data.output2;
        const formattedData = output.map((item: any) => ({
          date: item.stck_bsop_date,
          close: parseFloat(item.stck_clpr),
          open: parseFloat(item.stck_oprc),
          high: parseFloat(item.stck_hgpr),
          low: parseFloat(item.stck_lwpr),
          volume: parseInt(item.acml_vol, 10),
        }));
        setStockData(formattedData);
      } catch (error) {
        console.error('Failed to fetch stock data', error);
        setError('Failed to fetch stock data');
      }
    };

    const handleWebSocketMessage = (data: string) => {
      try {
        if (data.includes('SUBSCRIBE SUCCESS')) {
          console.log('WebSocket subscription successful');
          return;
        }

        const parsedData = data.split('|');
        const stockData = parsedData[3]?.split('^');

        if (stockData && stockData.length >= 13) {
          setStockData((prevState) => {
            const currentState: StockData[] = prevState || [];
            const newEntry: StockData = {
              date: new Date().toISOString(),
              close: parseFloat(stockData[2]),
              open: parseFloat(stockData[6]),
              high: parseFloat(stockData[7]),
              low: parseFloat(stockData[8]),
              volume: parseInt(stockData[12], 10),
            };
            return [...currentState, newEntry];
          });
        } else {
          console.error('Invalid stock data format:', stockData);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', data, error);
      }
    };

    const connect = async () => {
      const closeWebSocketConnection = await connectWebSocket(
        symbol,
        handleWebSocketMessage,
      );
      return closeWebSocketConnection;
    };

    let closeWebSocketConnection: () => void;

    fetchStockData();
    connect().then((closeFn) => {
      closeWebSocketConnection = closeFn;
    });

    return () => {
      if (closeWebSocketConnection) {
        closeWebSocketConnection();
      }
      closeWebSocket();
    };
  }, [symbol]);

  return (
    <div className="stock-chart">
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="stock-input"
        placeholder="Enter stock symbol"
      />
      {error && <p className="text-red-500">{error}</p>}
      <Chart
        id="stockChart"
        dataSource={stockData}
        title={`Stock Price Chart for ${symbol}`}
      >
        <ArgumentAxis valueType="datetime">
          <Label format="yyyy-MM-dd" />
        </ArgumentAxis>
        <ValueAxis name="price">
          <Label format="currency" />
        </ValueAxis>

        <Series
          valueField="close"
          argumentField="date"
          name="Close Price"
          type="candlestick"
          openValueField="open"
          highValueField="high"
          lowValueField="low"
          closeValueField="close"
          reduction={{ color: 'red' }}
        />

        <Tooltip
          enabled={true}
          location="edge"
          customizeTooltip={customizeTooltip}
        />
        <Legend visible={false} />
      </Chart>
    </div>
  );
};

function customizeTooltip(arg: any) {
  return {
    text: `Open: ${arg.openValue}<br/>High: ${arg.highValue}<br/>Low: ${arg.lowValue}<br/>Close: ${arg.closeValue}<br/>Volume: ${arg.point.data.volume}`,
  };
}

export default StockChart;
