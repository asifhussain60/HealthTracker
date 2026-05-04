/**
 * form.test.jsx — B3 RED: TextField / Switch / Checkbox / Radio / Slider
 * AC-P1B-FORM
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { expect as vitestExpect } from 'vitest';
vitestExpect.extend(toHaveNoViolations);

import { TextField } from '../TextField';
import { Switch } from '../Switch';
import { Checkbox } from '../Checkbox';
import { RadioGroup } from '../RadioGroup';
import { Slider } from '../Slider';

/* ─── TextField ─────────────────────────────────────────────────────────── */
describe('TextField (B3)', () => {
  it('renders text variant', () => {
    const { container } = render(<TextField label="Name" variant="text" />);
    expect(container.querySelector('.md3-text-field')).toBeTruthy();
  });

  it('renders numeric variant', () => {
    const { container } = render(<TextField label="Weight" variant="numeric" />);
    expect(container.querySelector('input[type="number"]')).toBeTruthy();
  });

  it('renders time variant', () => {
    const { container } = render(<TextField label="Time" variant="time" />);
    expect(container.querySelector('input[type="time"]')).toBeTruthy();
  });

  it('renders date variant', () => {
    const { container } = render(<TextField label="Date" variant="date" />);
    expect(container.querySelector('input[type="date"]')).toBeTruthy();
  });

  it('shows label', () => {
    render(<TextField label="Full Name" variant="text" id="fn" />);
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
  });

  it('shows helper text', () => {
    render(<TextField label="Email" variant="text" id="em" helperText="We'll never share your email" />);
    expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
  });

  it('shows error state', () => {
    const { container } = render(
      <TextField label="Email" variant="text" id="em2" error errorText="Invalid email" />
    );
    expect(container.querySelector('.md3-text-field--error')).toBeTruthy();
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('renders leading icon slot', () => {
    render(
      <TextField label="Search" variant="text" id="srch"
        leadingIcon={<span data-testid="lead-icon">🔍</span>} />
    );
    expect(screen.getByTestId('lead-icon')).toBeInTheDocument();
  });

  it('renders trailing icon slot', () => {
    render(
      <TextField label="Password" variant="text" id="pw"
        trailingIcon={<span data-testid="trail-icon">👁</span>} />
    );
    expect(screen.getByTestId('trail-icon')).toBeInTheDocument();
  });

  it('fires onChange', () => {
    const onChange = vi.fn();
    render(<TextField label="Name" variant="text" id="nm" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Alice' } });
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('is accessible — text (axe)', async () => {
    const { container } = render(<TextField label="Username" variant="text" id="user" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── Switch ────────────────────────────────────────────────────────────── */
describe('Switch (B3)', () => {
  it('renders with label', () => {
    render(<Switch label="Dark mode" id="dm" />);
    expect(screen.getByLabelText('Dark mode')).toBeInTheDocument();
  });

  it('checked when checked prop is true', () => {
    render(<Switch label="On" id="on" checked onChange={() => {}} />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('unchecked by default', () => {
    render(<Switch label="Off" id="off" onChange={() => {}} />);
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('fires onChange on click', () => {
    const onChange = vi.fn();
    render(<Switch label="Toggle" id="tog" onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('is accessible (axe)', async () => {
    const { container } = render(<Switch label="Notifications" id="notif" onChange={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── Checkbox ──────────────────────────────────────────────────────────── */
describe('Checkbox (B3)', () => {
  it('renders unchecked by default', () => {
    render(<Checkbox label="Accept terms" id="terms" onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('renders checked state', () => {
    render(<Checkbox label="Accept" id="acc" checked onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('renders indeterminate state', () => {
    render(<Checkbox label="Select all" id="all" indeterminate onChange={() => {}} />);
    const cb = screen.getByRole('checkbox');
    expect(cb).toHaveAttribute('data-indeterminate', 'true');
  });

  it('fires onChange', () => {
    const onChange = vi.fn();
    render(<Checkbox label="Check" id="chk" onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('is accessible (axe)', async () => {
    const { container } = render(<Checkbox label="I agree" id="agree" onChange={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── RadioGroup ────────────────────────────────────────────────────────── */
describe('RadioGroup (B3)', () => {
  const options = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
    { value: 'c', label: 'Option C' },
  ];

  it('renders all options', () => {
    render(<RadioGroup name="test" options={options} value="a" onChange={() => {}} />);
    expect(screen.getByLabelText('Option A')).toBeInTheDocument();
    expect(screen.getByLabelText('Option B')).toBeInTheDocument();
    expect(screen.getByLabelText('Option C')).toBeInTheDocument();
  });

  it('selected option is checked', () => {
    render(<RadioGroup name="test" options={options} value="b" onChange={() => {}} />);
    expect(screen.getByLabelText('Option B')).toBeChecked();
    expect(screen.getByLabelText('Option A')).not.toBeChecked();
  });

  it('fires onChange with correct value', () => {
    const onChange = vi.fn();
    render(<RadioGroup name="sel" options={options} value="a" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Option C'));
    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('is accessible (axe)', async () => {
    const { container } = render(
      <RadioGroup name="radio-axe" options={options} value="a" onChange={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── Slider ────────────────────────────────────────────────────────────── */
describe('Slider (B3)', () => {
  it('renders with min/max', () => {
    render(<Slider label="Volume" id="vol" min={0} max={100} value={50} onChange={() => {}} />);
    const input = screen.getByRole('slider');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
  });

  it('renders with step', () => {
    render(<Slider label="Step" id="stp" min={0} max={10} step={2} value={4} onChange={() => {}} />);
    expect(screen.getByRole('slider')).toHaveAttribute('step', '2');
  });

  it('renders current value', () => {
    render(<Slider label="Val" id="val" min={0} max={100} value={72} onChange={() => {}} />);
    expect(screen.getByRole('slider')).toHaveValue('72');
  });

  it('fires onChange', () => {
    const onChange = vi.fn();
    render(<Slider label="Dose" id="dose" min={0} max={100} value={50} onChange={onChange} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '75' } });
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('is accessible (axe)', async () => {
    const { container } = render(
      <Slider label="Accessible slider" id="axe-slider" min={0} max={100} value={50} onChange={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
