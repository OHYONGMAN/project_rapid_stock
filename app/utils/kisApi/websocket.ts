// app/utils/kisApi/websocket.ts

"use client";

import { getWebSocketKey } from "./token";

let socket: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let isConnecting = false;

export const connectWebSocket = async (
  symbol: string,
  onMessage: (data: any) => void,
): Promise<() => void> => {
  if (
    isConnecting ||
    (socket &&
      (socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING))
  ) {
    return () => {};
  }

  isConnecting = true;

  const approvalKey = await getWebSocketKey();

  if (!approvalKey) {
    isConnecting = false;
    return () => {};
  }

  // 기존 연결 종료
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    socket.close();
    socket = null;
  }

  const wsUrl = `ws://ops.koreainvestment.com:21000/tryitout/H0STCNT0`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    isConnecting = false; // 연결이 완료되었으므로 `isConnecting`을 false로 설정
    console.log("WebSocket 연결 성공");
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
      const message = event.data;
      onMessage(message);
    } catch (error) {
      console.error("WebSocket 메시지 처리 중 에러:", error);
    }
  };

  socket.onclose = () => {
    console.log("WebSocket 연결이 끊겼습니다. 5초 후 재연결 시도.");
    isConnecting = false; // 연결이 끊어졌으므로 `isConnecting`을 false로 설정
    reconnectTimeout = setTimeout(() => {
      connectWebSocket(symbol, onMessage);
    }, 5000);
  };

  socket.onerror = (error) => {
    console.error("WebSocket 오류:", error);
    isConnecting = false; // 오류가 발생했으므로 재연결을 시도할 수 있도록 설정
  };

  return () => {
    if (socket) {
      socket.close();
      socket = null;
      clearTimeout(reconnectTimeout!); // 재연결 시도를 중단하기 위해 `clearTimeout` 호출
    }
  };
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
