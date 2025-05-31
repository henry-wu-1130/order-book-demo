import React from 'react';
import OrderBookRow from './OrderBookRow';
import type { Order } from '../types';

interface OrderBookSideProps {
  side: 'ask' | 'bid';
  orders: Order[];
  prevOrders: Order[];
  showHeader?: boolean;
}

const OrderBookSide: React.FC<OrderBookSideProps> = ({
  side,
  orders,
  prevOrders,
  showHeader = true,
}) => {
  const maxTotal =
    orders.length > 0
      ? side === 'ask'
        ? orders[0].total
        : orders[orders.length - 1].total
      : 0;

  return (
    <div
      className={`quote-table ${side === 'ask' ? 'ask-quote' : 'bid-quote'}`}
    >
      {showHeader && (
        <div className="flex font-semibold quote-header">
          <div className="w-33.33 flex justify-start">Price (USD)</div>
          <div className="w-33.33 flex justify-end">Size</div>
          <div className="w-33.34 flex justify-end">Total</div>
        </div>
      )}
      <div className="quote-body">
        {orders.map((order) => {
          const prevOrder = prevOrders.find((o) => o.price === order.price);
          return (
            <OrderBookRow
              key={order.price}
              order={order}
              prevOrder={prevOrder}
              side={side}
              maxTotal={maxTotal}
            />
          );
        })}
      </div>
    </div>
  );
};

export default OrderBookSide;
