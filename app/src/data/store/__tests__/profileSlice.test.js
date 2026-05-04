import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { profileSliceInitial, createProfileSlice } from '../profileSlice';

const SEED_PROFILE_STUB = {
  name: 'TestUser',
  startingWeight: 241.8,
  currentWeight: 241.8,
  goalWeight: 200,
  bodyMetrics: { lastUpdated: '2026-05-01' },
  medicalFlags: { medicalClearance: false, medicalClearanceDate: null },
  certification: { unlocked: false },
  nutritionTargets: { caloriesRest: 1900, protein: 165 },
  cannabisTargets: { dailySessions: 2 },
};

function makeStore(seedProfile = SEED_PROFILE_STUB) {
  return create((set, get) => ({
    ...profileSliceInitial(seedProfile),
    ...createProfileSlice(set, get),
  }));
}

describe('profileSlice — unit', () => {
  let store;
  beforeEach(() => {
    store = makeStore();
  });

  it('initial state has a profile object', () => {
    expect(store.getState().profile).toBeTruthy();
    expect(store.getState().profile.name).toBe('TestUser');
  });

  it('updateProfile merges partial updates', () => {
    store.getState().updateProfile({ name: 'Alice' });
    expect(store.getState().profile.name).toBe('Alice');
    expect(store.getState().profile.startingWeight).toBe(241.8);
  });

  it('updateBodyMetrics merges into profile.bodyMetrics and stamps lastUpdated', () => {
    store.getState().updateBodyMetrics({ bmi: 32.0 });
    const { profile } = store.getState();
    expect(profile.bodyMetrics.bmi).toBe(32.0);
    expect(profile.bodyMetrics.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('updateCurrentWeight updates profile.currentWeight', () => {
    store.getState().updateCurrentWeight(238.0);
    expect(store.getState().profile.currentWeight).toBe(238.0);
  });

  it('setMedicalClearance sets clearance flag and date', () => {
    store.getState().setMedicalClearance(true, '2026-05-04');
    const { profile } = store.getState();
    expect(profile.medicalFlags.medicalClearance).toBe(true);
    expect(profile.medicalFlags.medicalClearanceDate).toBe('2026-05-04');
  });

  it('setMedicalClearance(false) clears date to null', () => {
    store.getState().setMedicalClearance(false, null);
    const { profile } = store.getState();
    expect(profile.medicalFlags.medicalClearance).toBe(false);
    expect(profile.medicalFlags.medicalClearanceDate).toBeNull();
  });

  it('toggleCertificationLock flips certification.unlocked', () => {
    expect(store.getState().profile.certification.unlocked).toBe(false);
    store.getState().toggleCertificationLock();
    expect(store.getState().profile.certification.unlocked).toBe(true);
    store.getState().toggleCertificationLock();
    expect(store.getState().profile.certification.unlocked).toBe(false);
  });
});
