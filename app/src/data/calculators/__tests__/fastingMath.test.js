/**
 * fastingMath.test.js — RED phase tests for fastingMath calculator
 *
 * Covers: currentState, hoursSinceMeal, timeUntilFastBreak, windowAdherence
 * All time-dependent inputs are injected as parameters — no Date.now(), no new Date().
 *
 * Fasting protocol default: windowStart='14:00', windowEnd='18:00'
 * State machine:
 *   'open'         — now is inside the eating window
 *   'opens-in'     — eating window has not opened yet today
 *   'closed-since' — eating window has closed for the day
 */

import { describe, it, expect } from 'vitest';
import {
  currentState,
  hoursSinceMeal,
  timeUntilFastBreak,
  windowAdherence,
} from '../fastingMath.js';

// ── helpers ───────────────────────────────────────────────────────────────────
// All times are ISO 8601 strings. We use fixed reference dates for determinism.

const protocol = { enabled: true, windowStart: '14:00', windowEnd: '18:00' };
const disabledProtocol = { enabled: false, windowStart: '14:00', windowEnd: '18:00' };

// Helper: build an ISO timestamp string for a given HH:MM on 2026-05-04 (local-time agnostic)
function ts(hhmm, date = '2026-05-04') {
  return `${date}T${hhmm}:00`;
}

// ── currentState ──────────────────────────────────────────────────────────────

describe('currentState — enabled protocol', () => {
  it.each([
    // now is before windowStart (14:00) → opens-in
    ['2026-05-04T10:00:00', 'opens-in'],
    ['2026-05-04T13:59:59', 'opens-in'],
    // now is at or after windowStart and before windowEnd → open
    ['2026-05-04T14:00:00', 'open'],
    ['2026-05-04T16:00:00', 'open'],
    ['2026-05-04T17:59:59', 'open'],
    // now is at or after windowEnd → closed-since
    ['2026-05-04T18:00:00', 'closed-since'],
    ['2026-05-04T23:00:00', 'closed-since'],
  ])(
    'now=%s → state=%s',
    (now, expectedState) => {
      const result = currentState(now, protocol, null);
      expect(result.state).toBe(expectedState);
    }
  );

  it('includes minutesUntilOpen when state is opens-in', () => {
    // 10:00 → 14:00 = 4 hours = 240 minutes
    const result = currentState(ts('10:00'), protocol, null);
    expect(result.state).toBe('opens-in');
    expect(result.minutesUntilOpen).toBeCloseTo(240, 0);
  });

  it('includes minutesSinceClose when state is closed-since', () => {
    // 20:00 → closed at 18:00 = 2 hours = 120 minutes
    const result = currentState(ts('20:00'), protocol, null);
    expect(result.state).toBe('closed-since');
    expect(result.minutesSinceClose).toBeCloseTo(120, 0);
  });

  it('does NOT include minutesUntilOpen when state is open', () => {
    const result = currentState(ts('15:00'), protocol, null);
    expect(result.state).toBe('open');
    expect(result.minutesUntilOpen).toBeUndefined();
    expect(result.minutesSinceClose).toBeUndefined();
  });
});

describe('currentState — disabled protocol returns open always', () => {
  it.each([
    ['2026-05-04T06:00:00'],
    ['2026-05-04T10:00:00'],
    ['2026-05-04T20:00:00'],
  ])(
    'now=%s → open when protocol disabled',
    (now) => {
      const result = currentState(now, disabledProtocol, null);
      expect(result.state).toBe('open');
    }
  );
});

describe('currentState — edge: midnight wrap (windowEnd before windowStart)', () => {
  // e.g., 20:00–00:00 window (not the default but a valid config for night eaters)
  const nightProtocol = { enabled: true, windowStart: '20:00', windowEnd: '23:59' };

  it('is open at 21:00', () => {
    const result = currentState(ts('21:00'), nightProtocol, null);
    expect(result.state).toBe('open');
  });

  it('is opens-in at 10:00', () => {
    const result = currentState(ts('10:00'), nightProtocol, null);
    expect(result.state).toBe('opens-in');
  });
});

// ── hoursSinceMeal ────────────────────────────────────────────────────────────

