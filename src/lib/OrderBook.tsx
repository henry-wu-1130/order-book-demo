import { useEffect, useRef } from 'react';
import { useOrderBook } from './hooks/useOrderBook';
import cx from 'classnames';

interface OrderBookProps {
  initialData?: {
    bids: { price: number; size: number; total: number }[];
    asks: { price: number; size: number; total: number }[];
  };
}

interface Trade {
  price: number;
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 8, // 可視需求調整小數位數
  }).format(num);
};

function getPriceTrend(lastTrade: Trade | null, prevPrice: number | null) {
  if (!lastTrade || prevPrice === null) return { isUp: false, isDown: false };
  return {
    isUp: lastTrade.price > prevPrice,
    isDown: lastTrade.price < prevPrice,
  };
}

const getLastPriceStyle = (
  lastTrade: Trade | null,
  prevPrice: number | null
) => {
  if (!lastTrade?.price || prevPrice === null) {
    return {
      color: '#F0F4F8',
      transition: 'background 0.3s, color 0.3s',
    };
  }
  if (lastTrade.price > prevPrice) {
    return {
      color: '#00b15d',
      transition: 'background 0.3s, color 0.3s',
    };
  }
  if (lastTrade.price < prevPrice) {
    return {
      color: '#FF5B5A',
      transition: 'background 0.3s, color 0.3s',
    };
  }
  return {
    color: '#F0F4F8',
    transition: 'background 0.3s, color 0.3s',
  };
};

const getArrowStyle = (lastTrade: Trade | null, prevPrice: number | null) => {
  if (!lastTrade?.price || prevPrice === null)
    return {
      transition: 'transform 0.3s',
      width: 20,
      height: 20,
    };
  if (lastTrade.price < prevPrice) {
    return {
      transform: 'rotate(180deg)',
      transition: 'transform 0.3s',
      width: 20,
      height: 20,
    };
  }
  return {
    transform: 'rotate(0deg)',
    transition: 'transform 0.3s',
    width: 20,
    height: 20,
  };
};

const OrderBook = ({ initialData }: OrderBookProps = {}) => {
  const { orderBook: liveOrderBook, lastTrade } = useOrderBook();
  const orderBook = initialData || liveOrderBook;
  const prevPrice = useRef<number | null>(null);
  // --- highlight animation state ---
  const prevAsksRef = useRef<{ price: number; size: number }[]>([]);
  const prevBidsRef = useRef<{ price: number; size: number }[]>([]);

  // 每次 lastTrade 變動時，更新 prevPrice.current
  useEffect(() => {
    if (lastTrade && typeof lastTrade.price === 'number') {
      prevPrice.current = lastTrade.price;
    }
  }, [lastTrade]);

  // 更新 prevAsks/prevBids，每次 orderBook 變動時
  useEffect(() => {
    prevAsksRef.current = orderBook.asks.map((a) => ({
      price: a.price,
      size: a.size,
    }));
    prevBidsRef.current = orderBook.bids.map((b) => ({
      price: b.price,
      size: b.size,
    }));
  }, [orderBook]);

  const lastPriceStyle = getLastPriceStyle(lastTrade, prevPrice.current);
  const arrowStyle = getArrowStyle(lastTrade, prevPrice.current);

  return (
    <div className="order-book">
      <div className="header">
        <h2>Order Book</h2>
      </div>
      <div className="content">
        <div className="asks">
          <table className="quote-table sell-quote">
            <thead>
              <tr>
                <th style={{ width: '33.33%' }}>Price (USD)</th>
                <th style={{ width: '33.33%' }}>Size</th>
                <th style={{ width: '33.33%' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {orderBook.asks.map((ask) => {
                const prevAsks = prevAsksRef.current || [];
                const prevAsk = prevAsks.find((a) => a.price === ask.price);

                const { isUp: isPriceUp, isDown: isPriceDown } = getPriceTrend(
                  lastTrade,
                  prevPrice.current
                );

                const maxTotal = Math.max(
                  ...orderBook.asks.map((a) => a.total)
                );
                const barWidthPercent = (ask.total / maxTotal) * 100;

                return (
                  <tr
                    key={ask.price}
                    className={cx({
                      'price-up': isPriceUp,
                      'price-down': isPriceDown,
                      'flash-row-sell': !prevAsk,
                    })}
                  >
                    <td
                      className={cx('sell-price', {
                        'price-up': isPriceUp,
                        'price-down': isPriceDown,
                      })}
                    >
                      {formatNumber(ask.price)}
                    </td>
                    <td
                      className={cx({
                        'size-up': isPriceUp,
                        'size-down': isPriceDown,
                      })}
                    >
                      {formatNumber(ask.size)}
                    </td>
                    <td style={{ position: 'relative' }}>
                      <div
                        className={cx(
                          'total-bar absolute top-0 right-0 h-full z-0 bg-sell-total-bar'
                        )}
                        style={{
                          width: `${barWidthPercent}%`,
                          height: '100%',
                          top: 0,
                          right: 0,
                          zIndex: 0,
                        }}
                      />
                      <span
                        className={cx({
                          'total-up': isPriceUp,
                          'total-down': isPriceDown,
                          'flash-size-up': prevAsk && ask.size > prevAsk.size,
                          'flash-size-down': prevAsk && ask.size < prevAsk.size,
                        })}
                      >
                        {formatNumber(ask.total)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div
          className={cx('spread', {
            'flash-size-up':
              prevPrice.current && lastTrade?.price > prevPrice.current,
            'flash-size-down':
              prevPrice.current && lastTrade?.price < prevPrice.current,
          })}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={lastPriceStyle}>
            {lastTrade?.price ? `${formatNumber(lastTrade.price)}` : '-.--'}
          </span>
          <span style={arrowStyle}>
            <img
              src="/IconArrowDown.svg"
              alt="Arrow"
              style={(() => {
                if (!lastTrade?.price || prevPrice.current === null)
                  return {
                    transition: 'transform 0.3s',
                    width: 20,
                    height: 20,
                  };
                if (lastTrade.price < prevPrice.current) {
                  return {
                    transform: 'rotate(180deg)',
                    transition: 'transform 0.3s',
                    width: 20,
                    height: 20,
                  };
                }
                return {
                  transform: 'rotate(0deg)',
                  transition: 'transform 0.3s',
                  width: 20,
                  height: 20,
                };
              })()}
            />
          </span>
        </div>
        <div className="bids">
          <table className="quote-table buy-quote">
            <tbody>
              {orderBook.bids.map((bid) => {
                const prevBids = prevBidsRef.current || [];
                const prevBid = prevBids.find((b) => b.price === bid.price);

                const rowClass = cx({
                  'flash-row-buy': !prevBid,
                });

                const barWidthPercent =
                  (bid.total /
                    Math.max(...orderBook.bids.map((b) => b.total))) *
                  100;

                return (
                  <tr key={bid.price} className={rowClass}>
                    <td className="buy-price">{formatNumber(bid.price)}</td>
                    <td>{formatNumber(bid.size)}</td>
                    <td style={{ position: 'relative' }}>
                      <div
                        className={cx(
                          'total-bar absolute top-0 right-0 h-full z-0 bg-buy-total-bar',
                          {
                            'flash-size-up': prevBid && bid.size > prevBid.size,
                            'flash-size-down':
                              prevBid && bid.size < prevBid.size,
                          }
                        )}
                        style={{
                          width: `${barWidthPercent}%`,
                          height: '100%',
                          top: 0,
                          right: 0,
                          zIndex: 0,
                        }}
                      />
                      <span style={{ position: 'relative', zIndex: 1 }}>
                        {formatNumber(bid.total)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
