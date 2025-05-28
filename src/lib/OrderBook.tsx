import { useEffect, useRef } from 'react';
import OrderBookSide from './OrderBookSide';
import OrderBookLastPrice from './OrderBookLastPrice';
import { type Order } from './types';

export interface OrderBookData {
  bids: Order[];
  asks: Order[];
}

export interface Trade {
  price: number;
}

interface OrderBookProps {
  orderBook: OrderBookData;
  lastTrade: Trade | null;
}

const OrderBook = ({ orderBook, lastTrade }: OrderBookProps) => {
  const prevPrice = useRef<number | null>(null);

  // --- highlight animation state ---
  const prevAsksRef = useRef<Order[]>([]);
  const prevBidsRef = useRef<Order[]>([]);

  // 每次 lastTrade 變動時，更新 prevPrice.current
  useEffect(() => {
    if (lastTrade && typeof lastTrade.price === 'number') {
      prevPrice.current = lastTrade.price;
    }
  }, [lastTrade]);

  // 更新 prevAsks/prevBids，每次 orderBook 變動時
  useEffect(() => {
    prevAsksRef.current = orderBook.asks;
    prevBidsRef.current = orderBook.bids;
  }, [orderBook]);

  return (
    <div className="order-book">
      <div className="header">
        <h2>Order Book</h2>
      </div>
      <div className="content">
        <OrderBookSide
          side="ask"
          orders={orderBook.asks}
          prevOrders={prevAsksRef.current || []}
        />
        <OrderBookLastPrice
          lastTrade={lastTrade}
          prevPrice={prevPrice.current}
        />
        <OrderBookSide
          side="bid"
          orders={orderBook.bids}
          prevOrders={prevBidsRef.current || []}
        />
      </div>
    </div>
  );
};

export default OrderBook;
