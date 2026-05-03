import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

describe('App — smoke', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it('shows the Health Tracker brand', () => {
    const { getByText } = render(<App />);
    expect(getByText(/Health Tracker/i)).toBeInTheDocument();
  });
});
