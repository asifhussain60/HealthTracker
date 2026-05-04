/**
 * ProfileBanner.jsx — Dashboard profile banner with calorie ring.
 *
 * Displays:
 *   - Avatar (initials from profile.name)
 *   - Current weight (tabular-nums)
 *   - Δ-vs-last-week (▼/▲ + lb)
 *   - Goal weight
 *   - Conic-gradient calories ring (eaten / target)
 *   - Calories today / target / remaining
 *
 * All data is passed as props — no store reads.
 * AC-P1E-E1
 */

/**
 * Derive initials from a full name string (up to 2 chars).
 * @param {string} name
 * @returns {string}
 */
function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * @param {object} props
 * @param {object} props.profile — profile fields (name, currentWeight, goalWeight, dailyCalorieTarget)
 * @param {number} props.weightDeltaLb — Δ vs last week (negative = loss)
 * @param {{ eaten: number, target: number, remaining: number }} props.calorieRing
 */
export function ProfileBanner({ profile, weightDeltaLb, calorieRing }) {
  const initials = getInitials(profile?.name);
  const currentWeight = profile?.currentWeight ?? 0;
  const goalWeight = profile?.goalWeight ?? 0;
  const { eaten = 0, target = 2000, remaining = 2000 } = calorieRing ?? {};

  // Clamp fill % between 0 and 100
  const fillPct = target > 0 ? Math.min(100, Math.round((eaten / target) * 100)) : 0;

  const deltaAbs = Math.abs(weightDeltaLb).toFixed(1);
  const deltaArrow = weightDeltaLb < 0 ? '▼' : weightDeltaLb > 0 ? '▲' : '—';
  const deltaLabel = weightDeltaLb === 0 ? '— 0 lb' : `${deltaArrow} ${deltaAbs} lb`;

  // Conic-gradient ring style
  const ringStyle = {
    background: `conic-gradient(var(--md-sys-color-primary, #1976d2) ${fillPct}%, var(--md-sys-color-surface-variant, #e0e0e0) ${fillPct}%)`,
  };

  return (
    <div className="profile-banner" data-testid="profile-banner">
      {/* Avatar */}
      <div className="profile-banner__avatar" aria-label={`Avatar for ${profile?.name}`}>
        {initials}
      </div>

      {/* Name + weight info */}
      <div className="profile-banner__info">
        <div className="profile-banner__name">{profile?.name}</div>

        <div
          className="profile-banner__weight tabular-nums"
          data-testid="current-weight"
        >
          {currentWeight} lb
        </div>

        <div className="profile-banner__delta" data-testid="weight-delta">
          {deltaLabel}
        </div>

        <div className="profile-banner__goal">
          Goal: {goalWeight} lb
        </div>
      </div>

      {/* Calorie ring */}
      <div
        className="profile-banner__calorie-ring"
        data-testid="calorie-ring"
        style={ringStyle}
        aria-label={`Calories: ${fillPct}% of daily target`}
      >
        <div className="profile-banner__calorie-ring-inner">
          <span className="tabular-nums" data-testid="cal-eaten">{eaten}</span>
          <span className="profile-banner__calorie-ring-label">kcal</span>
        </div>
      </div>

      {/* Calorie details */}
      <div className="profile-banner__cal-details">
        <div className="profile-banner__cal-row">
          <span>Today</span>
          <span className="tabular-nums" data-testid="cal-eaten-detail">{eaten}</span>
        </div>
        <div className="profile-banner__cal-row">
          <span>Target</span>
          <span className="tabular-nums" data-testid="cal-target">{target}</span>
        </div>
        <div className="profile-banner__cal-row">
          <span>Remaining</span>
          <span className="tabular-nums" data-testid="cal-remaining">{remaining}</span>
        </div>
      </div>
    </div>
  );
}
