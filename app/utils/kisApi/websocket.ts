// app/utils/kisApi/websocket.ts

import { getWebSocketKey } from "./token";

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

  const approvalKey = await getWebSocketKey();

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

    if (socket) {
      socket.send(JSON.stringify(message));
    }
  };

  socket.onmessage = (event) => {
    try {
      const data = event.data;
      if (typeof data === "string") {
        const [encryptFlag, trId, dataCount, ...items] = data.split("|");
        if (trId === "H0STCNT0") {
          const stockData = parseStockData(items[0]);
          onMessage(stockData);
        }
      } else {
        console.warn("Unexpected message format:", data);
      }
    } catch (error) {
      console.error("WebSocket 메시지 처리 중 에러:", error);
    }
  };

  socket.onclose = (event) => {
    console.log(
      `WebSocket 연결이 끊겼습니다. 코드: ${event.code}, 이유: ${event.reason}`,
    );
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000);
      console.log(
        `${delay / 1000}초 후 재연결 시도 (${
          reconnectAttempts + 1
        }/${MAX_RECONNECT_ATTEMPTS})`,
      );
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
    if (socket) {
      socket.close();
      socket = null;
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
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
};

const parseStockData = (data: string) => {
  const [
    MKSC_SHRN_ISCD,
    STCK_CNTG_HOUR,
    STCK_PRPR,
    PRDY_VRSS_SIGN,
    PRDY_VRSS,
    PRDY_CTRT,
    WGHN_AVRG_STCK_PRC,
    STCK_OPRC,
    STCK_HGPR,
    STCK_LWPR,
    ASKP1,
    BIDP1,
    CNTG_VOL,
    ACML_VOL,
    ACML_TR_PBMN,
    ...rest
  ] = data.split("^");

  const prdy_vrss = parseFloat(PRDY_VRSS);
  const stck_prpr = parseFloat(STCK_PRPR);

  return {
    stck_prpr: stck_prpr,
    stck_oprc: parseFloat(STCK_OPRC),
    stck_hgpr: parseFloat(STCK_HGPR),
    stck_lwpr: parseFloat(STCK_LWPR),
    cntg_vol: parseFloat(CNTG_VOL),
    acml_vol: parseFloat(ACML_VOL),
    prdy_vrss: prdy_vrss,
    prdy_ctrt: parseFloat(PRDY_CTRT),
    prdy_vrss_sign: PRDY_VRSS_SIGN,
  };
};
