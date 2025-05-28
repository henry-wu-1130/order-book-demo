import React from 'react';
import cx from 'classnames';
import { formatNumber } from './helpers/utils';
import { type Order } from './types';

interface OrderBookRowProps {
  order: Order;
  prevOrder?: Order;
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
    [rowFlashClass]: !prevOrder,
  });
  const barClass = cx({
    [totalBarClass]: true,
    [rowFlashClass]: !prevOrder,
  });
  const cellClass = cx('w-33.33');

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
      <div className={cx(priceClass, cellClass)}>
        {formatNumber(order.price)}
      </div>
      <div className={cx(cellClass)}>{formatNumber(order.size)}</div>
      <div className={'w-33.34'}>{formatNumber(order.total)}</div>
    </div>
  );
};

export default OrderBookRow;
