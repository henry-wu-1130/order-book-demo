import { useEffect, useRef } from 'react';
import { useOrderBook } from './hooks/useOrderBook';

interface OrderBookProps {
  initialData?: {
    bids: { price: number; size: number; total: number }[];
    asks: { price: number; size: number; total: number }[];
  };
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 8, // 可視需求調整小數位數
  }).format(num);
};

const OrderBook = ({ initialData }: OrderBookProps = {}) => {
  const { orderBook: liveOrderBook, lastTrade } = useOrderBook();
  const orderBook = initialData || liveOrderBook;
  const prevPrice = useRef<number | null>(null);

  useEffect(() => {
    if (lastTrade && prevPrice.current !== null) {
      // const priceChange = lastTrade.price - prevPrice.current;
      // const flashClass = priceChange > 0 ? 'flash-buy' : 'flash-sell';
      // const element = document.querySelector('.price-' + lastTrade.price);
      // if (element) {
      //   element.classList.add(flashClass);
      //   setTimeout(() => {
      //     element.classList.remove(flashClass);
      //   }, 500);
      // }
    }
    if (lastTrade) {
      prevPrice.current = lastTrade.price;
    }
  }, [lastTrade]);

  const getSpreadPercentage = (spread: number): string => {
    if (!orderBook.asks.length) return '-.--';
    return ((spread / orderBook.asks[0].price) * 100).toFixed(2);
  };

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
                <th>Price (USD)</th>
                <th>Size</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orderBook.asks.map((ask, index) => (
                <tr key={index}>
                  <td className="sell-price">{formatNumber(ask.price)}</td>
                  <td>{formatNumber(ask.size)}</td>
                  <td>{formatNumber(ask.total)}</td>
                  <div
                    className="total-bar absolute top-0 right-0 h-full z-0 bg-sell-total-bar"
                    style={{
                      width: `${
                        (ask.total /
                          Math.max(...orderBook.asks.map((a) => a.total))) *
                        100
                      }%`,
                    }}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="spread">
          <span>
            {lastTrade?.price ? `${formatNumber(lastTrade.price)}` : '-.--'}
          </span>
        </div>
        <div className="bids">
          <table className="quote-table buy-quote">
            <tbody>
              {orderBook.bids.map((bid, index) => (
                <tr key={index}>
                  <td className="buy-price">{formatNumber(bid.price)}</td>
                  <td>{formatNumber(bid.size)}</td>
                  <td>{formatNumber(bid.total)}</td>
                  <div
                    className="total-bar absolute top-0 right-0 h-full z-0 bg-buy-total-bar"
                    style={{
                      width: `${
                        (bid.total /
                          Math.max(...orderBook.bids.map((b) => b.total))) *
                        100
                      }%`,
                    }}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
