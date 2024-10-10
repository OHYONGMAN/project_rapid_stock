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
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/getWebSocketKey`,
    {
      method: "POST",
    },
  )
    .then((res) => res.json())
    .then((data) => data.approval_key)
    .catch((err) => {
      console.error("Failed to fetch WebSocket key:", err);
      return null;
    });

  if (!approvalKey) {
    isConnecting = false;
    throw new Error("Failed to get WebSocket approval key");
  }

  if (socket && socket.readyState !== WebSocket.CLOSED) {
    socket.close();
    socket = null;
  }

  const wsUrl = `ws://ops.koreainvestment.com:21000/tryitout/H0STCNT0`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("WebSocket 연결 성공");
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
      if (typeof event.data === "string" && event.data.trim().startsWith("{")) {
        const data = JSON.parse(event.data);
        if (data && data.header && data.header.tr_id === "H0STCNT0") {
          const stockData = parseStockData(data);
          if (stockData) {
            onMessage(stockData);
          }
        }
      } else {
        console.error("Unexpected WebSocket message format:", event.data);
      }
    } catch (error) {
      console.error("WebSocket 메시지 처리 중 에러:", error);
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
    console.error("WebSocket 오류:", error);
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
  console.log("WebSocket 연결이 종료되었습니다.");
};

const parseStockData = (data: any) => {
  try {
    const { body } = data;
    if (body && body.rt_cd === "0") {
      const { stck_prpr, stck_oprc, stck_hgpr, stck_lwpr, cntg_vol } =
        body.output || {};

      return {
        stck_prpr: parseFloat(stck_prpr) || 0,
        stck_oprc: parseFloat(stck_oprc) || 0,
        stck_hgpr: parseFloat(stck_hgpr) || 0,
        stck_lwpr: parseFloat(stck_lwpr) || 0,
        cntg_vol: parseFloat(cntg_vol) || 0,
      };
    } else {
      console.warn("주식 데이터 응답에 문제가 있습니다:", body);
      return null;
    }
  } catch (error) {
    console.error("주식 데이터 파싱 중 에러:", error);
    return null;
  }
};
