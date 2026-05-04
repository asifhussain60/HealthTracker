/**
 * WeightCard.jsx — Weight Journey hero card.
 *
 * AC-P0-C2
 * Extracted from TodayView.jsx. Consumes props — no store reads.
 * All colours via CSS variables.
 *
 * @param {object} props
 * @param {number} props.currentWeight
 * @param {number} props.goalWeight
 * @param {number} props.startingWeight
 * @param {Function} props.onLogWeight
 */
import { RingChart } from '../primitives/RingChart';

export function WeightCard({ currentWeight, goalWeight, startingWeight, onLogWeight }) {
  const lostSoFar   = Math.max(0, startingWeight - currentWeight);
  const totalToLose = Math.max(1, startingWeight - goalWeight);
  const progressPct = Math.min(100, (lostSoFar / totalToLose) * 100);

  return (
    <div className="v2-hero">
      <div className="v2-hero-left">
        <div className="v2-hero-eyebrow">Weight Journey</div>
        <div className="v2-hero-weight">{currentWeight} <span>lb</span></div>
        <div className="v2-hero-goal">
          Goal <strong>{goalWeight} lb</strong> ·{' '}
          <span className="text-teal">{(currentWeight - goalWeight).toFixed(1)} lb to go</span>
        </div>
        <div className="v2-progress-track">
          <div className="v2-progress-fill" style={{ '--fill': `${progressPct}%` }} />
        </div>
        <div className="v2-hero-caption">
          {lostSoFar > 0
            ? `🔥 ${lostSoFar.toFixed(1)} lb lost so far`
            : '🚀 Starting today — every step counts'}
        </div>
      </div>
      <div
        className="v2-tile v2-tile--weight"
        style={{ cursor: 'pointer', minWidth: 148 }}
        onClick={onLogWeight}
        role="button"
        aria-label="Log weight"
      >
        <RingChart value={lostSoFar} max={totalToLose} colorClass="ring-green" size={148} stroke={13}>
          <div className="ring-num-hero">{progressPct.toFixed(0)}%</div>
          <div className="ring-num-sub">of goal</div>
        </RingChart>
      </div>
    </div>
  );
}
