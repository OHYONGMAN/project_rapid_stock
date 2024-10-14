// app/utils/kisApi/websocket.ts

let socket: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let isConnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const connectWebSocket = async (
  symbol: string,
  onMessage: (data: any) => void,
): Promise<() => void> => {
  if (isConnecting || (socket && socket.readyState === WebSocket.OPEN)) {
    return () => {};
  }

  isConnecting = true;

  const approvalKey = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/websocket`,
    {
      method: "POST",
    },
  )
    .then((res) => res.json())
    .then((data) => data.approval_key)
    .catch((err) => {
      console.error("웹소켓 키 요청 실패:", err);
      return null;
    });

  if (!approvalKey) {
    isConnecting = false;
    throw new Error("웹소켓 승인 키 요청 실패");
  }

  if (socket && socket.readyState !== WebSocket.CLOSED) {
    socket.close();
    socket = null;
  }

  const wsUrl = `ws://ops.koreainvestment.com:21000/tryitout/H0STCNT0`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("웹소켓 연결 성공");
    isConnecting = false;
    reconnectAttempts = 0;

    const message = {
      header: {
        approval_key: approvalKey,
        custtype: "P",
        tr_type: "1",
        content_type: "utf-8",
      },
      body: {
        input: {
          tr_id: "H0STCNT0",
          tr_key: symbol,
        },
      },
    };

    socket?.send(JSON.stringify(message));
  };

  socket.onmessage = (event) => {
    try {
      const stockData = parseStockData(event.data);
      if (stockData) {
        onMessage(stockData);
      }
    } catch (error) {
      console.error("웹소켓 메시지 처리 중 오류:", error);
    }
  };

  socket.onclose = () => {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000);
      reconnectTimeout = setTimeout(() => {
        reconnectAttempts++;
        connectWebSocket(symbol, onMessage);
      }, delay);
    } else {
      console.error("최대 재연결 시도 횟수를 초과했습니다.");
    }
  };

  socket.onerror = (error) => {
    console.error("웹소켓 오류:", error);
  };

  return () => {
    closeWebSocket();
  };
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  console.log("웹소켓 연결이 종료되었습니다.");
};

const parseStockData = (data: any) => {
  try {
    if (typeof data === "string" && data.startsWith("0|H0STCNT0|")) {
      const [, , , stockData] = data.split("|");
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
      ] = stockData.split("^");

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
    } else if (
      typeof data === "object" && data.header &&
      data.header.tr_id === "H0STCNT0"
    ) {
      console.log("웹소켓 연결 성공:", data);
      return null;
    } else {
      console.warn("알 수 없는 데이터 형식:", data);
      return null;
    }
  } catch (error) {
    console.error("주식 데이터 파싱 중 오류 발생:", error);
    return null;
  }
};
