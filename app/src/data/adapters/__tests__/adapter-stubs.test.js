/**
 * adapter-stubs.test.js
 *
 * Smoke tests for Phase 4+ adapter interface stubs.
 * Verifies each file imports cleanly and exposes its expected null export.
 *
 * These are typedef-only stubs — no real implementation exists.
 * AC-P0-B12
 */

import { describe, it, expect } from 'vitest';

import * as HealthDataAdapterModule from '../HealthDataAdapter.js';
import * as AssistantAdapterModule from '../AssistantAdapter.js';
import * as NotificationAdapterModule from '../NotificationAdapter.js';

describe('HealthDataAdapter stub', () => {
  it('module imports cleanly (no runtime errors)', () => {
    expect(HealthDataAdapterModule).toBeDefined();
  });

  it('exports HealthDataAdapter as null (typedef marker)', () => {
    expect('HealthDataAdapter' in HealthDataAdapterModule).toBe(true);
    expect(HealthDataAdapterModule.HealthDataAdapter).toBeNull();
  });
});

describe('AssistantAdapter stub', () => {
  it('module imports cleanly (no runtime errors)', () => {
    expect(AssistantAdapterModule).toBeDefined();
  });

  it('exports AssistantAdapter as null (typedef marker)', () => {
    expect('AssistantAdapter' in AssistantAdapterModule).toBe(true);
    expect(AssistantAdapterModule.AssistantAdapter).toBeNull();
  });
});

describe('NotificationAdapter stub', () => {
  it('module imports cleanly (no runtime errors)', () => {
    expect(NotificationAdapterModule).toBeDefined();
  });

  it('exports NotificationAdapter as null (typedef marker)', () => {
    expect('NotificationAdapter' in NotificationAdapterModule).toBe(true);
    expect(NotificationAdapterModule.NotificationAdapter).toBeNull();
  });
});
