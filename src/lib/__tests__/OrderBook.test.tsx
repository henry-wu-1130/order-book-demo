import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OrderBook from '../OrderBook';

describe('OrderBook', () => {
  it('renders without crashing', () => {
    render(<OrderBook />);
    expect(screen.getByText('Order Book')).toBeInTheDocument();
  });

  it('displays the correct table headers', () => {
    render(<OrderBook />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(6); // 2 tables * 3 columns
    
    const expectedHeaders = ['Price (USD)', 'Size', 'Total'];
    headers.forEach((header, index) => {
      expect(header).toHaveTextContent(expectedHeaders[index % 3]);
    });
  });

  it('shows empty state when no orders', () => {
    render(<OrderBook />);
    const tables = screen.getAllByRole('table');
    expect(tables).toHaveLength(2);
    
    tables.forEach((table) => {
      const rows = table.querySelectorAll('tbody tr');
      expect(rows.length).toBe(0);
    });
    
    expect(screen.getByText('-.-- ↑')).toBeInTheDocument();
  });

  it('formats numbers correctly', () => {
    const mockOrderBook = {
      asks: [{ price: 21699.0, size: 3691, total: 0 }],
      bids: [{ price: 21617.0, size: 1177, total: 0 }]
    }
    render(<OrderBook initialData={mockOrderBook} />)

    expect(screen.getAllByText('21,699.0')).toHaveLength(1)
    expect(screen.getAllByText('3,691.0')).toHaveLength(2) // Size and Total
    expect(screen.getAllByText('21,617.0')).toHaveLength(1)
    expect(screen.getAllByText('1,177.0')).toHaveLength(2) // Size and Total
  });

  it('calculates spread correctly', () => {
    const mockOrderBook = {
      asks: [{ price: 21699.0, size: 3691, total: 0 }],
      bids: [{ price: 21617.0, size: 1177, total: 0 }]
    };
    render(<OrderBook initialData={mockOrderBook} />);

    expect(screen.getByText('82.0 ↑')).toBeInTheDocument();
  });

  it('calculates running totals correctly', () => {
    const mockOrderBook = {
      asks: [
        { price: 21699.0, size: 100, total: 0 },
        { price: 21700.0, size: 200, total: 0 }
      ],
      bids: [
        { price: 21617.0, size: 300, total: 0 },
        { price: 21616.0, size: 400, total: 0 }
      ]
    }
    render(<OrderBook initialData={mockOrderBook} />)

    // Check running totals
    const askRows = screen.getAllByRole('row').slice(1, 3) // Skip header row
    const bidRows = screen.getAllByRole('row').slice(4) // Skip header row and spread

    // Check asks running totals
    expect(askRows[0].children[2]).toHaveTextContent('100.0') // First ask total
    expect(askRows[1].children[2]).toHaveTextContent('300.0') // Second ask total

    // Check bids running totals
    expect(bidRows[0].children[2]).toHaveTextContent('300.0') // First bid total
    expect(bidRows[1].children[2]).toHaveTextContent('700.0') // Second bid total
  });
});
