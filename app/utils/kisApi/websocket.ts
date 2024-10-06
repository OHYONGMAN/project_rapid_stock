// app/utils/kisApi/websocket.ts

import { getWebSocketKey } from "./token";

let socket: WebSocket | null = null;

export const connectWebSocket = async (
  symbol: string,
  onMessage: (data: any) => void,
): Promise<() => void> => {
  const approvalKey = await getWebSocketKey();

  if (!approvalKey) {
    console.error("웹소켓 접속키 발급 실패로 인해 연결 시도 불가");
    return () => {};
  }

  const wsUrl = process.env.NEXT_PUBLIC_KIS_API_WEBSOCKET_URL;

  if (!wsUrl) {
    console.error("WebSocket URL이 정의되지 않았습니다.");
    return () => {};
  }

  try {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
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

      if (socket) {
        socket.send(JSON.stringify(message));
        console.log("웹소켓 메시지 전송:", JSON.stringify(message));
      } else {
        console.error("웹소켓이 연결되지 않았습니다.");
      }
    };

    socket.onmessage = (event) => {
      console.log("웹소켓 메시지 수신:", event.data);
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    socket.onerror = (error) => {
      console.error("웹소켓 오류 발생:", error);
    };

    let retryCount = 0;
    const maxRetries = 5;

    socket.onclose = () => {
      console.log("WebSocket 연결이 종료되었습니다.");
      if (retryCount < maxRetries) {
        console.log("연결을 재시도합니다...");
        retryCount++;
        setTimeout(() => {
          connectWebSocket(symbol, onMessage);
        }, 1000 * retryCount);
      } else {
        console.error(
          "최대 재시도 횟수에 도달했습니다. WebSocket은 재연결되지 않습니다.",
        );
      }
    };
  } catch (error) {
    console.error("WebSocket 연결 시 에러 발생:", error);
  }

  return () => {
    if (socket) {
      socket.close();
    }
  };
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
  }
};
