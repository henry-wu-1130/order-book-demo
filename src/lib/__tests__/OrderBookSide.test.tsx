import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OrderBookSide from '../components/OrderBookSide';
import { type Order } from '../types';

describe('OrderBookSide', () => {
  const mockOrders: Order[] = [
    { price: 21702.0, size: 300, total: 600 },
    { price: 21701.0, size: 200, total: 300 },
    { price: 21700.0, size: 100, total: 100 },
  ];

  it('renders without crashing', () => {
    render(
      <OrderBookSide
        orders={mockOrders}
        prevOrders={[]}
        side="bid"
        showHeader={true}
      />
    );
    expect(screen.getByText('Price (USD)')).toBeInTheDocument();
  });

  it('shows/hides header based on showHeader prop', () => {
    const { rerender } = render(
      <OrderBookSide
        orders={mockOrders}
        prevOrders={[]}
        side="bid"
        showHeader={true}
      />
    );
    expect(screen.getByText('Price (USD)')).toBeInTheDocument();

    rerender(
      <OrderBookSide
        orders={mockOrders}
        prevOrders={[]}
        side="bid"
        showHeader={false}
      />
    );
    expect(screen.queryByText('Price (USD)')).not.toBeInTheDocument();
  });

  it('renders correct number of order rows', () => {
    render(
      <OrderBookSide
        orders={mockOrders}
        prevOrders={[]}
        side="bid"
        showHeader={true}
      />
    );
    expect(document.querySelectorAll('.quote-row')).toHaveLength(3);
  });

  it('applies correct side class', () => {
    const { container } = render(
      <OrderBookSide
        orders={mockOrders}
        prevOrders={[]}
        side="bid"
        showHeader={true}
      />
    );
    expect(container.querySelector('.bid-quote')).toBeInTheDocument();

    const { container: container2 } = render(
      <OrderBookSide
        orders={mockOrders}
        prevOrders={[]}
        side="ask"
        showHeader={true}
      />
    );
    expect(container2.querySelector('.ask-quote')).toBeInTheDocument();
  });
});
