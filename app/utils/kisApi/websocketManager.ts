// 웹소켓 연결 및 구독 관리 매니저 클래스 정의

import { closeWebSocket, connectWebSocket } from "./websocket";

class WebSocketManager {
    private static instance: WebSocketManager; // 싱글톤 인스턴스
    private subscribers: Map<string, Set<(data: any) => void>> = new Map(); // 종목 코드별 구독자 목록
    private symbol: string | null = null; // 현재 구독 중인 종목 코드
    private disconnect: (() => void) | null = null; // 웹소켓 연결 해제 함수

    private constructor() {}

    // 싱글톤 인스턴스 반환
    static getInstance(): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager();
        }
        return WebSocketManager.instance;
    }

    // 특정 종목 코드로 웹소켓 연결
    async connect(symbol: string) {
        if (this.symbol === symbol && this.disconnect) {
            return; // 이미 해당 종목으로 연결되어 있으면 아무것도 하지 않음
        }

        // 기존 연결 해제
        if (this.disconnect) {
            this.disconnect();
            this.disconnect = null;
        }

        this.symbol = symbol; // 현재 종목 코드 업데이트
        this.disconnect = await connectWebSocket(symbol, this.handleMessage); // 웹소켓 연결 및 메시지 핸들러 설정
    }

    // 수신된 메시지를 각 구독자에게 전달하는 함수
    private handleMessage = (data: any) => {
        const subscribers = this.subscribers.get(this.symbol!) || new Set();
        subscribers.forEach((callback) => callback(data)); // 구독자들에게 데이터 전달
    };

    // 특정 종목 코드에 대해 콜백 함수를 구독자로 등록
    subscribe(symbol: string, callback: (data: any) => void) {
        if (!this.subscribers.has(symbol)) {
            this.subscribers.set(symbol, new Set());
        }
        this.subscribers.get(symbol)!.add(callback);

        if (this.symbol !== symbol) {
            this.connect(symbol); // 새로운 종목 코드로 연결
        }
    }

    // 특정 종목 코드에 대해 콜백 함수를 구독자 목록에서 제거
    unsubscribe(symbol: string, callback: (data: any) => void) {
        const subscribers = this.subscribers.get(symbol);
        if (subscribers) {
            subscribers.delete(callback);
            if (subscribers.size === 0) {
                this.subscribers.delete(symbol);
                if (this.symbol === symbol && this.disconnect) {
                    this.disconnect(); // 구독자가 없으면 연결 해제
                    this.disconnect = null;
                    this.symbol = null;
                }
            }
        }
    }

    // 모든 연결과 구독을 해제
    close() {
        if (this.disconnect) {
            this.disconnect();
            this.disconnect = null;
        }
        this.symbol = null;
        this.subscribers.clear();
    }
}

// 싱글톤 인스턴스 내보내기
export default WebSocketManager.getInstance();
