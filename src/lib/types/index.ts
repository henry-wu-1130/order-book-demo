export interface OrderItem {
  price: number;
  size: number;
  total: number;
}

export interface OrderBook {
  bids: OrderItem[];
  asks: OrderItem[];
}
