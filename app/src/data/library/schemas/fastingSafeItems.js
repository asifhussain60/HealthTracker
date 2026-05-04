/**
 * fastingSafeItems.js — LibrarySchema descriptor for the FastingSafeItems library.
 *
 * FastingSafeItems are beverages/foods safe to consume during the intermittent-fasting
 * window (they do not break the fast). Default seed: Water, Green Tea, Black Coffee,
 * Electrolytes (populated by the v_legacy → v3 migration in profile.fastingSafeItems).
 *
 * This schema wires the generic LibraryRepo<FastingSafeItem> for the
 * `/profile/fasting-safe` route (P1.D).
 *
 * Fields:
 *   name               — display name (string, required)
 *   defaultDailyTarget — optional serving target per day (number)
 *   unit               — unit for defaultDailyTarget (enum: cup | ml | oz | piece)
 *   tags               — optional categorisation tags
 *   favoriteStars      — 0–5 stars (stars type)
 *
 * AC-P1A-A6
 */

import { defineLibrarySchema } from '../LibrarySchema.js';

export const fastingSafeItemsSchema = defineLibrarySchema({
  name: 'fastingSafeItems',
  sliceKey: 'fastingSafeItems',
  fields: [
    { key: 'name', label: 'Name', type: 'string' },
    { key: 'defaultDailyTarget', label: 'Daily Target', type: 'number' },
    {
      key: 'unit',
      label: 'Unit',
      type: 'enum',
      options: ['cup', 'ml', 'oz', 'piece'],
    },
    { key: 'tags', label: 'Tags', type: 'tags' },
    { key: 'favoriteStars', label: 'Stars', type: 'stars' },
  ],
  categories: [],
  sortOptions: [
    { key: 'favoriteStars', label: 'Stars', direction: 'desc' },
    { key: 'name', label: 'Name', direction: 'asc' },
  ],
  importFormat: null,
});
