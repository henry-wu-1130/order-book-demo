import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OrderBook, { type OrderBookData, type Trade } from '../OrderBook';

describe('OrderBook', () => {
  const emptyOrderBook: OrderBookData = { asks: [], bids: [] };
  const mockOrderBook: OrderBookData = {
    asks: [
      { price: 21699.0, size: 100, total: 100 },
      { price: 21700.0, size: 200, total: 300 },
    ],
    bids: [
      { price: 21617.0, size: 300, total: 300 },
      { price: 21616.0, size: 400, total: 700 },
    ],
  };
  const mockLastTrade: Trade = { price: 21700 };

  it('renders without crashing', () => {
    render(<OrderBook orderBook={emptyOrderBook} lastTrade={null} />);
    expect(screen.getByText('Order Book')).toBeInTheDocument();
  });

  it('displays the correct headers', () => {
    render(<OrderBook orderBook={emptyOrderBook} lastTrade={null} />);
    const header = screen.getByText('Price (USD)').parentElement;
    expect(header).toHaveClass('quote-header');
    expect(header).toHaveTextContent('Price (USD)');
    expect(header).toHaveTextContent('Size');
    expect(header).toHaveTextContent('Total');
  });

  it('shows empty state when no orders', () => {
    render(<OrderBook orderBook={emptyOrderBook} lastTrade={null} />);
    // No .quote-row should render
    expect(document.querySelectorAll('.quote-row').length).toBe(0);
    expect(screen.getByText('-.--')).toBeInTheDocument();
  });

  it('formats numbers correctly', () => {
    render(<OrderBook orderBook={mockOrderBook} lastTrade={mockLastTrade} />);
    expect(screen.getAllByText('21,699')).toHaveLength(1);
    expect(screen.getAllByText('100')).toHaveLength(2); // price and total
    expect(screen.getAllByText('21,617')).toHaveLength(1);
    expect(screen.getAllByText('300')).toHaveLength(3);
  });
});
