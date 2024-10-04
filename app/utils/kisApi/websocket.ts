import { getWebSocketKey } from "./token";

let socket: WebSocket | null = null;

export const connectWebSocket = async (
  symbol: string,
  onMessage: (data: any) => void,
): Promise<() => void> => {
  const response = await fetch("/api/getWebSocketKey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appkey: process.env.NEXT_PUBLIC_KIS_API_KEY,
      secretkey: process.env.NEXT_PUBLIC_KIS_API_SECRET,
    }),
  });

  if (!response.ok) {
    console.error("Failed to get WebSocket approval key");
    return () => {};
  }

  const { approval_key } = await response.json();

  const wsUrl = process.env.NEXT_PUBLIC_KIS_API_WEBSOCKET_URL;

  if (!wsUrl) {
    console.error("WebSocket URL is not defined");
    return () => {};
  }

  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("WebSocket connected");
    const message = {
      approKey: approval_key,
      tr_id: "H0STCNT0",
      tr_key: symbol,
    };
    if (socket) {
      socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
  };

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
