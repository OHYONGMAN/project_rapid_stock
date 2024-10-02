import axios from 'axios';
import * as signalR from '@aspnet/signalr';
import { getValidToken, getWebSocketKey } from './token';

export async function fetchHistoricalData(symbol: string) {
  const token = await getValidToken();
  if (!token) {
    throw new Error('Failed to get valid token');
  }

  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_KIS_API_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-price`,
    {
      params: {
        FID_COND_MRKT_DIV_CODE: 'J',
        FID_INPUT_ISCD: symbol,
        FID_PERIOD_DIV_CODE: 'D',
        FID_ORG_ADJ_PRC: '1',
      },
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
        appkey: process.env.NEXT_PUBLIC_KIS_API_KEY!,
        appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET!,
        tr_id: 'FHKST01010400',
      },
    },
  );

  return response.data.output.map((item: any) => ({
    date: new Date(item.stck_bsop_date),
    open: parseFloat(item.stck_oprc),
    high: parseFloat(item.stck_hgpr),
    low: parseFloat(item.stck_lwpr),
    close: parseFloat(item.stck_clpr),
    volume: parseInt(item.acml_vol, 10),
  }));
}

export function subscribeToRealtimeData(
  symbol: string,
  callback: (data: any) => void,
) {
  let connection: signalR.HubConnection | null = null;

  async function connect() {
    const approvalKey = await getWebSocketKey();
    console.log(approvalKey);

    if (!approvalKey) {
      throw new Error('Failed to get WebSocket approval key');
    }

    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_KIS_API_BASE_URL}/oauth2/Approval`, {
        accessTokenFactory: () => approvalKey,
      })
      .build();

    connection.on('ReceiveMessage', (message) => {
      const data = JSON.parse(message);
      if (data.header.tr_id === 'H0STCNT0') {
        callback({
          date: new Date(),
          open: parseFloat(data.body.open),
          high: parseFloat(data.body.high),
          low: parseFloat(data.body.low),
          close: parseFloat(data.body.close),
          volume: parseInt(data.body.cvolume, 10),
        });
      }
    });

    connection
      .start()
      .then(() => {
        console.log('SignalR Connected');
        connection?.invoke('SubscribeToStock', symbol);
      })
      .catch((err) => console.error('SignalR Connection Error: ', err));
  }

  connect();

  return () => {
    if (connection) {
      connection.stop();
    }
  };
}
