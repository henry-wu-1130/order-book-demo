import {
  WebSocketManager,
  type WebSocketMessage,
} from '../websocket/WebSocketManager';

export interface TradeMessage extends WebSocketMessage {
  topic: string;
  data: {
    price: string;
    size: string;
    timestamp: number;
    side: 'buy' | 'sell';
  }[];
}

export interface Trade {
  price: number;
  size: number;
  timestamp: number;
  side: 'buy' | 'sell';
  spread?: number;
}

export class TradeService {
  private wsManager: WebSocketManager;
  private onTradeCallback: ((trade: Trade) => void) | null = null;
  private resubscribeAttempts = 0;
  private maxResubscribeAttempts = 3;
  private lastResubscribeTime = 0;
  private readonly MIN_RESUBSCRIBE_INTERVAL = 5000; // 5 seconds
  private readonly TOPIC = 'tradeHistoryApi:BTCPFC';

  constructor() {
    this.wsManager = WebSocketManager.getInstance({
      url: 'wss://ws.btse.com/ws/futures',
      onOpen: () => {
        this.subscribe();
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
        this.handleResubscribe();
      },
      onClose: () => {
        this.handleResubscribe();
      },
    });
  }

  private handleMessage = (message: WebSocketMessage) => {
    const tradeMsg = message as TradeMessage;

    if (!Array.isArray(tradeMsg.data) || tradeMsg.data.length === 0) {
      return;
    }

    const { price, size, timestamp, side } = tradeMsg.data[0];

    const trade: Trade = {
      price: parseFloat(price),
      size: parseFloat(size),
      timestamp,
      side,
    };

    this.onTradeCallback?.(trade);
  };

  private async subscribe() {
    try {
      await this.wsManager.subscribe(this.TOPIC, this.handleMessage);
      this.resubscribeAttempts = 0;
    } catch (error) {
      console.error('Subscribe error:', error);
      this.handleResubscribe();
    }
  }

  private handleResubscribe() {
    const now = Date.now();
    if (now - this.lastResubscribeTime < this.MIN_RESUBSCRIBE_INTERVAL) {
      console.log('Skipping resubscribe due to rate limit');
      return;
    }

    if (this.resubscribeAttempts >= this.maxResubscribeAttempts) {
      console.error('Max resubscribe attempts reached');
      return;
    }

    this.lastResubscribeTime = now;
    this.resubscribeAttempts++;
    this.resubscribe();
  }

  private async resubscribe() {
    this.wsManager.unsubscribe(this.TOPIC, this.handleMessage);
    await this.subscribe();
  }

  public async onTrade(callback: (trade: Trade) => void) {
    if (!callback || typeof callback !== 'function') {
      return;
    }

    this.onTradeCallback = callback;
  }

  public close() {
    this.wsManager.unsubscribe(this.TOPIC, this.handleMessage);
    this.wsManager.close();
  }
}
