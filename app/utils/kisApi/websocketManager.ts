// app/utils/kisApi/websocketManager.ts

import { closeWebSocket, connectWebSocket } from "./websocket";

class WebSocketManager {
    private static instance: WebSocketManager;
    private subscribers: Map<string, Set<(data: any) => void>> = new Map();
    private symbol: string | null = null;
    private disconnect: (() => void) | null = null;

    private constructor() {}

    static getInstance(): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager();
        }
        return WebSocketManager.instance;
    }

    async connect(symbol: string) {
        if (this.symbol === symbol && this.disconnect) {
            return;
        }

        if (this.disconnect) {
            this.disconnect();
            this.disconnect = null;
        }

        this.symbol = symbol;
        this.disconnect = await connectWebSocket(symbol, this.handleMessage);
    }

    private handleMessage = (data: any) => {
        const subscribers = this.subscribers.get(this.symbol!) || new Set();
        subscribers.forEach((callback) => callback(data));
    };

    subscribe(symbol: string, callback: (data: any) => void) {
        if (!this.subscribers.has(symbol)) {
            this.subscribers.set(symbol, new Set());
        }
        this.subscribers.get(symbol)!.add(callback);

        if (this.symbol !== symbol) {
            this.connect(symbol);
        }
    }

    unsubscribe(symbol: string, callback: (data: any) => void) {
        const subscribers = this.subscribers.get(symbol);
        if (subscribers) {
            subscribers.delete(callback);
            if (subscribers.size === 0) {
                this.subscribers.delete(symbol);
                if (this.symbol === symbol && this.disconnect) {
                    this.disconnect();
                    this.disconnect = null;
                    this.symbol = null;
                }
            }
        }
    }

    close() {
        if (this.disconnect) {
            this.disconnect();
            this.disconnect = null;
        }
        this.symbol = null;
        this.subscribers.clear();
    }
}

export default WebSocketManager.getInstance();
