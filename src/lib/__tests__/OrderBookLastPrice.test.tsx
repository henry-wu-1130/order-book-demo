import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OrderBookLastPrice from '../components/OrderBookLastPrice';
import { type Trade } from '../types';

const STABLE_COUNT = 10;

describe('OrderBookLastPrice', () => {
  const mockTrade: Trade = {
    price: 21700,
    size: 100,
    side: 'bid',
    timestamp: Date.now(),
  };

  it('renders without crashing', () => {
    render(<OrderBookLastPrice lastTrade={null} prevPrice={null} />);
    expect(screen.getByText('-.--')).toBeInTheDocument();
  });

  it('displays placeholder when no trade', () => {
    render(<OrderBookLastPrice lastTrade={null} prevPrice={null} />);
    expect(screen.getByText('-.--')).toBeInTheDocument();
  });

  it('displays initial trade without direction', () => {
    render(<OrderBookLastPrice lastTrade={mockTrade} prevPrice={null} />);
    expect(screen.getByText('21,700.0')).toBeInTheDocument();
  });

  it('shows uptrend when price increases', () => {
    const prevPrice = 21650;
    render(
      <OrderBookLastPrice
        lastTrade={mockTrade}
        prevPrice={prevPrice}
        lastDirection="up"
        sameDirectionCount={1}
      />
    );
    expect(screen.getByText('21,700.0')).toBeInTheDocument();
    const priceElement = screen.getByTestId('last-price');
    const arrowIcon = screen.getByTestId('arrow-icon');
    expect(arrowIcon).toHaveClass('text-green-500');
    expect(priceElement).toHaveAttribute(
      'style',
      expect.stringContaining('color: var(--color-bid-price)')
    );
    expect(priceElement).toHaveAttribute(
      'style',
      expect.stringContaining('background-color: var(--color-flash-bid)')
    );
  });

  it('shows downtrend when price decreases', () => {
    const prevPrice = 21750;
    render(
      <OrderBookLastPrice
        lastTrade={mockTrade}
        prevPrice={prevPrice}
        lastDirection="down"
        sameDirectionCount={1}
      />
    );
    expect(screen.getByText('21,700.0')).toBeInTheDocument();
    const priceElement = screen.getByTestId('last-price');
    const arrowIcon = screen.getByTestId('arrow-icon');
    expect(arrowIcon).toHaveClass('text-red-500');
    expect(priceElement).toHaveAttribute(
      'style',
      expect.stringContaining('color: var(--color-ask-price)')
    );
    expect(priceElement).toHaveAttribute(
      'style',
      expect.stringContaining('background-color: var(--color-flash-ask)')
    );
  });

  it('maintains color when price is stable', () => {
    const prevPrice = 21700;
    render(
      <OrderBookLastPrice
        lastTrade={mockTrade}
        prevPrice={prevPrice}
        sameDirectionCount={STABLE_COUNT}
      />
    );
    expect(screen.getByText('21,700.0')).toBeInTheDocument();
    const priceElement = screen.getByTestId('last-price');
    expect(priceElement).toHaveAttribute(
      'style',
      expect.stringContaining('color: var(--color-text)')
    );
    expect(priceElement).toHaveAttribute(
      'style',
      expect.stringContaining('background-color: var(--color-stable-bg)')
    );
  });

  it('shows uptrend color just before becoming stable', () => {
    const prevPrice = 21650;
    render(
      <OrderBookLastPrice
        lastTrade={mockTrade}
        prevPrice={prevPrice}
        lastDirection="up"
        sameDirectionCount={STABLE_COUNT - 1}
      />
    );
    const priceElement = screen.getByTestId('last-price');
    const arrowIcon = screen.getByTestId('arrow-icon');
    expect(arrowIcon).toHaveClass('text-green-500');
    expect(priceElement).toHaveAttribute(
      'style',
      expect.stringContaining('color: var(--color-bid-price)')
    );
    expect(priceElement).toHaveAttribute(
      'style',
      expect.stringContaining('background-color: var(--color-flash-bid)')
    );
  });

  it('shows downtrend color just before becoming stable', () => {
    const prevPrice = 21750;
    render(
      <OrderBookLastPrice
        lastTrade={mockTrade}
        prevPrice={prevPrice}
        lastDirection="down"
        sameDirectionCount={STABLE_COUNT - 1}
      />
    );
    const priceElement = screen.getByTestId('last-price');
    const arrowIcon = screen.getByTestId('arrow-icon');
    expect(arrowIcon).toHaveClass('text-red-500');
    expect(priceElement).toHaveAttribute(
      'style',
      expect.stringContaining('color: var(--color-ask-price)')
    );
    expect(priceElement).toHaveAttribute(
      'style',
      expect.stringContaining('background-color: var(--color-flash-ask)')
    );
  });

  it('shows stable color when count exceeds threshold', () => {
    const prevPrice = 21700;
    render(
      <OrderBookLastPrice
        lastTrade={mockTrade}
        prevPrice={prevPrice}
        lastDirection="up"
        sameDirectionCount={STABLE_COUNT + 5}
      />
    );
    const priceElement = screen.getByTestId('last-price');
    expect(priceElement).toHaveAttribute(
      'style',
      expect.stringContaining('color: var(--color-text)')
    );
    expect(priceElement).toHaveAttribute(
      'style',
      expect.stringContaining('background-color: var(--color-stable-bg)')
    );
  });

  it('formats price correctly', () => {
    const tradeWithDecimal: Trade = {
      ...mockTrade,
      price: 21700.5678,
    };
    render(
      <OrderBookLastPrice lastTrade={tradeWithDecimal} prevPrice={null} />
    );
    expect(screen.getByText('21,700.6')).toBeInTheDocument();
  });
});
