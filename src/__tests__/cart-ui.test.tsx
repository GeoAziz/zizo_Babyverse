import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CartPage from '../app/cart/page';
import '@testing-library/jest-dom';

describe('CartPage Accessibility & UI', () => {
  it('renders cart page and all controls are accessible', async () => {
    render(<CartPage />);
    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    // Check for accessible promo input
    expect(screen.getByLabelText(/promo code/i)).toBeInTheDocument();
    // Check for accessible buttons
    expect(screen.getAllByRole('button', { name: /remove/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /increase/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /decrease/i })[0]).toBeInTheDocument();
  });

  it('removes last item and shows empty cart message', async () => {
    render(<CartPage />);
    // Simulate removing all items
    const removeButtons = await screen.findAllByRole('button', { name: /remove/i });
    for (const btn of removeButtons) {
      fireEvent.click(btn);
    }
    await waitFor(() => expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument());
  });

  it('shows error for invalid promo code', async () => {
    render(<CartPage />);
    const promoInput = screen.getByLabelText(/promo code/i);
    fireEvent.change(promoInput, { target: { value: 'INVALIDCODE' } });
    fireEvent.click(screen.getByRole('button', { name: /apply promo code/i }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/invalid promo/i));
  });

  it('supports keyboard navigation', async () => {
    render(<CartPage />);
    // Tab to first button
    fireEvent.keyDown(document, { key: 'Tab', code: 'Tab' });
    // Should focus on first interactive element
    expect(document.activeElement).toHaveAttribute('aria-label');
  });
});
