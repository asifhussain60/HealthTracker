/**
 * Stars.jsx — Favourite-star rating display (0–N filled stars).
 *
 * AC-P0-C1
 * Display only — not interactive. For interactive editing, see Phase 1.
 * All colours use CSS variables only.
 *
 * @param {object} props
 * @param {number} props.value        - Number of filled stars
 * @param {number} [props.max]        - Total number of stars (default: 3)
 * @param {string} [props.label]      - Accessible aria-label
 */
export function Stars({ value, max = 3, label }) {
  const stars = Array.from({ length: max }, (_, i) => i < value);

  return (
    <span
      className="stars-wrap"
      aria-label={label}
      role={label ? 'img' : undefined}
      style={{ display: 'inline-flex', gap: 2 }}
    >
      {stars.map((filled, i) => (
        <span
          key={i}
          data-filled={filled ? 'true' : 'false'}
          style={{ color: filled ? 'var(--yellow)' : 'var(--surface3)', fontSize: 14 }}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </span>
  );
}
