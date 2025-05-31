import { type FC, useMemo } from 'react';
import cx from 'classnames';
import type { Trade } from '../types';
import { formatPrice } from '../helpers/utils';

const ArrowIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);

interface OrderBookLastPriceProps {
  lastTrade: Trade | null;
  prevPrice: number | null;
  sameDirectionCount?: number;
  lastDirection?: 'up' | 'down' | null;
}

const STABLE_COUNT = 10; // 連續相同方向的次數閾值

const OrderBookLastPrice: FC<OrderBookLastPriceProps> = ({
  lastTrade,
  prevPrice,
  sameDirectionCount = 0,
  lastDirection = null,
}) => {
  const price = lastTrade ? formatPrice(lastTrade.price) : '-.--';

  const isStable =
    !lastTrade ||
    prevPrice === null ||
    sameDirectionCount >= STABLE_COUNT ||
    lastDirection === null;

  const priceClass = useMemo(() => cx(
    'flex items-center justify-center last-price transition-colors text-2xl',
    {
      'text-neutral bg-stable': isStable,
      'text-bid bg-flash-bid':
        lastDirection === 'up' && sameDirectionCount < STABLE_COUNT,
      'text-ask bg-flash-ask':
        lastDirection === 'down' && sameDirectionCount < STABLE_COUNT,
    }
  ), [isStable, lastDirection, sameDirectionCount]);

  const arrowClass = cx('w-5 h-5 transition-transform', {
    'text-neutral':
      !lastTrade || prevPrice === null || sameDirectionCount >= STABLE_COUNT,
    'text-bid rotate-180':
      lastDirection === 'up' && sameDirectionCount < STABLE_COUNT,
    'text-ask rotate-0':
      lastDirection === 'down' && sameDirectionCount < STABLE_COUNT,
  });

  return (
    <div data-testid="last-price" className={priceClass}>
      <span>{price}</span>
      {!isStable && (
        <span className="ml-2 flex items-center">
          <ArrowIcon data-testid="arrow-icon" className={arrowClass} />
        </span>
      )}
    </div>
  );
};

export default OrderBookLastPrice;
