// 웹소켓 연결 및 관리 유틸리티 함수 정의

let socket: WebSocket | null = null; // 웹소켓 객체
let reconnectTimeout: NodeJS.Timeout | null = null; // 재연결 타이머
let isConnecting = false; // 연결 중인지 여부
let reconnectAttempts = 0; // 재연결 시도 횟수
const MAX_RECONNECT_ATTEMPTS = 5; // 최대 재연결 시도 횟수

// 웹소켓에 연결하는 함수
export const connectWebSocket = async (
  symbol: string, // 종목 코드
  onMessage: (data: any) => void, // 메시지 수신 시 호출되는 콜백 함수
): Promise<() => void> => {
  if (isConnecting || (socket && socket.readyState === WebSocket.OPEN)) {
    return () => {};
  }

  isConnecting = true; // 연결 중 상태 설정

  // 웹소켓 승인 키 요청
  const approvalKey = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/websocket`,
    {
      method: 'POST',
    },
  )
    .then((res) => res.json())
    .then((data) => data.approval_key)
    .catch((err) => {
      console.error('웹소켓 키 요청 실패:', err);
      return null;
    });

  if (!approvalKey) {
    isConnecting = false;
    throw new Error('웹소켓 승인 키 요청 실패');
  }

  // 기존 웹소켓 연결이 존재하면 닫음
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    socket.close();
    socket = null;
  }

  const wsUrl = `ws://ops.koreainvestment.com:21000/tryitout/H0STCNT0`; // 웹소켓 서버 URL
  socket = new WebSocket(wsUrl); // 웹소켓 객체 생성

  // 웹소켓 연결 성공 시
  socket.onopen = () => {
    console.log('웹소켓 연결 성공');
    isConnecting = false;
    reconnectAttempts = 0; // 재연결 시도 횟수 초기화

    // 웹소켓을 통해 구독 메시지 전송
    const message = {
      header: {
        approval_key: approvalKey, // 승인 키 포함
        custtype: 'P', // 고객 타입 (개인)
        tr_type: '1', // 거래 유형
        content_type: 'utf-8', // 콘텐츠 타입
      },
      body: {
        input: {
          tr_id: 'H0STCNT0', // 거래 ID
          tr_key: symbol, // 종목 코드
        },
      },
    };

    socket?.send(JSON.stringify(message)); // 구독 메시지 전송
  };

  // 웹소켓으로부터 메시지 수신 시
  socket.onmessage = (event) => {
    try {
      const stockData = parseStockData(event.data); // 수신된 데이터 파싱
      if (stockData) {
        onMessage(stockData); // 콜백 함수 호출
      }
    } catch (error) {
      console.error('웹소켓 메시지 처리 중 오류:', error);
    }
  };

  // 웹소켓 연결이 닫힐 경우 재연결 시도
  socket.onclose = () => {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000); // 지수적 백오프 적용
      reconnectTimeout = setTimeout(() => {
        reconnectAttempts++;
        connectWebSocket(symbol, onMessage); // 재연결 시도
      }, delay);
    } else {
      console.error('최대 재연결 시도 횟수를 초과했습니다.');
    }
  };

  // 웹소켓 오류 발생 시
  socket.onerror = (error) => {
    console.error('웹소켓 오류:', error);
  };

  // 웹소켓 연결 해제 함수 반환
  return () => {
    closeWebSocket();
  };
};

// 웹소켓 연결을 닫는 함수
export const closeWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  console.log('웹소켓 연결이 종료되었습니다.');
};

// 수신된 주식 데이터를 파싱하는 함수
const parseStockData = (data: any) => {
  try {
    // 문자열 형식의 데이터인지 확인
    if (typeof data === 'string' && data.startsWith('0|H0STCNT0|')) {
      const [, , , stockData] = data.split('|');
      const [
        MKSC_SHRN_ISCD, // 종목 코드
        STCK_CNTG_HOUR, // 거래 시간
        STCK_PRPR, // 현재가
        PRDY_VRSS_SIGN, // 전일 대비 부호
        PRDY_VRSS, // 전일 대비 가격
        PRDY_CTRT, // 전일 대비율
        ,
        // 사용되지 않는 필드
        STCK_OPRC, // 시가
        STCK_HGPR, // 고가
        STCK_LWPR, // 저가
        ,
        ,
        ,
        // 사용되지 않는 필드
        // 사용되지 않는 필드
        // 사용되지 않는 필드
        ACML_VOL, // 누적 거래량
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
    } else if (
      typeof data === 'object' &&
      data.header &&
      data.header.tr_id === 'H0STCNT0'
    ) {
      // 웹소켓 연결 성공 메시지 처리
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
