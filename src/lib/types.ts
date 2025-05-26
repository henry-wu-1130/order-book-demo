export interface WebSocketConfig {
  url: string;
  onOpen?: () => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
}

export interface WebSocketMessage {
  topic?: string;
  channel?: string;
  data: unknown;
}

export interface Trade {
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

export interface TradeMessage extends WebSocketMessage {
  data: [string, string, number, 'buy' | 'sell', string?][];
}
