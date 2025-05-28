import React from 'react';
import cx from 'classnames';
import type { Trade } from './OrderBook';

interface OrderBookLastPriceProps {
  lastTrade: Trade | null;
  prevPrice: number | null;
}

const getLastPriceStyle = (
  lastTrade: Trade | null,
  prevPrice: number | null
) => {
  if (!lastTrade || prevPrice === null) return '';
  if (lastTrade.price > prevPrice) return 'flash-size-up';
  if (lastTrade.price < prevPrice) return 'flash-size-down';
  return '';
};

const getArrow = (lastTrade: Trade | null, prevPrice: number | null) => {
  if (!lastTrade || prevPrice === null) return '';
  if (lastTrade.price > prevPrice) return '↑';
  if (lastTrade.price < prevPrice) return '↓';
  return '';
};

const OrderBookLastPrice: React.FC<OrderBookLastPriceProps> = ({
  lastTrade,
  prevPrice,
}) => {
  const price = lastTrade?.price ?? '-.--';
  const priceClass = cx(
    'last-price text-red-500',
    getLastPriceStyle(lastTrade, prevPrice)
  );
  const arrow = getArrow(lastTrade, prevPrice);

  return (
    <div className={priceClass}>
      <span>{price}</span>
      {arrow && <span style={{ marginLeft: 8 }}>{arrow}</span>}
    </div>
  );
};

export default OrderBookLastPrice;
