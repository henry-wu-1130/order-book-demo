import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OrderBookRow from '../components/OrderBookRow';
import { type Order } from '../types';

describe('OrderBookRow', () => {
  const mockOrder: Order = {
    price: 21700.0,
    size: 100,
    total: 100,
  };

  const mockPrevOrder: Order = {
    price: 21700.0,
    size: 50,
    total: 50,
  };

  it('renders without crashing', () => {
    render(
      <OrderBookRow
        order={mockOrder}
        prevOrder={null}
        side="bid"
        maxTotal={100}
      />
    );
    expect(screen.getByText('21,700.0')).toBeInTheDocument();
    const sizeCells = screen.getAllByText('100');
    expect(sizeCells[0]).toBeInTheDocument();
  });

  it('formats numbers correctly', () => {
    const orderWithDecimals: Order = {
      price: 21700.5678,
      size: 1234.56,
      total: 5678.9,
    };
    render(
      <OrderBookRow
        order={orderWithDecimals}
        prevOrder={null}
        side="bid"
        maxTotal={6000}
      />
    );
    expect(screen.getByText('21,700.6')).toBeInTheDocument();
    const sizeCell = screen.getByText('1,234.56');
    expect(sizeCell).toBeInTheDocument();
    expect(screen.getByText('5,678.9')).toBeInTheDocument();
  });

  it('shows bid side styles', () => {
    render(
      <OrderBookRow
        order={mockOrder}
        prevOrder={null}
        side="bid"
        maxTotal={100}
      />
    );
    const priceElement = screen.getByText('21,700.0');
    expect(priceElement).toHaveClass('bid-price');
    const row = priceElement.closest('.quote-row');
    expect(row).toContainElement(document.querySelector('.bid-total-bar'));
  });

  it('shows ask side styles', () => {
    render(
      <OrderBookRow
        order={mockOrder}
        prevOrder={null}
        side="ask"
        maxTotal={100}
      />
    );
    const priceElement = screen.getByText('21,700.0');
    expect(priceElement).toHaveClass('ask-price');
    const row = priceElement.closest('.quote-row');
    expect(row).toContainElement(document.querySelector('.ask-total-bar'));
  });

  it('shows size increase animation', () => {
    render(
      <OrderBookRow
        order={mockOrder}
        prevOrder={mockPrevOrder}
        side="bid"
        maxTotal={100}
      />
    );
    const sizeCell = screen.getAllByText('100')[0];
    expect(sizeCell).toHaveStyle({
      animation: 'flash-size-up 0.5s ease-in-out',
    });
  });

  it('shows size decrease animation', () => {
    render(
      <OrderBookRow
        order={mockPrevOrder}
        prevOrder={mockOrder}
        side="bid"
        maxTotal={100}
      />
    );
    const sizeCell = screen.getAllByText('50')[0];
    expect(sizeCell).toHaveStyle({
      animation: 'flash-size-down 0.5s ease-in-out',
    });
  });

  it('calculates total bar width correctly', () => {
    render(
      <OrderBookRow
        order={mockOrder}
        prevOrder={null}
        side="bid"
        maxTotal={200}
      />
    );
    const totalBar = document.querySelector('.bid-total-bar');
    expect(totalBar).toHaveStyle({ width: '50%' });
  });

  it('handles zero maxTotal', () => {
    render(
      <OrderBookRow
        order={mockOrder}
        prevOrder={null}
        side="bid"
        maxTotal={0}
      />
    );
    const totalBar = document.querySelector('.bid-total-bar');
    expect(totalBar).toHaveStyle({ width: '0%' });
  });
});