describe('hoursSinceMeal', () => {
  it.each([
    // [now, lastEatenAt, expectedHours]
    ['2026-05-04T15:00:00', '2026-05-04T13:00:00', 2],
    ['2026-05-04T15:30:00', '2026-05-04T13:00:00', 2.5],
    ['2026-05-04T15:00:00', '2026-05-04T15:00:00', 0],
    ['2026-05-05T14:00:00', '2026-05-04T14:00:00', 24],
  ])(
    'now=%s lastEatenAt=%s → %s hours',
    (now, lastEatenAt, expected) => {
      expect(hoursSinceMeal(now, lastEatenAt)).toBeCloseTo(expected, 2);
    }
  );

  it('returns Infinity when lastEatenAt is null (never eaten)', () => {
    expect(hoursSinceMeal('2026-05-04T15:00:00', null)).toBe(Infinity);
  });

  it('returns Infinity when lastEatenAt is undefined', () => {
    expect(hoursSinceMeal('2026-05-04T15:00:00', undefined)).toBe(Infinity);
  });
});

// ── timeUntilFastBreak ────────────────────────────────────────────────────────

describe('timeUntilFastBreak — minutes until eating window opens; 0 if open', () => {
  it.each([
    // before window: opens at 14:00
    ['2026-05-04T10:00:00', protocol, 240],  // 4 hours = 240 min
    ['2026-05-04T13:00:00', protocol, 60],   // 1 hour = 60 min
    ['2026-05-04T13:59:00', protocol, 1],    // 1 minute
    // inside window: 0
    ['2026-05-04T14:00:00', protocol, 0],
    ['2026-05-04T16:00:00', protocol, 0],
    ['2026-05-04T17:59:00', protocol, 0],
    // after window: 0 (window is closed for today)
    ['2026-05-04T18:00:00', protocol, 0],
    ['2026-05-04T20:00:00', protocol, 0],
  ])(
    'now=%s → %s minutes',
    (now, proto, expected) => {
      expect(timeUntilFastBreak(now, proto)).toBeCloseTo(expected, 0);
    }
  );

  it('returns 0 when protocol is disabled', () => {
    expect(timeUntilFastBreak(ts('10:00'), disabledProtocol)).toBe(0);
  });
});

// ── windowAdherence ───────────────────────────────────────────────────────────

describe('windowAdherence — fraction of timestamps inside the eating window', () => {
  it.each([
    // all inside → 1.0
    [
      ['2026-05-04T14:30:00', '2026-05-04T15:00:00', '2026-05-04T16:00:00'],
      protocol,
      1.0,
    ],
    // all outside → 0.0
    [
      ['2026-05-04T10:00:00', '2026-05-04T20:00:00'],
      protocol,
      0.0,
    ],
    // half inside → 0.5
    [
      ['2026-05-04T15:00:00', '2026-05-04T10:00:00'],
      protocol,
      0.5,
    ],
    // 2/3 inside → ~0.667
    [
      ['2026-05-04T14:00:00', '2026-05-04T17:00:00', '2026-05-04T19:00:00'],
      protocol,
      2 / 3,
    ],
  ])(
    'timestamps=%j → adherence=%s',
    (timestamps, proto, expected) => {
      expect(windowAdherence(timestamps, proto)).toBeCloseTo(expected, 3);
    }
  );

  it('returns 1.0 for empty timestamps array (vacuously adherent)', () => {
    expect(windowAdherence([], protocol)).toBe(1.0);
  });

  it('returns 1.0 when protocol is disabled (all meals are "in window")', () => {
    const timestamps = ['2026-05-04T10:00:00', '2026-05-04T23:00:00'];
    expect(windowAdherence(timestamps, disabledProtocol)).toBe(1.0);
  });

  it('counts boundary timestamps as inside (windowStart inclusive)', () => {
    // 14:00:00 exactly — windowStart
    const timestamps = ['2026-05-04T14:00:00'];
    expect(windowAdherence(timestamps, protocol)).toBe(1.0);
  });

  it('counts windowEnd as outside (exclusive)', () => {
    // 18:00:00 exactly — windowEnd (closed)
    const timestamps = ['2026-05-04T18:00:00'];
    expect(windowAdherence(timestamps, protocol)).toBe(0.0);
  });
});
