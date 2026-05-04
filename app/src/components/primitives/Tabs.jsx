/**
 * Tabs.jsx — MD3 Tabs primitive
 * AC-P1B-NAV
 *
 * Variants: primary | secondary
 * Props: tabs [{id, label}], activeId, onChange, scrollable
 *
 * All colours via CSS variables — no hex in JSX.
 */
import { useId } from 'react';

export function Tabs({ variant = 'primary', tabs = [], activeId, onChange, scrollable = false, className = '' }) {
  const generatedId = useId();
  const tablistId = `md3-tablist-${generatedId}`;

  const classes = [
    'md3-tabs',
    `md3-tabs--${variant}`,
    scrollable ? 'md3-tabs--scrollable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div role="tablist" id={tablistId} className="md3-tabs__list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${tablistId}-tab-${tab.id}`}
            className={[
              'md3-tabs__tab',
              activeId === tab.id ? 'md3-tabs__tab--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-selected={activeId === tab.id ? 'true' : 'false'}
            onClick={() => onChange?.(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
