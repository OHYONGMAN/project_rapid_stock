// app/utils/kisApi/websocket.ts

let socket: WebSocket | null = null; // 웹소켓 연결 객체
let reconnectTimeout: NodeJS.Timeout | null = null; // 재연결 타이머
let isConnecting = false; // 연결 상태 플래그
let reconnectAttempts = 0; // 재연결 시도 횟수
const MAX_RECONNECT_ATTEMPTS = 5; // 최대 재연결 시도 횟수

// 웹소켓 연결 함수
export const connectWebSocket = async (
  symbol: string, // 주식 종목 코드
  onMessage: (data: any) => void, // 웹소켓 메시지를 처리할 콜백 함수
): Promise<() => void> => {
  if (isConnecting || (socket && socket.readyState === WebSocket.OPEN)) {
    // 이미 연결 중이거나, 연결이 되어 있으면 아무 작업도 하지 않음
    return () => {};
  }

  isConnecting = true; // 연결 중 상태로 변경

  // 서버로부터 승인 키 요청
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

  // 승인 키가 없을 경우 연결 종료
  if (!approvalKey) {
    isConnecting = false;
    throw new Error("웹소켓 승인 키 요청 실패");
  }

  // 기존 웹소켓이 닫히지 않았을 경우 닫음
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    socket.close();
    socket = null;
  }

  const wsUrl = `ws://ops.koreainvestment.com:21000/tryitout/H0STCNT0`; // 웹소켓 서버 URL
  socket = new WebSocket(wsUrl); // 웹소켓 연결 생성

  // 웹소켓 연결 성공 시 호출되는 콜백
  socket.onopen = () => {
    console.log("웹소켓 연결 성공");
    isConnecting = false; // 연결 상태 변경
    reconnectAttempts = 0; // 재연결 시도 횟수 초기화

    // 서버로 보낼 메시지 생성
    const message = {
      header: {
        approval_key: approvalKey, // 승인 키
        custtype: "P", // 개인 고객
        tr_type: "1",
        content_type: "utf-8",
      },
      body: {
        input: {
          tr_id: "H0STCNT0", // 거래 ID
          tr_key: symbol, // 주식 종목 코드
        },
      },
    };

    socket?.send(JSON.stringify(message)); // 서버에 메시지 전송
  };

  // 서버로부터 메시지를 수신할 때 호출되는 콜백
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

  // 웹소켓 연결이 종료되었을 때 호출되는 콜백
  socket.onclose = () => {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      // 재연결 시도
      const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000);
      reconnectTimeout = setTimeout(() => {
        reconnectAttempts++;
        connectWebSocket(symbol, onMessage); // 재연결
      }, delay);
    } else {
      console.error("최대 재연결 시도 횟수를 초과했습니다.");
    }
  };

  // 웹소켓 오류 발생 시 호출되는 콜백
  socket.onerror = (error) => {
    console.error("웹소켓 오류:", error);
  };

  return () => {
    closeWebSocket(); // 웹소켓 연결을 종료하는 함수 반환
  };
};

// 웹소켓 연결 종료 함수
export const closeWebSocket = () => {
  if (socket) {
    socket.close(); // 웹소켓 닫기
    socket = null;
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout); // 재연결 타이머 취소
  }
  console.log("웹소켓 연결이 종료되었습니다.");
};

// 수신한 주식 데이터를 파싱하는 함수
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
