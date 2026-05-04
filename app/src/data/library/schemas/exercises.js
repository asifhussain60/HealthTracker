/**
 * exercises.js — LibrarySchema descriptor for Exercise.
 *
 * An exercise is a named movement (e.g. Push-Up, Pull-Up, Squat).
 * Stands alone — no cross-reference to programs or routines.
 *
 * AC-P1D-D5
 */
import { defineLibrarySchema } from '../LibrarySchema.js';

export const exercisesSchema = defineLibrarySchema({
  name: 'exercises',
  sliceKey: 'exercises',
  fields: [
    { key: 'name', label: 'Name', type: 'string' },
    {
      key: 'muscleGroup',
      label: 'Muscle Group',
      type: 'enum',
      options: ['chest', 'back', 'shoulders', 'arms', 'core', 'legs', 'glutes', 'full-body'],
    },
    {
      key: 'equipment',
      label: 'Equipment',
      type: 'enum',
      options: ['none', 'dumbbells', 'barbell', 'resistance-band', 'machine', 'cable', 'other'],
    },
    { key: 'description', label: 'Description', type: 'string' },
    { key: 'tags', label: 'Tags', type: 'tags' },
    { key: 'favoriteStars', label: 'Stars', type: 'stars' },
  ],
  categories: ['chest', 'back', 'shoulders', 'arms', 'core', 'legs', 'glutes', 'full-body'],
  sortOptions: [
    { key: 'name', label: 'Name', direction: 'asc' },
    { key: 'muscleGroup', label: 'Muscle Group', direction: 'asc' },
    { key: 'favoriteStars', label: 'Stars', direction: 'desc' },
  ],
  importFormat: null,
});
