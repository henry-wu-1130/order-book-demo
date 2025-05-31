import { useEffect, useRef } from 'react';
import OrderBookSide from './OrderBookSide';
import OrderBookLastPrice from './OrderBookLastPrice';
import { type Order, type Trade } from '../types';

export interface OrderBookData {
  bids: Order[];
  asks: Order[];
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
  const sameDirectionCount = useRef<number>(0);
  const lastDirection = useRef<'up' | 'down' | null>(null);

  // 每次 lastTrade 變動時，更新 prevPrice.current 和計算連續相同方向的次數
  useEffect(() => {
    if (lastTrade && typeof lastTrade.price === 'number') {
      const oldPrice = prevPrice.current;

      if (oldPrice !== null) {
        const currentDirection =
          lastTrade.price > oldPrice
            ? 'up'
            : lastTrade.price < oldPrice
            ? 'down'
            : null;

        if (currentDirection === lastDirection.current) {
          sameDirectionCount.current++;
        } else {
          sameDirectionCount.current = 1;
          lastDirection.current = currentDirection;
        }
      }

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
          sameDirectionCount={sameDirectionCount.current}
          lastDirection={lastDirection.current}
        />
        <OrderBookSide
          side="bid"
          orders={orderBook.bids}
          prevOrders={prevBidsRef.current || []}
          showHeader={false}
        />
      </div>
    </div>
  );
};

export default OrderBook;
