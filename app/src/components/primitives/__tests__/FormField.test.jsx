/**
 * FormField.test.jsx — AC-P0-C1
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormField } from '../FormField';

describe('FormField', () => {
  it('renders label text', () => {
    render(<FormField label="Amount" htmlFor="amount"><input id="amount" /></FormField>);
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('associates label with input via htmlFor', () => {
    render(
      <FormField label="Weight" htmlFor="weight">
        <input id="weight" type="number" />
      </FormField>
    );
    const label = screen.getByText('Weight');
    expect(label.tagName).toBe('LABEL');
    expect(label.getAttribute('for')).toBe('weight');
  });

  it('renders hint text when provided', () => {
    render(
      <FormField label="Name" htmlFor="name" hint="Enter your full name">
        <input id="name" />
      </FormField>
    );
    expect(screen.getByText('Enter your full name')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <FormField label="Test" htmlFor="test">
        <input id="test" data-testid="child-input" />
      </FormField>
    );
    expect(screen.getByTestId('child-input')).toBeInTheDocument();
  });

  it('applies form-group class', () => {
    const { container } = render(
      <FormField label="Test" htmlFor="test"><input id="test" /></FormField>
    );
    expect(container.querySelector('.form-group')).toBeTruthy();
  });
});
