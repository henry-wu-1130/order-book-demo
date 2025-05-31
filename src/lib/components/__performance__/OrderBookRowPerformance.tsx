import { Profiler } from 'react';
import OrderBook from '../OrderBook';
import { type Order, type Trade } from '../../types';

export function OrderBookRowPerformance() {
  const mockOrderBook = {
    orderBook: {
      asks: [
        { price: 45000, size: 1.5, total: 1.5 },
        { price: 45100, size: 2.0, total: 3.5 },
      ] as Order[],
      bids: [
        { price: 44900, size: 1.0, total: 1.0 },
        { price: 44800, size: 2.5, total: 3.5 },
      ] as Order[],
    },
    lastTrade: {
      price: 45000,
      size: 1.5,
      side: 'bid',
      timestamp: Date.now(),
    } as Trade,
  };

  const handleRender = (
    id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
    // _interactions: Set<unknown>,
    // commitRoot?: boolean
  ) => {
    console.log({
      id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
    });
  };

  return (
    <div>
      <Profiler id="orderBook" onRender={handleRender}>
        <OrderBook {...mockOrderBook} />
      </Profiler>
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          Open Chrome DevTools Console to see detailed timing information.
        </p>
      </div>
    </div>
  );
}
