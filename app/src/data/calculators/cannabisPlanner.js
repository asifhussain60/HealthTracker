/**
 * cannabisPlanner.js — Pure daily cannabis plan generator.
 *
 * Extracted from cannabisSlice.getDailyCannabisPlan (B4 implementation).
 * The slice action becomes a thin wrapper that calls planDay().
 *
 * No imports from store, views, or React.
 * No Date.now() / new Date() — date is an injected parameter.
 *
 * Taper formula (decision #4):
 *   ceiling(d) = 80 − 55 × d / 56
 *
 * planDay output matches CannabisPlanDay (data-model.md):
 *   { sessions: [{ time, productId, doseMg }], taperCeilingMg }
 * Plus legacy fields forwarded from cannabisSlice for backward compat:
 *   sessionNumber, productName, productBrand, form, plannedTime, timeLabel,
 *   recommendedAmount, unit, estimatedThcMg, reason, usagePlan, useWindow,
 *   dayNight, riskLevel, thcPercent
 */

// ── taperCeiling ──────────────────────────────────────────────────────────────

/**
 * Compute the daily THC ceiling for a given taper day.
 * Formula from DESIGN-REQUIREMENTS § 2 decision #4:
 *   ceiling(d) = 80 − 55 × d / 56
 *
 * @param {number} taperDay - Days elapsed since taper start (0..56)
 * @returns {number} Daily ceiling in mg
 */
export function taperCeiling(taperDay) {
  return 80 - 55 * taperDay / 56;
}

// ── TIME_SLOTS ────────────────────────────────────────────────────────────────

// Matches the original getDailyCannabisPlan TIME_SLOTS for behavioral parity.
const TIME_SLOTS = [
  {
    sessionNumber: 1,
    timeLabel: 'Afternoon',
    plannedTime: '15:00',
    preference: ['day-evening', 'evening'],
    reason: 'Mood / Stress',
  },
  {
    sessionNumber: 2,
    timeLabel: 'Evening',
    plannedTime: '19:30',
    preference: ['evening-night', 'evening', 'night'],
    reason: 'Pain / Relaxation',
  },
  {
    sessionNumber: 3,
    timeLabel: 'Night',
    plannedTime: '21:30',
    preference: ['night', 'evening-night'],
    reason: 'Sleep',
  },
];

// ── Dose parsing helper ───────────────────────────────────────────────────────

/**
 * Extract a numeric dose from a startingDose string like '0.05g' or '0.05g per session'.
 * Falls back to 0.05 if unparseable.
 *
 * Mirrors the original cannabisSlice regex logic exactly for behavioral parity.
 *
 * @param {string | undefined} startingDose
 * @returns {number}
 */
function parseDose(startingDose) {
  const doseMatches = (startingDose || '0.05g').match(/([\d.]+)/g);
  if (doseMatches && doseMatches.length >= 2) {
    return parseFloat(doseMatches[1]);
  }
  if (doseMatches) {
    return parseFloat(doseMatches[0]);
  }
  return 0.05;
}

// ── planDay ───────────────────────────────────────────────────────────────────

/**
 * Generate the daily cannabis plan from inventory and profile.
 *
 * @param {Object} options
 * @param {string}   options.date           - ISO date string (YYYY-MM-DD)
 * @param {number}   options.taperDay       - Days since taper start (0..56)
 * @param {Object}   options.profile        - ProfileFields (cannabisTargets required)
 * @param {Object[]} options.productLib     - CannabisProduct[] inventory
 * @param {Object[]} [options.sessionHistory] - Past sessions (unused now; reserved for future)
 * @returns {{ sessions: Object[], taperCeilingMg: number }}
 */
export function planDay({ date: _date, taperDay, profile, productLib }) {
  const ceilingMg = taperCeiling(taperDay);

  // Guard: profile or cannabisTargets not yet available
  if (!profile?.cannabisTargets) {
    return { sessions: [], taperCeilingMg: ceilingMg };
  }

  const sessionCount = profile.cannabisTargets.dailySessions ?? 2;

  // Filter to available products — mirrors original cannabisSlice filter exactly
  const available = productLib.filter(
    (p) =>
      p.remaining > 0 &&
      p.form === 'flower' &&
      p.dayNight !== 'test-only' &&
      p.dayNight !== 'night-only' &&
      p.riskLevel !== 'high'
  );

  const plan = [];
  const usedIds = new Set();

  for (const slot of TIME_SLOTS.slice(0, sessionCount)) {
    let product = null;

    // Try preferences in order
    for (const pref of slot.preference) {
      product = available.find((p) => p.dayNight === pref && !usedIds.has(p.id));
      if (product) break;
    }

    // Fallback: any unused available product
    if (!product) {
      product = available.find((p) => !usedIds.has(p.id));
    }

    if (!product) continue;

    usedIds.add(product.id);

    const dose = parseDose(product.startingDose);

    // Mirror original thcMg computation exactly (raw, no bioavailability applied here)
    const thcMg = product.thcPercent != null
      ? parseFloat((dose * 1000 * (product.thcPercent / 100)).toFixed(1))
      : null;

    plan.push({
      sessionNumber: slot.sessionNumber,
      productId: product.id,
      productName: product.name,
      productBrand: product.brand,
      form: product.form,
      plannedTime: slot.plannedTime,
      timeLabel: slot.timeLabel,
      recommendedAmount: dose,
      unit: product.remainingUnit,
      estimatedThcMg: thcMg,
      reason: slot.reason,
      usagePlan: product.usagePlan || '',
      useWindow: product.useWindow || '',
      dayNight: product.dayNight,
      riskLevel: product.riskLevel,
      thcPercent: product.thcPercent,
    });
  }

  return { sessions: plan, taperCeilingMg: ceilingMg };
}
