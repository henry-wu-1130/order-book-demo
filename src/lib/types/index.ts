export interface OrderItem {
  price: number;
  size: number;
  total: number;
}

export interface OrderBook {
  bids: OrderItem[];
  asks: OrderItem[];
}

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
  side: 'bid' | 'ask';
  timestamp: number;
}

export interface TradeMessage extends WebSocketMessage {
  data: [string, string, number, 'bid' | 'ask', string?][];
}

export type Order = {
  price: number;
  size: number;
  total: number;
};
