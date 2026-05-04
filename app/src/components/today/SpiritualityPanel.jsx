/**
 * SpiritualityPanel.jsx — Daily prayer chip panel.
 *
 * 5 prayer chips: Fajr, Zohr, Asr, Maghrib, Isha
 * - Sticky check (once tapped, stays until un-tapped)
 * - Closed day → chips disabled (read-only)
 * - All writes go through onToggle callback (parent → repo)
 *
 * AC-P1E-E2
 */

const PRAYERS = [
  { key: 'fajr',    label: 'Fajr' },
  { key: 'zohr',    label: 'Zohr' },
  { key: 'asr',     label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha',    label: 'Isha' },
];

/**
 * @param {object} props
 * @param {{ [key: string]: { done: boolean } }} props.prayerStatus — status per prayer key
 * @param {function} props.onToggle — called with prayerKey (string)
 * @param {boolean} props.isClosed — true = day is closed; chips read-only
 */
export function SpiritualityPanel({ prayerStatus = {}, onToggle, isClosed = false }) {
  function handleClick(key) {
    if (isClosed) return;
    onToggle?.(key);
  }

  return (
    <div className="spirituality-panel" data-testid="spirituality-panel">
      <div className="spirituality-panel__chips">
        {PRAYERS.map(({ key, label }) => {
          const done = prayerStatus[key]?.done ?? false;
          return (
            <button
              key={key}
              type="button"
              className={[
                'spirituality-panel__chip',
                done ? 'spirituality-panel__chip--done' : '',
                isClosed ? 'spirituality-panel__chip--readonly' : '',
              ].filter(Boolean).join(' ')}
              data-prayer={key}
              data-done={String(done)}
              onClick={() => handleClick(key)}
              disabled={isClosed}
              aria-pressed={done}
              aria-label={`${label} — ${done ? 'prayed' : 'not yet prayed'}`}
            >
              {label}
              {done && (
                <span className="spirituality-panel__chip-check" aria-hidden="true"> ✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
