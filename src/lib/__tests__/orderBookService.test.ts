import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  OrderBookService,
  type OrderBookUpdate,
} from '../services/orderBookService';

function createSnapshotMessage({ bids, asks, seqNum }) {
  return {
    data: {
      type: 'snapshot',
      seqNum,
      bids,
      asks,
    },
  };
}

function createDeltaMessage({ bids, asks, seqNum }) {
  return {
    data: {
      type: 'delta',
      seqNum,
      bids,
      asks,
    },
  };
}

describe('OrderBookService', () => {
  let service: OrderBookService;
  let updates: any[];

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

    service['handleMessage'](msg as any);
    expect(updates.length).toBe(1);
    expect(updates[0].bids[0]).toMatchObject({ price: 99, size: 1 });
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
      }) as any
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
      }) as any
    );
    expect(updates.length).toBe(1);
    const orderBook = updates[0];
    expect(orderBook.bids.some((b) => b.price === 99)).toBe(false);
    expect(orderBook.bids.find((b) => b.price === 100)?.size).toBe(3);
    expect(orderBook.bids.find((b) => b.price === 98)?.size).toBe(2);
    expect(orderBook.asks.some((a) => a.price === 102)).toBe(false);
    expect(orderBook.asks.find((a) => a.price === 101)?.size).toBe(1);
    expect(orderBook.asks.find((a) => a.price === 103)?.size).toBe(2);
  });

  it('should ignore delta with wrong seqNum', () => {
    service['handleMessage'](
      createSnapshotMessage({
        seqNum: 1,
        bids: [[100, 2]],
        asks: [[101, 3]],
      }) as any
    );
    updates.length = 0;
    // This delta has seqNum 3 but lastSeqNum is 1, should trigger resubscribe logic (but we skip it in test)
    service['handleMessage'](
      createDeltaMessage({
        seqNum: 3,
        bids: [[100, 3]],
        asks: [[101, 1]],
      }) as any
    );
    expect(updates.length).toBe(0);
  });
});
