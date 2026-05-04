/**
 * AccordionGroup.jsx — MD3 AccordionGroup (PF-10 single-open invariant)
 * AC-P1B-ACCORDION
 *
 * Wraps AccordionPanel children and enforces single-open invariant:
 * when one panel is opened, all others are closed.
 * The panel reports clicks via onToggle(id) — the group listens and manages state.
 *
 * Usage:
 * ```jsx
 * <AccordionGroup>
 *   <AccordionPanel id="a" title="Section A">...</AccordionPanel>
 *   <AccordionPanel id="b" title="Section B">...</AccordionPanel>
 * </AccordionGroup>
 * ```
 *
 * All colours via CSS variables — no hex in JSX.
 */
import { useState, Children, cloneElement, isValidElement } from 'react';

export function AccordionGroup({ children, className = '' }) {
  const [openId, setOpenId] = useState(null);

  const handleToggle = (id) => {
    // Toggle: if already open, close it; otherwise open it (closes all others)
    setOpenId((prev) => (prev === id ? null : id));
  };

  const panels = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    return cloneElement(child, {
      expanded: child.props.id === openId,
      onToggle: handleToggle,
    });
  });

  return (
    <div className={`md3-accordion-group ${className}`.trim()}>
      {panels}
    </div>
  );
}
