/**
 * SweetToothPanel.jsx — Sweet tooth independent panel.
 *
 * - 4 indulgence counters (Chocolate, Candy, Mints, Cookies)
 * - 14-day streak strip
 * - Friction-confirm modal on every + tap
 * - Append-only — no delete button
 * - Closed day → + buttons disabled
 *
 * AC-P1E-E6
 */
import { useState } from 'react';

const SWEET_ITEMS = [
  { key: 'chocolate', label: 'Chocolate' },
  { key: 'candy',     label: 'Candy' },
  { key: 'mints',     label: 'Mints' },
  { key: 'cookies',   label: 'Cookies' },
];

/**
 * @param {object} props
 * @param {{ [key: string]: number }} props.dailyCounts — count per item key for today
 * @param {Array<{date: string, slipCount: number}>} props.streak — 14-day window
 * @param {boolean} props.isClosed — read-only if true
 * @param {function} props.onAddSlip — called with item key (string) after confirmation
 */
export function SweetToothPanel({ dailyCounts = {}, streak = [], isClosed = false, onAddSlip }) {
  const [pending, setPending] = useState(null); // itemKey awaiting confirmation

  function handlePlusClick(key) {
    if (isClosed) return;
    setPending(key);
  }

  function handleConfirm() {
    if (pending) {
      onAddSlip?.(pending);
    }
    setPending(null);
  }

  function handleCancel() {
    setPending(null);
  }

  return (
    <div className="sweet-tooth-panel" data-testid="sweet-tooth-panel">
      {/* Counters */}
      <div className="sweet-tooth-panel__counters">
        {SWEET_ITEMS.map(({ key, label }) => (
          <div key={key} className="sweet-tooth-panel__counter">
            <span className="sweet-tooth-panel__counter-label">{label}</span>
            <span className="sweet-tooth-panel__counter-value tabular-nums">
              {dailyCounts[key] ?? 0}
            </span>
            <button
              type="button"
              className="sweet-tooth-panel__add-btn"
              aria-label={`Add ${label}`}
              disabled={isClosed}
              onClick={() => handlePlusClick(key)}
            >
              +
            </button>
          </div>
        ))}
      </div>

      {/* 14-day streak strip */}
      <div className="sweet-tooth-panel__streak" data-testid="streak-strip">
        {streak.map(({ date, slipCount }) => (
          <div
            key={date}
            className={[
              'sweet-tooth-panel__streak-day',
              slipCount > 0 ? 'sweet-tooth-panel__streak-day--slip' : 'sweet-tooth-panel__streak-day--clean',
            ].join(' ')}
            data-testid="streak-day"
            title={`${date}: ${slipCount} slip${slipCount !== 1 ? 's' : ''}`}
            aria-label={`${date}: ${slipCount} slips`}
          >
            <span className="sweet-tooth-panel__streak-day-label">
              {date.slice(-2)}
            </span>
            {slipCount > 0 && (
              <span className="sweet-tooth-panel__streak-day-count">{slipCount}</span>
            )}
          </div>
        ))}
      </div>

      {/* Friction-confirm modal */}
      {pending && (
        <div className="sweet-tooth-panel__confirm-backdrop" role="dialog" aria-modal="true">
          <div className="sweet-tooth-panel__confirm" data-testid="friction-confirm">
            <p>
              Log one {SWEET_ITEMS.find((i) => i.key === pending)?.label}?
            </p>
            <div className="sweet-tooth-panel__confirm-actions">
              <button type="button" onClick={handleCancel}>
                Cancel
              </button>
              <button
                type="button"
                data-testid="friction-confirm-ok"
                onClick={handleConfirm}
              >
                Yes, log it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
