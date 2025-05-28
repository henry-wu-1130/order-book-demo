import { useState, useEffect } from 'react';
import {
  OrderBookService,
  type OrderBookData,
} from '../services/orderBookService';
import { TradeService, type Trade } from '../services/tradeService';

// Singleton instances to ensure only one connection per service
const orderBookService = new OrderBookService();
const tradeService = new TradeService();

export const useOrderBook = () => {
  const [orderBook, setOrderBook] = useState<OrderBookData>({
    bids: [],
    asks: [],
  });
  const [lastTrade, setLastTrade] = useState<Trade | null>(null);

  useEffect(() => {
    orderBookService.onUpdate(setOrderBook);
    tradeService.onTrade(setLastTrade);

    // Do not close here; let the app manage lifecycle if needed
  }, []);

  return {
    orderBook,
    lastTrade,
  };
};
