import {
  WebSocketManager,
  type WebSocketMessage,
} from '../websocket/WebSocketManager';

export type OrderBookEntry = {
  price: number;
  size: number;
  total: number;
};

export type OrderBookData = {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  seqNum?: number;
};

export interface OrderBookUpdate extends WebSocketMessage {
  data: {
    type: 'snapshot' | 'delta';
    seqNum: number;
    bids: [number, number][];
    asks: [number, number][];
  };
  seqNum: number;
  prevSeqNum?: number;
  timestamp: number;
}

export class OrderBookService {
  private ws: WebSocketManager;
  private lastSeqNum: number | null = null;
  private onUpdateCallback: ((data: OrderBookData) => void) | null = null;
  private resubscribeAttempts = 0;
  private maxResubscribeAttempts = 3;
  private lastResubscribeTime = 0;
  private readonly MIN_RESUBSCRIBE_INTERVAL = 5000; // 5 seconds
  private readonly MAX_ORDERS = 8;

  // 快照緩存
  private orderBookCache: {
    bids: Map<number, number>; // price -> size
    asks: Map<number, number>;
    seqNum: number | null;
  } = {
    bids: new Map(),
    asks: new Map(),
    seqNum: null,
  };

  constructor() {
    this.ws = WebSocketManager.getInstance({
      url: 'wss://ws.btse.com/ws/oss/futures',
      onOpen: () => {
        this.subscribe();
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
      },
      onClose: () => {
        console.log('WebSocket closed');
      },
    });
  }

  private handleMessage = (message: WebSocketMessage) => {
    const update = message as OrderBookUpdate;

    if (update.data?.type === 'snapshot') {
      // 處理快照數據
      this.lastSeqNum = update.data.seqNum;
      this.orderBookCache.seqNum = update.data.seqNum;

      // 清空並重建緩存
      this.orderBookCache.bids.clear();
      this.orderBookCache.asks.clear();

      // 更新緩存
      update.data.bids.forEach(([price, size]) => {
        if (size > 0) {
          this.orderBookCache.bids.set(price, size);
        }
      });

      update.data.asks.forEach(([price, size]) => {
        if (size > 0) {
          this.orderBookCache.asks.set(price, size);
        }
      });

      // 重置重訂閱計數
      this.resubscribeAttempts = 0;
    } else if (update.data?.type === 'delta') {
      // 檢查序列號
      if (
        this.lastSeqNum !== null &&
        update.data.seqNum !== this.lastSeqNum + 1
      ) {
        console.log('Sequence number mismatch');

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
        return;
      }

      this.lastSeqNum = update.data.seqNum;

      // 更新緩存
      update.data.bids.forEach(([price, size]) => {
        if (Number(size) === 0) {
          this.orderBookCache.bids.delete(price);
        } else {
          this.orderBookCache.bids.set(price, size);
        }
      });

      update.data.asks.forEach(([price, size]) => {
        if (Number(size) === 0) {
          this.orderBookCache.asks.delete(price);
        } else {
          this.orderBookCache.asks.set(price, size);
        }
      });
    }

    // 將緩存轉換為排序後的訂單簿數據
    this.notifyUpdate();
  };

  private notifyUpdate() {
    // 從緩存創建排序後的訂單簿數據
    const orderBook: OrderBookData = {
      bids: [],
      asks: [],
      seqNum: this.orderBookCache.seqNum || 0,
    };

    // 轉換 bids
    const sortedBids = Array.from(this.orderBookCache.bids.entries())
      .sort(([priceA], [priceB]) => Number(priceA) - Number(priceB))
      .slice(0, this.MAX_ORDERS)
      .map(([price, size]) => ({
        price: Number(price),
        size: Number(size),
        total: 0,
      }));

    // 轉換 asks
    const sortedAsks = Array.from(this.orderBookCache.asks.entries())
      .sort(([priceA], [priceB]) => Number(priceB) - Number(priceA))
      .slice(0, this.MAX_ORDERS)
      .map(([price, size]) => ({
        price: Number(price),
        size: Number(size),
        total: 0,
      }));

    // 計算累計數量
    let bidTotal = 0;
    sortedBids.forEach((bid) => {
      bidTotal = bidTotal + bid.size;
      bid.total = bidTotal;
    });

    let askTotal = 0;
    sortedAsks.forEach((ask) => {
      askTotal = askTotal + ask.size;
      ask.total = askTotal;
    });

    orderBook.bids = sortedBids;
    orderBook.asks = sortedAsks;

    this.onUpdateCallback?.(orderBook);
  }

  private subscribe() {
    this.ws.subscribe('update:BTCPFC_0', this.handleMessage);
  }

  private resubscribe() {
    this.ws.unsubscribe('update:BTCPFC_0', this.handleMessage);
    this.subscribe();
  }

  public onUpdate(callback: (data: OrderBookData) => void) {
    this.onUpdateCallback = callback;
  }

  public close() {
    this.ws.unsubscribe('update:BTCPFC_0', this.handleMessage.bind(this));
    this.ws.close();
  }
}
