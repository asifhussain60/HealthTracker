/**
 * workout.test.js — AC-P1D-D5 RED
 *
 * Tests for workoutPrograms, workoutRoutines, exercises LibrarySchema descriptors.
 */
import { describe, it, expect } from 'vitest';
import { workoutProgramsSchema } from '../workoutPrograms.js';
import { workoutRoutinesSchema } from '../workoutRoutines.js';
import { exercisesSchema } from '../exercises.js';
import { createLibraryRepo } from '../../LibraryRepo.js';

// ── workoutPrograms ────────────────────────────────────────────────────────────

describe('workoutProgramsSchema', () => {
  it('is frozen', () => expect(Object.isFrozen(workoutProgramsSchema)).toBe(true));
  it('has name "workoutPrograms"', () => expect(workoutProgramsSchema.name).toBe('workoutPrograms'));
  it('has sliceKey "workoutPrograms"', () => expect(workoutProgramsSchema.sliceKey).toBe('workoutPrograms'));
  it('has a name field', () => {
    expect(workoutProgramsSchema.fields.find((f) => f.key === 'name')).toBeTruthy();
  });
  it('has a description field', () => {
    expect(workoutProgramsSchema.fields.find((f) => f.key === 'description')).toBeTruthy();
  });
  it('has a level field (enum)', () => {
    const f = workoutProgramsSchema.fields.find((f) => f.key === 'level');
    expect(f).toBeTruthy();
    expect(f.type).toBe('enum');
  });
  it('round-trips via LibraryRepo', () => {
    const store = { getState: () => ({ workoutPrograms: [] }), setState: (p) => { store.state = { ...p }; } };
    store.getState = () => store.state ?? { workoutPrograms: [] };
    const repo = createLibraryRepo({ schema: workoutProgramsSchema, store });
    const item = repo.add({ name: 'P90X', level: 'advanced' });
    expect(item.id).toBeTruthy();
    expect(repo.list()[0].name).toBe('P90X');
  });
});

// ── workoutRoutines ────────────────────────────────────────────────────────────

describe('workoutRoutinesSchema', () => {
  it('is frozen', () => expect(Object.isFrozen(workoutRoutinesSchema)).toBe(true));
  it('has name "workoutRoutines"', () => expect(workoutRoutinesSchema.name).toBe('workoutRoutines'));
  it('has sliceKey "workoutRoutines"', () => expect(workoutRoutinesSchema.sliceKey).toBe('workoutRoutines'));
  it('has a name field', () => {
    expect(workoutRoutinesSchema.fields.find((f) => f.key === 'name')).toBeTruthy();
  });
  it('has a programId field for cross-reference', () => {
    expect(workoutRoutinesSchema.fields.find((f) => f.key === 'programId')).toBeTruthy();
  });
  it('has a durationMinutes field (number)', () => {
    const f = workoutRoutinesSchema.fields.find((f) => f.key === 'durationMinutes');
    expect(f).toBeTruthy();
    expect(f.type).toBe('number');
  });
  it('round-trips via LibraryRepo', () => {
    const store = { getState: () => ({ workoutRoutines: [] }), setState: (p) => { store.state = { ...p }; } };
    store.getState = () => store.state ?? { workoutRoutines: [] };
    const repo = createLibraryRepo({ schema: workoutRoutinesSchema, store });
    const item = repo.add({ name: 'Chest & Back', programId: 'prog-1' });
    expect(item.id).toBeTruthy();
    expect(repo.list()[0].programId).toBe('prog-1');
  });
});

// ── exercises ─────────────────────────────────────────────────────────────────

describe('exercisesSchema', () => {
  it('is frozen', () => expect(Object.isFrozen(exercisesSchema)).toBe(true));
  it('has name "exercises"', () => expect(exercisesSchema.name).toBe('exercises'));
  it('has sliceKey "exercises"', () => expect(exercisesSchema.sliceKey).toBe('exercises'));
  it('has a name field', () => {
    expect(exercisesSchema.fields.find((f) => f.key === 'name')).toBeTruthy();
  });
  it('has a muscleGroup field (enum)', () => {
    const f = exercisesSchema.fields.find((f) => f.key === 'muscleGroup');
    expect(f).toBeTruthy();
    expect(f.type).toBe('enum');
  });
  it('has an equipment field', () => {
    expect(exercisesSchema.fields.find((f) => f.key === 'equipment')).toBeTruthy();
  });
  it('round-trips via LibraryRepo', () => {
    const store = { getState: () => ({ exercises: [] }), setState: (p) => { store.state = { ...p }; } };
    store.getState = () => store.state ?? { exercises: [] };
    const repo = createLibraryRepo({ schema: exercisesSchema, store });
    const item = repo.add({ name: 'Pull-Up', muscleGroup: 'back' });
    expect(item.id).toBeTruthy();
    expect(repo.list()[0].name).toBe('Pull-Up');
  });
});
