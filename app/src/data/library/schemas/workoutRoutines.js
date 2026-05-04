/**
 * workoutRoutines.js — LibrarySchema descriptor for WorkoutRoutine.
 *
 * A routine is a single workout session that belongs to a program.
 * Cross-reference: programId → workoutPrograms.sliceKey.
 *
 * AC-P1D-D5
 */
import { defineLibrarySchema } from '../LibrarySchema.js';

export const workoutRoutinesSchema = defineLibrarySchema({
  name: 'workoutRoutines',
  sliceKey: 'workoutRoutines',
  fields: [
    { key: 'name', label: 'Name', type: 'string' },
    { key: 'programId', label: 'Program', type: 'string' },
    { key: 'description', label: 'Description', type: 'string' },
    { key: 'durationMinutes', label: 'Duration (min)', type: 'number' },
    {
      key: 'type',
      label: 'Type',
      type: 'enum',
      options: ['strength', 'cardio', 'flexibility', 'hiit', 'yoga', 'core'],
    },
    {
      key: 'intensity',
      label: 'Intensity',
      type: 'enum',
      options: ['low', 'moderate', 'high', 'max'],
    },
    { key: 'tags', label: 'Tags', type: 'tags' },
    { key: 'favoriteStars', label: 'Stars', type: 'stars' },
  ],
  categories: ['strength', 'cardio', 'flexibility', 'hiit', 'yoga', 'core'],
  categoryField: 'type',
  sortOptions: [
    { key: 'name', label: 'Name', direction: 'asc' },
    { key: 'durationMinutes', label: 'Duration', direction: 'asc' },
    { key: 'favoriteStars', label: 'Stars', direction: 'desc' },
  ],
  importFormat: null,
});
