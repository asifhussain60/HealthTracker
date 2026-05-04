/**
 * thcMath.js — Pure THC calculation functions.
 *
 * No imports from store, views, or React.
 * No Date.now() / new Date() — callers inject time-dependent inputs as parameters.
 *
 * Architecture:
 *   - Inhalation bioavailability applied for flower / cartridge / infused-preroll.
 *   - Oral bioavailability applied for capsule / edible / tincture.
 *   - thcPercent path: dose in grams → mg = grams × 1000 × (thcPercent / 100) × bioavail
 *   - thcMgPerUnit path: dose in units → mg = units × thcMgPerUnit × bioavail
 */

// ── Forms ─────────────────────────────────────────────────────────────────────

const INHALATION_FORMS = new Set(['flower', 'cartridge', 'infused-preroll']);

/**
 * Determine if the given form uses inhalation bioavailability.
 * All other forms (capsule, edible, tincture) use oral bioavailability.
 *
 * @param {string} form
 * @returns {boolean}
 */
function isInhalation(form) {
  return INHALATION_FORMS.has(form);
}

// ── calculateThcMg ────────────────────────────────────────────────────────────

/**
 * Calculate absorbed THC in milligrams for a single consumption event.
 *
 * @param {Object} options
 * @param {number}      options.amount           - Quantity consumed (grams for inhalation; units for oral)
 * @param {string}      options.unit             - Unit label ('g', 'cap', 'ml', etc.) — informational only
 * @param {number|null} options.thcPercent       - THC% (0–100); used for flower/cartridge
 * @param {number|null} options.thcMgPerUnit     - THC mg per unit; used for capsule/edible/tincture
 * @param {string}      options.form             - CannabisProduct.form
 * @param {number}      options.bioavailability  - Fraction absorbed (0..1); caller passes
 *                                                 profile.cannabisTargets.inhalationBioavailability
 *                                                 or oralBioavailability depending on form.
 * @returns {number} Absorbed THC in mg (≥ 0)
 */
export function calculateThcMg({ amount, unit: _unit, thcPercent, thcMgPerUnit, form, bioavailability }) {
  if (!amount || amount <= 0) return 0;
  if (!bioavailability || bioavailability <= 0) return 0;

  if (isInhalation(form)) {
    // Inhalation: amount is in grams
    if (thcPercent == null) return 0;
    const rawMg = amount * 1000 * (thcPercent / 100);
    return rawMg * bioavailability;
  }

  // Oral: amount is in units
  if (thcMgPerUnit == null) return 0;
  return amount * thcMgPerUnit * bioavailability;
}

// ── dailyThcTotal ─────────────────────────────────────────────────────────────

/**
 * Sum the absorbed THC (thcMg) across all sessions on a given date.
 *
 * @param {Array<{ date: string, thcMg?: number }>} sessions
 * @param {string} date - ISO date string (YYYY-MM-DD)
 * @returns {number} Total absorbed THC in mg for that date
 */
export function dailyThcTotal(sessions, date) {
  return sessions
    .filter((s) => s.date === date)
    .reduce((sum, s) => sum + (s.thcMg ?? 0), 0);
}

// ── weeklyThcTotal ────────────────────────────────────────────────────────────

/**
 * Sum the absorbed THC (thcMg) for 7 consecutive days starting at weekStartDate (inclusive).
 *
 * @param {Array<{ date: string, thcMg?: number }>} sessions
 * @param {string} weekStartDate - ISO date string (YYYY-MM-DD); first day of the window
 * @returns {number} Total absorbed THC in mg for the 7-day window
 */
export function weeklyThcTotal(sessions, weekStartDate) {
  const start = new Date(weekStartDate);
  // End is the start + 7 days (exclusive upper bound, so day 0..6 inclusive)
  const end = new Date(weekStartDate);
  end.setDate(end.getDate() + 7);

  return sessions
    .filter((s) => {
      const d = new Date(s.date);
      return d >= start && d < end;
    })
    .reduce((sum, s) => sum + (s.thcMg ?? 0), 0);
}

// ── thcCeilingStatus ──────────────────────────────────────────────────────────

/**
 * Classify daily THC consumption relative to a ceiling.
 *
 * Thresholds:
 *   - 'under'  — dailyMg < 80% of ceilingMg
 *   - 'near'   — 80% ≤ dailyMg < 100% of ceilingMg
 *   - 'over'   — dailyMg ≥ ceilingMg
 *
 * Edge: when ceilingMg === 0 and dailyMg > 0 → 'over'; when both 0 → 'under'.
 *
 * @param {number} dailyMg    - Absorbed THC today in mg
 * @param {number} ceilingMg  - Daily ceiling in mg (from profile.cannabisTargets.dailyThcMgCeiling)
 * @returns {'under' | 'near' | 'over'}
 */
export function thcCeilingStatus(dailyMg, ceilingMg) {
  if (ceilingMg <= 0) {
    return dailyMg > 0 ? 'over' : 'under';
  }
  if (dailyMg >= ceilingMg) return 'over';
  if (dailyMg >= ceilingMg * 0.8) return 'near';
  return 'under';
}
