/**
 * workoutPolish.test.jsx — AC-P1D-D10 RED
 *
 * D10 verifies workout library UX:
 *   - programs: level filter (beginner/intermediate/advanced)
 *   - routines: programId field present in form
 *   - routines: type filter (strength/cardio/etc.)
 *   - exercises: muscleGroup category filter
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LibraryView } from '../LibraryView.jsx';
import { workoutProgramsSchema } from '../../../data/library/schemas/workoutPrograms.js';
import { workoutRoutinesSchema } from '../../../data/library/schemas/workoutRoutines.js';
import { exercisesSchema } from '../../../data/library/schemas/exercises.js';

function makeStore(sliceKey, items = []) {
  let state = { [sliceKey]: items };
  return {
    getState: () => state,
    setState: (patch) => { state = { ...state, ...patch }; },
    subscribe: () => () => {},
  };
}

describe('workoutPrograms library', () => {
  it('renders heading "workoutPrograms"', () => {
    const store = makeStore('workoutPrograms');
    render(<LibraryView schema={workoutProgramsSchema} store={store} />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('workoutPrograms');
  });

  it('renders category filter with level options', () => {
    const store = makeStore('workoutPrograms');
    render(<LibraryView schema={workoutProgramsSchema} store={store} />);
    const cat = screen.getByRole('combobox', { name: /category/i });
    expect(cat.innerHTML).toContain('beginner');
    expect(cat.innerHTML).toContain('advanced');
  });

  it('filters programs by level', () => {
    const store = makeStore('workoutPrograms', [
      { id: '1', name: 'P90X', level: 'advanced', deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
      { id: '2', name: 'Yoga Basics', level: 'beginner', deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
    ]);
    render(<LibraryView schema={workoutProgramsSchema} store={store} />);
    fireEvent.change(screen.getByRole('combobox', { name: /category/i }), { target: { value: 'beginner' } });
    expect(screen.getByText('Yoga Basics')).toBeTruthy();
    expect(screen.queryByText('P90X')).toBeFalsy();
  });
});

describe('workoutRoutines library', () => {
  it('renders heading "workoutRoutines"', () => {
    const store = makeStore('workoutRoutines');
    render(<LibraryView schema={workoutRoutinesSchema} store={store} />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('workoutRoutines');
  });

  it('form includes programId field', () => {
    const store = makeStore('workoutRoutines');
    render(<LibraryView schema={workoutRoutinesSchema} store={store} />);
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    // programId field should be in the form
    expect(screen.getByLabelText(/program/i)).toBeTruthy();
  });

  it('category filter shows routine types', () => {
    const store = makeStore('workoutRoutines');
    render(<LibraryView schema={workoutRoutinesSchema} store={store} />);
    const cat = screen.getByRole('combobox', { name: /category/i });
    expect(cat.innerHTML).toContain('strength');
    expect(cat.innerHTML).toContain('cardio');
  });
});

describe('exercises library', () => {
  it('renders heading "exercises"', () => {
    const store = makeStore('exercises');
    render(<LibraryView schema={exercisesSchema} store={store} />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('exercises');
  });

  it('category filter shows muscle groups', () => {
    const store = makeStore('exercises');
    render(<LibraryView schema={exercisesSchema} store={store} />);
    const cat = screen.getByRole('combobox', { name: /category/i });
    expect(cat.innerHTML).toContain('chest');
    expect(cat.innerHTML).toContain('back');
    expect(cat.innerHTML).toContain('legs');
  });

  it('filters exercises by muscle group', () => {
    const store = makeStore('exercises', [
      { id: '1', name: 'Push-Up', muscleGroup: 'chest', deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
      { id: '2', name: 'Pull-Up', muscleGroup: 'back', deletedAt: null, createdAt: '', updatedAt: '', userId: 'u1' },
    ]);
    render(<LibraryView schema={exercisesSchema} store={store} />);
    fireEvent.change(screen.getByRole('combobox', { name: /category/i }), { target: { value: 'back' } });
    expect(screen.getByText('Pull-Up')).toBeTruthy();
    expect(screen.queryByText('Push-Up')).toBeFalsy();
  });
});
