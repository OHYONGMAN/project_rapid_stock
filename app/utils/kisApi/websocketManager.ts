import { connectWebSocket, parseStockData } from './websocket';

interface StockData {
  symbol: string;
  time: string;
  price: number;
  change: number;
  changeRate: number;
  volume: number;
  changeSign: string;
}

class WebSocketManager {
  private static instance: WebSocketManager;
  private subscribers: Map<string, Set<(data: StockData) => void>> = new Map();
  private activeConnections: Map<string, () => void> = new Map();
  private approvalKey: string | null = null;
  private approvalKeyExpiration: number = 0;

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  private async getApprovalKey(): Promise<string> {
    if (this.approvalKey && Date.now() < this.approvalKeyExpiration) {
      return this.approvalKey;
    }

    try {
      const response = await fetch('/api/websocket', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to fetch approval key');
      }
      const data = await response.json();
      this.approvalKey = data.approval_key;
      this.approvalKeyExpiration = Date.now() + 86400000; // 24시간 후 만료
      return this.approvalKey;
    } catch (error) {
      console.error('Error fetching approval key:', error);
      throw error;
    }
  }

  async connect(symbol: string): Promise<void> {
    if (this.activeConnections.has(symbol)) {
      console.log(`Already connected to ${symbol}`);
      return;
    }

    try {
      const approvalKey = await this.getApprovalKey();
      const disconnect = await connectWebSocket(symbol, approvalKey, (data) =>
        this.handleMessage(symbol, data),
      );
      this.activeConnections.set(symbol, disconnect);
      console.log(`Connected to ${symbol}`);
    } catch (error) {
      console.error(`Failed to connect to ${symbol}:`, error);
    }
  }

  private handleMessage = (symbol: string, data: string) => {
    const parsedData = parseStockData(data);
    if (parsedData) {
      const subscribers = this.subscribers.get(symbol) || new Set();
      subscribers.forEach((callback) => callback(parsedData));
    }
  };

  subscribe(symbol: string, callback: (data: StockData) => void): void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }
    this.subscribers.get(symbol)!.add(callback);

    if (!this.activeConnections.has(symbol)) {
      this.connect(symbol);
    }
  }

  unsubscribe(symbol: string, callback: (data: StockData) => void): void {
    const subscribers = this.subscribers.get(symbol);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscribers.delete(symbol);
        this.disconnectSymbol(symbol);
      }
    }
  }

  private disconnectSymbol(symbol: string): void {
    const disconnect = this.activeConnections.get(symbol);
    if (disconnect) {
      disconnect();
      this.activeConnections.delete(symbol);
      console.log(`Disconnected from ${symbol}`);
    }
  }

  close(): void {
    this.activeConnections.forEach((disconnect, symbol) => {
      disconnect();
      console.log(`Disconnected from ${symbol}`);
    });
    this.activeConnections.clear();
    this.subscribers.clear();
  }
}

export default WebSocketManager.getInstance();
