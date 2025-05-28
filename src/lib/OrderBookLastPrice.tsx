import React, { useState, useEffect } from 'react';
import cx from 'classnames';
import type { Trade } from './types';
import { formatPrice } from './helpers/utils';

interface OrderBookLastPriceProps {
  lastTrade: Trade | null;
  prevPrice: number | null;
}

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
  const [priceStyle, setPriceStyle] = useState('last-price-neutral');

  useEffect(() => {
    if (!lastTrade || prevPrice === null) {
      setPriceStyle('last-price-neutral');
      return;
    }

    if (lastTrade.price > prevPrice) {
      setPriceStyle('last-price-up');
    } else if (lastTrade.price < prevPrice) {
      setPriceStyle('last-price-down');
    } else {
      setPriceStyle('last-price-neutral');
    }
  }, [lastTrade, prevPrice]);

  const price = lastTrade ? formatPrice(lastTrade.price) : '-.--';
  const priceClass = cx('last-price', priceStyle);
  const arrow = getArrow(lastTrade, prevPrice);

  return (
    <div className={priceClass}>
      <span className="text-3xl">{price}</span>
      {arrow && <span className="text-xl" style={{ marginLeft: 8 }}>{arrow}</span>}
    </div>
  );
};

export default OrderBookLastPrice;
