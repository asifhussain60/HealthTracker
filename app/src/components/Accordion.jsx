import { useState } from 'react';

export function Accordion({ title, badge, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="accordion">
      <div className="accordion-header" onClick={() => setOpen(!open)}>
        <span className="accordion-title">
          {title}
          {badge != null && (
            <span style={{ fontSize: 11, color: 'var(--text-dimmer)', fontWeight: 400 }}>
              {badge}
            </span>
          )}
        </span>
        <svg className={`accordion-chevron ${open ? 'open' : ''}`} viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  );
}
