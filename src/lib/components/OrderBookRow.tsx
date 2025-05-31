import React from 'react';
import cx from 'classnames';
import { formatNumber, formatPrice } from '../helpers/utils';
import { type Order } from '../types';

interface OrderBookRowProps {
  order: Order;
  prevOrder?: Order | null;
  side: 'ask' | 'bid';
  maxTotal: number;
}

const OrderBookRow: React.FC<OrderBookRowProps> = ({
  order,
  prevOrder,
  side,
  maxTotal,
}) => {
  const isBuy = side === 'bid';

  const isNewPrice = !prevOrder || prevOrder.price !== order.price;

  const isSamePrice = prevOrder && prevOrder.price === order.price;

  const rowClass = cx('relative flex w-full quote-row', {
    'ask-quote': side === 'ask',
    'bid-quote': side === 'bid',
    'flash-row-buy bg-flash-bid': isNewPrice && isBuy,
    'flash-row-ask bg-flash-ask': isNewPrice && !isBuy,
  });

  const totalBarClass = isBuy ? 'bid-total-bar' : 'ask-total-bar';

  const priceClass = isBuy ? 'text-bid' : 'text-ask';

  const sizeClass = cx({
    'flash-size-up bg-up': isSamePrice && order.size > prevOrder.size,
    'flash-size-down bg-down': isSamePrice && order.size < prevOrder.size,
  });

  const barWidthPercent = maxTotal > 0 ? (order.size / maxTotal) * 100 : 0;

  return (
    <div className={rowClass}>
      <div
        className={totalBarClass}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          width: `${barWidthPercent}%`,
          zIndex: 0,
        }}
      />
      <div className={cx('flex justify-start w-33.33', priceClass)}>
        {formatPrice(order.price)}
      </div>
      <div className={cx('flex justify-end w-33.33', sizeClass)}>
        {formatNumber(order.size)}
      </div>
      <div className={cx('flex justify-end w-33.34')}>
        {formatNumber(order.total)}
      </div>
    </div>
  );
};

export default OrderBookRow;
