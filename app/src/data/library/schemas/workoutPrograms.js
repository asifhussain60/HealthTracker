/**
 * workoutPrograms.js — LibrarySchema descriptor for WorkoutProgram.
 *
 * A workout program is a curated plan (e.g. P90X, Beachbody).
 * Routines reference a program via programId.
 *
 * AC-P1D-D5
 */
import { defineLibrarySchema } from '../LibrarySchema.js';

export const workoutProgramsSchema = defineLibrarySchema({
  name: 'workoutPrograms',
  sliceKey: 'workoutPrograms',
  fields: [
    { key: 'name', label: 'Name', type: 'string' },
    { key: 'description', label: 'Description', type: 'string' },
    {
      key: 'level',
      label: 'Level',
      type: 'enum',
      options: ['beginner', 'intermediate', 'advanced', 'all-levels'],
    },
    { key: 'durationWeeks', label: 'Duration (weeks)', type: 'number' },
    { key: 'tags', label: 'Tags', type: 'tags' },
    { key: 'favoriteStars', label: 'Stars', type: 'stars' },
  ],
  categories: ['beginner', 'intermediate', 'advanced'],
  categoryField: 'level',
  sortOptions: [
    { key: 'name', label: 'Name', direction: 'asc' },
    { key: 'favoriteStars', label: 'Stars', direction: 'desc' },
    { key: 'level', label: 'Level', direction: 'asc' },
  ],
  importFormat: null,
});
