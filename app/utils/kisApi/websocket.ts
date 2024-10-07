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
  if (isConnecting || (socket && socket.readyState === WebSocket.OPEN)) {
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

  // WebSocket URL
  const wsUrl = `ws://ops.koreainvestment.com:21000/tryitout/H0STCNT0`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("WebSocket 연결 성공");
    isConnecting = false; // 연결 성공 시 플래그 해제
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
    console.log("Raw WebSocket Message:", event.data); // 수신된 메시지 출력
    try {
      const message = typeof event.data === "string"
        ? JSON.parse(event.data)
        : event.data; // 문자열일 경우에만 JSON 파싱
      console.log("Parsed WebSocket Message:", message); // 파싱된 메시지 출력
      onMessage(message); // 파싱된 메시지를 전달
    } catch (error) {
      console.error("WebSocket 메시지 처리 중 에러:", error);
    }
  };

  socket.onclose = () => {
    console.log("WebSocket 연결이 끊겼습니다. 5초 후 재연결 시도.");
    reconnectTimeout = setTimeout(() => {
      connectWebSocket(symbol, onMessage);
    }, 5000);
  };

  socket.onerror = (error) => {
    console.error("WebSocket 오류:", error);
  };

  return () => {
    if (socket) {
      socket.close();
      socket = null;
    }
  };
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
