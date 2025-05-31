import { useOrderBook } from '../hooks/useOrderBook';
import OrderBook from '../components/OrderBook';

function OrderBookContainer() {
  const { orderBook, lastTrade } = useOrderBook();

  return <OrderBook orderBook={orderBook} lastTrade={lastTrade} />;
}

export default OrderBookContainer;
