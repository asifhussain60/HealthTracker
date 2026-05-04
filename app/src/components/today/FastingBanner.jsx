/**
 * FastingBanner.jsx — Intermittent fasting state machine banner.
 *
 * States:
 *   'open'         — inside eating window
 *   'opens-in'     — eating window not yet open (shows countdown)
 *   'closed-since' — eating window has closed (shows elapsed time)
 *
 * AC-P1E-E5
 */

/**
 * @param {object} props
 * @param {{ state: 'open'|'opens-in'|'closed-since', minutesUntilOpen?: number, minutesSinceClose?: number }} props.fastingState
 * @param {object} props.protocol — fastingProtocol from profile
 */
export function FastingBanner({ fastingState, protocol }) {
  const { state, minutesUntilOpen, minutesSinceClose } = fastingState ?? { state: 'open' };

  let label;
  if (state === 'open') {
    label = 'Eating window open';
    if (protocol?.windowStart && protocol?.windowEnd) {
      label = `Eating window open · ${protocol.windowStart}–${protocol.windowEnd}`;
    }
  } else if (state === 'opens-in') {
    const h = Math.floor((minutesUntilOpen ?? 0) / 60);
    const m = (minutesUntilOpen ?? 0) % 60;
    label = h > 0
      ? `Window opens in ${minutesUntilOpen} min (${h}h ${m}m)`
      : `Window opens in ${minutesUntilOpen} min`;
  } else {
    // closed-since
    const h = Math.floor((minutesSinceClose ?? 0) / 60);
    const m = (minutesSinceClose ?? 0) % 60;
    label = h > 0
      ? `Window closed ${minutesSinceClose} min ago (${h}h ${m}m)`
      : `Window closed ${minutesSinceClose} min ago`;
  }

  return (
    <div
      className={`fasting-banner fasting-banner--${state}`}
      data-testid="fasting-banner"
      data-state={state}
      role="status"
      aria-label={label}
    >
      <span className="fasting-banner__icon" aria-hidden="true">
        {state === 'open' ? '🟢' : state === 'opens-in' ? '⏳' : '🔴'}
      </span>
      <span className="fasting-banner__label">{label}</span>
    </div>
  );
}
