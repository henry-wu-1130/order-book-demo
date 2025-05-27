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
    expect(headers).toHaveLength(3); // Only one table is rendered in test

    const expectedHeaders = ['Price (USD)', 'Size', 'Total'];
    headers.forEach((header, index) => {
      expect(header).toHaveTextContent(expectedHeaders[index]);
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
    
    // Now only '-.--' is shown, no arrow character
    expect(screen.getByText('-.--')).toBeInTheDocument();
  });

  it('formats numbers correctly', () => {
    const mockOrderBook = {
      asks: [{ price: 21699.0, size: 3691, total: 3691 }],
      bids: [{ price: 21617.0, size: 1177, total: 1177 }]
    }
    render(<OrderBook initialData={mockOrderBook} />)

    expect(screen.getAllByText('21,699')).toHaveLength(1)
    expect(screen.getAllByText('3,691')).toHaveLength(2) // Size and Total
    expect(screen.getAllByText('21,617')).toHaveLength(1)
    expect(screen.getAllByText('1,177')).toHaveLength(2) // Size and Total
  });


  it('calculates running totals correctly', () => {
    const mockOrderBook = {
      asks: [
        { price: 21699.0, size: 100, total: 100 },
        { price: 21700.0, size: 200, total: 300 }
      ],
      bids: [
        { price: 21617.0, size: 300, total: 300 },
        { price: 21616.0, size: 400, total: 700 }
      ]
    }
    render(<OrderBook initialData={mockOrderBook} />)

    // Check running totals
    // Get all tbody elements: [asksTbody, bidsTbody]
    const tbodies = document.querySelectorAll('tbody');
    const askRows = Array.from(tbodies[0].querySelectorAll('tr'));
    const bidRows = Array.from(tbodies[1].querySelectorAll('tr'));

    // Check asks running totals
    expect(askRows[0].children[2].textContent).toContain('100'); // First ask total
    expect(askRows[1].children[2].textContent).toContain('300'); // Second ask total

    // Check bids running totals
    expect(bidRows[0].children[2].textContent).toContain('300'); // First bid total
    expect(bidRows[1].children[2].textContent).toContain('700'); // Second bid total
  });
});
