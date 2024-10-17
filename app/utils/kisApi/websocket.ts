let socket: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
const MAX_RECONNECT_ATTEMPTS = 5;

export const connectWebSocket = async (
  symbol: string,
  approvalKey: string,
  onMessage: (data: string) => void,
): Promise<() => void> => {
  let reconnectAttempts = 0;

  const connect = async () => {
    try {
      if (!socket || socket.readyState === WebSocket.CLOSED) {
        socket = new WebSocket(
          'ws://ops.koreainvestment.com:21000/tryitout/H0STCNT0',
        );
      }

      socket.onopen = () => {
        console.log('WebSocket connected');
        sendSubscribeMessage(socket, approvalKey, symbol);
      };

      socket.onmessage = (event) => {
        onMessage(event.data);
      };

      socket.onclose = () => {
        console.log('WebSocket closed');
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectTimeout = setTimeout(() => {
            reconnectAttempts++;
            connect();
          }, 5000);
        } else {
          console.error('Max reconnection attempts reached');
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  await connect();

  return () => {
    if (socket) {
      socket.close();
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
  };
};

const sendSubscribeMessage = (
  socket: WebSocket,
  approvalKey: string,
  symbol: string,
) => {
  const message = {
    header: {
      approval_key: approvalKey,
      custtype: 'P',
      tr_type: '1',
      content_type: 'utf-8',
    },
    body: {
      input: {
        tr_id: 'H0STCNT0',
        tr_key: symbol,
      },
    },
  };
  socket.send(JSON.stringify(message));
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
};

export const parseStockData = (data: string | any) => {
  try {
    if (typeof data === 'string' && data.startsWith('0|H0STCNT0|')) {
      const [, , , stockData] = data.split('|');
      const [
        MKSC_SHRN_ISCD,
        STCK_CNTG_HOUR,
        STCK_PRPR,
        PRDY_VRSS_SIGN,
        PRDY_VRSS,
        PRDY_CTRT,
        ,
        STCK_OPRC,
        STCK_HGPR,
        STCK_LWPR,
        ,
        ,
        ,
        ACML_VOL,
      ] = stockData.split('^');

      return {
        symbol: MKSC_SHRN_ISCD,
        time: STCK_CNTG_HOUR,
        price: parseFloat(STCK_PRPR),
        change: parseFloat(PRDY_VRSS),
        changeRate: parseFloat(PRDY_CTRT),
        open: parseFloat(STCK_OPRC),
        high: parseFloat(STCK_HGPR),
        low: parseFloat(STCK_LWPR),
        volume: parseFloat(ACML_VOL),
        changeSign: PRDY_VRSS_SIGN,
      };
    } else if (typeof data === 'object' && data?.header?.tr_id === 'H0STCNT0') {
      console.log('웹소켓 연결 성공:', data);
      return null;
    } else {
      console.warn('알 수 없는 데이터 형식:', data);
      return null;
    }
  } catch (error) {
    console.error('주식 데이터 파싱 중 오류 발생:', error);
    return null;
  }
};
