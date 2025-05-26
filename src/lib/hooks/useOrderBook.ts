import { useState, useEffect } from 'react';
import {
  OrderBookService,
  type OrderBookData,
} from '../services/OrderBookService';
import { TradeService, type Trade } from '../services/TradeService';

export const useOrderBook = () => {
  const [orderBook, setOrderBook] = useState<OrderBookData>({
    bids: [],
    asks: [],
  });
  const [lastTrade, setLastTrade] = useState<Trade | null>(null);

  useEffect(() => {
    const orderBookService = new OrderBookService();
    const tradeService = new TradeService();

    const setup = async () => {
      try {
        orderBookService.onUpdate((data) => {
          console.log(data);

          setOrderBook(data);
        });

        const tradeCallback = (trade: Trade) => {
          setLastTrade(trade);
        };

        await tradeService.onTrade(tradeCallback);
      } catch (error) {
        console.error('Error setting up services:', error);
      }
    };

    setup();

    return () => {
      orderBookService.close();
      //tradeService.close();
    };
  }, []);

  return {
    orderBook,
    lastTrade,
  };
};
