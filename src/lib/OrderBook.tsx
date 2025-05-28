import { useEffect, useRef } from 'react';
import cx from 'classnames';

export interface OrderBookData {
  bids: { price: number; size: number; total: number }[];
  asks: { price: number; size: number; total: number }[];
}

export interface Trade {
  price: number;
}

interface OrderBookProps {
  orderBook: OrderBookData;
  lastTrade: Trade | null;
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

const OrderBook = ({ orderBook, lastTrade }: OrderBookProps) => {
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

                const maxTotal =
                  orderBook.asks[orderBook.asks.length - 1].total;

                const barWidthPercent =
                  maxTotal > 0 ? (ask.total / maxTotal) * 100 : 0;

                return (
                  <tr
                    key={ask.price}
                    className={cx({
                      'price-up': isPriceUp,
                      'price-down': isPriceDown,
                      'flash-row-sell': !prevAsk,
                    })}
                    style={{ position: 'relative' }}
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
                    <td>
                      <div
                        className="sell-total-bar"
                        style={{
                          position: 'absolute',
                          width: `${barWidthPercent}%`,
                          height: '100%',
                          top: 0,
                          right: 0,
                          zIndex: 0,
                        }}
                      />
                      {formatNumber(ask.total)}
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

                const maxTotal =
                  orderBook.bids[orderBook.bids.length - 1].total;
                const barWidthPercent =
                  maxTotal > 0 ? (bid.total / maxTotal) * 100 : 0;

                return (
                  <tr
                    key={bid.price}
                    className={rowClass}
                    style={{ position: 'relative' }}
                  >
                    <td className="buy-price">{formatNumber(bid.price)}</td>
                    <td>{formatNumber(bid.size)}</td>
                    <td>
                      <div
                        className="buy-total-bar"
                        style={{
                          position: 'absolute',
                          width: `${barWidthPercent}%`,
                          height: '100%',
                          top: 0,
                          right: 0,
                          zIndex: 0,
                        }}
                      />
                      {formatNumber(bid.total)}
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
