import React from 'react';
import cx from 'classnames';
import { formatNumber, formatPrice } from './helpers/utils';
import { type Order } from './types';

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
  // 動態 class 處理
  const isBuy = side === 'bid';
  const priceClass = isBuy ? 'buy-price' : 'sell-price';
  const totalBarClass = isBuy ? 'buy-total-bar' : 'sell-total-bar';
  const rowFlashClass = isBuy ? 'flash-row-buy' : 'flash-row-sell';

  const rowClass = cx('relative flex w-full quote-row', {
    //[rowFlashClass]: !prevOrder,
  });
  const barClass = cx({
    [totalBarClass]: true,
    [rowFlashClass]: !prevOrder,
  });

  // Size 變化的動畫
  let sizeFlashClass = '';
  if (prevOrder) {
    if (order.size > prevOrder.size) {
      sizeFlashClass = 'flash-size-up';
    } else if (order.size < prevOrder.size) {
      sizeFlashClass = 'flash-size-down';
    }
  }

  const cellClass = cx('flex justify-end w-33.33');

  const barWidthPercent = maxTotal > 0 ? (order.total / maxTotal) * 100 : 0;

  return (
    <div className={rowClass}>
      <div
        className={barClass}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          width: `${barWidthPercent}%`,
          zIndex: 0,
        }}
      />
      <div className={cx('flex justify-start', cellClass, priceClass)}>
        {formatPrice(order.price)}
      </div>
      <div className={cx('flex justify-end', cellClass, sizeFlashClass)}>
        {formatNumber(order.size)}
      </div>
      <div className={cellClass}>{formatNumber(order.total)}</div>
    </div>
  );
};

export default OrderBookRow;
