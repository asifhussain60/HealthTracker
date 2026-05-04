/**
 * AccordionPanel.test.jsx — B8 RED: AccordionPanel + AccordionGroup
 * AC-P1B-ACCORDION
 *
 * PF-10 invariant: at most ONE panel expanded at any time inside AccordionGroup.
 * Test fixture: 3 panels. Click A → only A open. Click B → A collapses, B opens.
 * Click B again → B collapses (all closed). At no point are 2+ open simultaneously.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { expect as vitestExpect } from 'vitest';
vitestExpect.extend(toHaveNoViolations);

import { AccordionPanel } from '../AccordionPanel';
import { AccordionGroup } from '../AccordionGroup';

/* ─── AccordionPanel (controlled) ──────────────────────────────────────── */
describe('AccordionPanel — controlled (B8)', () => {
  it('renders the title', () => {
    render(
      <AccordionPanel id="p1" title="Section A" expanded={false} onToggle={() => {}}>
        Content A
      </AccordionPanel>
    );
    expect(screen.getByText('Section A')).toBeInTheDocument();
  });

  it('is collapsed when expanded=false', () => {
    const { container } = render(
      <AccordionPanel id="p1" title="A" expanded={false} onToggle={() => {}}>
        Content
      </AccordionPanel>
    );
    expect(container.querySelector('[aria-expanded="false"]')).toBeTruthy();
  });

  it('is expanded when expanded=true', () => {
    const { container } = render(
      <AccordionPanel id="p1" title="A" expanded onToggle={() => {}}>
        Content
      </AccordionPanel>
    );
    expect(container.querySelector('[aria-expanded="true"]')).toBeTruthy();
  });

  it('shows content when expanded', () => {
    render(
      <AccordionPanel id="p1" title="A" expanded onToggle={() => {}}>
        <p data-testid="body">Panel body</p>
      </AccordionPanel>
    );
    expect(screen.getByTestId('body')).toBeInTheDocument();
  });

  it('calls onToggle with panel id when header clicked', () => {
    const onToggle = vi.fn();
    render(
      <AccordionPanel id="panel-x" title="Clickable" expanded={false} onToggle={onToggle}>
        Content
      </AccordionPanel>
    );
    fireEvent.click(screen.getByRole('button', { name: /clickable/i }));
    expect(onToggle).toHaveBeenCalledWith('panel-x');
  });

  it('is accessible — collapsed (axe)', async () => {
    const { container } = render(
      <AccordionPanel id="a1" title="Fasting" expanded={false} onToggle={() => {}}>
        <p>Content</p>
      </AccordionPanel>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('is accessible — expanded (axe)', async () => {
    const { container } = render(
      <AccordionPanel id="a2" title="Workouts" expanded onToggle={() => {}}>
        <p>Content</p>
      </AccordionPanel>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

/* ─── AccordionGroup — PF-10 single-open invariant ─────────────────────── */
describe('AccordionGroup — PF-10 single-open invariant (B8)', () => {
  // Helper: renders 3 panels in a group and returns button getters
  function renderGroup() {
    const { container } = render(
      <AccordionGroup>
        <AccordionPanel id="a" title="Panel A">Content A</AccordionPanel>
        <AccordionPanel id="b" title="Panel B">Content B</AccordionPanel>
        <AccordionPanel id="c" title="Panel C">Content C</AccordionPanel>
      </AccordionGroup>
    );
    const btnA = () => screen.getByRole('button', { name: /panel a/i });
    const btnB = () => screen.getByRole('button', { name: /panel b/i });
    const btnC = () => screen.getByRole('button', { name: /panel c/i });
    const expanded = () =>
      [...container.querySelectorAll('[aria-expanded="true"]')].length;
    return { btnA, btnB, btnC, expanded, container };
  }

  it('all panels start collapsed', () => {
    const { expanded } = renderGroup();
    expect(expanded()).toBe(0);
  });

  it('clicking A expands A; B and C remain collapsed', () => {
    const { btnA, btnB, btnC, container } = renderGroup();
    fireEvent.click(btnA());
    expect(btnA()).toHaveAttribute('aria-expanded', 'true');
    expect(btnB()).toHaveAttribute('aria-expanded', 'false');
    expect(btnC()).toHaveAttribute('aria-expanded', 'false');
  });

  it('clicking B after A: A collapses, B expands', () => {
    const { btnA, btnB, btnC } = renderGroup();
    fireEvent.click(btnA());
    fireEvent.click(btnB());
    expect(btnA()).toHaveAttribute('aria-expanded', 'false');
    expect(btnB()).toHaveAttribute('aria-expanded', 'true');
    expect(btnC()).toHaveAttribute('aria-expanded', 'false');
  });

  it('clicking B again collapses B (all closed)', () => {
    const { btnA, btnB, expanded } = renderGroup();
    fireEvent.click(btnA());
    fireEvent.click(btnB());
    fireEvent.click(btnB());
    expect(btnB()).toHaveAttribute('aria-expanded', 'false');
    expect(expanded()).toBe(0);
  });

  it('PF-10 INVARIANT: at no point are 2+ panels simultaneously expanded', () => {
    const { btnA, btnB, btnC, expanded } = renderGroup();

    // Click through all combinations
    fireEvent.click(btnA());
    expect(expanded()).toBeLessThanOrEqual(1);

    fireEvent.click(btnB());
    expect(expanded()).toBeLessThanOrEqual(1);

    fireEvent.click(btnC());
    expect(expanded()).toBeLessThanOrEqual(1);

    fireEvent.click(btnA());
    expect(expanded()).toBeLessThanOrEqual(1);

    // Click already-open panel (collapses it)
    fireEvent.click(btnA());
    expect(expanded()).toBe(0);
  });

  it('is accessible — group (axe)', async () => {
    const { container } = render(
      <AccordionGroup>
        <AccordionPanel id="g1" title="Section 1">Content 1</AccordionPanel>
        <AccordionPanel id="g2" title="Section 2">Content 2</AccordionPanel>
      </AccordionGroup>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
