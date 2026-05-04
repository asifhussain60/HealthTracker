/**
 * workLocations.js — LibrarySchema descriptor for WorkLocation.
 *
 * Represents places where the user works (office, client site, home, etc.).
 * Used by the Work Locations library at /profile/work-locations.
 *
 * AC-P1D-D7
 */
import { defineLibrarySchema } from '../LibrarySchema.js';

export const workLocationsSchema = defineLibrarySchema({
  name: 'workLocations',
  sliceKey: 'workLocations',
  fields: [
    { key: 'name', label: 'Name', type: 'string' },
    {
      key: 'locationType',
      label: 'Location Type',
      type: 'enum',
      options: ['office', 'remote', 'hybrid', 'client-site', 'field', 'other'],
    },
    { key: 'address', label: 'Address', type: 'string' },
    { key: 'notes', label: 'Notes', type: 'string' },
    { key: 'tags', label: 'Tags', type: 'tags' },
    { key: 'favoriteStars', label: 'Stars', type: 'stars' },
  ],
  categories: ['office', 'remote', 'hybrid', 'client-site', 'field', 'other'],
  categoryField: 'locationType',
  sortOptions: [
    { key: 'name', label: 'Name', direction: 'asc' },
    { key: 'favoriteStars', label: 'Stars', direction: 'desc' },
  ],
  importFormat: null,
});
