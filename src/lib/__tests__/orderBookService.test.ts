import { describe, it, expect, beforeEach } from 'vitest';
import { OrderBookService } from '../services/OrderBookService';

import type { OrderBookData, OrderBookUpdate } from '../services/OrderBookService';

interface OrderMessage extends OrderBookUpdate {
  data: {
    type: 'snapshot' | 'delta';
    seqNum: number;
    bids: [number, number][];
    asks: [number, number][];
  };
}

function createSnapshotMessage({ bids, asks, seqNum }: {
  bids: [number, number][];
  asks: [number, number][];
  seqNum: number;
}): OrderMessage {
  return {
    data: {
      type: 'snapshot',
      seqNum,
      bids,
      asks,
    },
    seqNum,
    timestamp: Date.now(),
  };
}

function createDeltaMessage({ bids, asks, seqNum }: {
  bids: [number, number][];
  asks: [number, number][];
  seqNum: number;
}): OrderMessage {
  return {
    data: {
      type: 'delta',
      seqNum,
      bids,
      asks,
    },
    seqNum,
    timestamp: Date.now(),
  };
}

describe('OrderBookService', () => {
  let service: OrderBookService;
  let updates: Array<OrderBookData>;


  beforeEach(() => {
    service = new OrderBookService();
    updates = [];
    service.onUpdate((orderBook) => {
      updates.push(orderBook);
    });
  });

  it('should process snapshot and notify update', () => {
    const msg = createSnapshotMessage({
      seqNum: 1,
      bids: [
        [100, 2],
        [99, 1],
      ],
      asks: [
        [101, 3],
        [102, 4],
      ],
    });

    service['handleMessage'](msg);
    expect(updates.length).toBe(1);
    expect(updates[0].bids[0]).toMatchObject({ price: 100, size: 2 });
    expect(updates[0].asks[0]).toMatchObject({ price: 102, size: 4 });
  });

  it('should process delta and update order book', () => {
    // Initial snapshot
    service['handleMessage'](
      createSnapshotMessage({
        seqNum: 1,
        bids: [
          [100, 2],
          [99, 1],
        ],
        asks: [
          [101, 3],
          [102, 4],
        ],
      })
    );
    updates.length = 0;
    // Delta update: update size, add new, remove
    service['handleMessage'](
      createDeltaMessage({
        seqNum: 2,
        bids: [
          [100, 3],
          [98, 2],
          [99, 0],
        ], // update 100, add 98, remove 99
        asks: [
          [101, 1],
          [103, 2],
          [102, 0],
        ], // update 101, add 103, remove 102
      })
    );
    expect(updates.length).toBe(1);
    const orderBook = updates[0];
    expect(orderBook.bids.some((b: { price: number }) => b.price === 99)).toBe(false);
    expect(orderBook.bids.find((b: { price: number; size: number }) => b.price === 100)?.size).toBe(3);
    expect(orderBook.bids.find((b: { price: number; size: number }) => b.price === 98)?.size).toBe(2);
    expect(orderBook.asks.some((a: { price: number }) => a.price === 102)).toBe(false);
    expect(orderBook.asks.find((a: { price: number; size: number }) => a.price === 101)?.size).toBe(1);
    expect(orderBook.asks.find((a: { price: number; size: number }) => a.price === 103)?.size).toBe(2);
  });

  it('should ignore delta with wrong seqNum', () => {
    service['handleMessage'](
      createSnapshotMessage({
        seqNum: 1,
        bids: [[100, 2]],
        asks: [[101, 3]],
      })
    );
    updates.length = 0;
    // This delta has seqNum 3 but lastSeqNum is 1, should trigger resubscribe logic (but we skip it in test)
    service['handleMessage'](
      createDeltaMessage({
        seqNum: 3,
        bids: [[100, 3]],
        asks: [[101, 1]],
      })
    );
    expect(updates.length).toBe(0);
  });
});
