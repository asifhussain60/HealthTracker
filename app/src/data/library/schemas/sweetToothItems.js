/**
 * sweetToothItems.js — LibrarySchema descriptor for SweetToothItem.
 *
 * Sweet-tooth items are indulgences tracked by the Sweet Tooth panel.
 * weeklyCap enforcement and friction-confirm happen at the panel level.
 *
 * AC-P1D-D7
 */
import { defineLibrarySchema } from '../LibrarySchema.js';

export const sweetToothItemsSchema = defineLibrarySchema({
  name: 'sweetToothItems',
  sliceKey: 'sweetToothItems',
  fields: [
    { key: 'name', label: 'Name', type: 'string' },
    {
      key: 'category',
      label: 'Category',
      type: 'enum',
      options: ['chocolate', 'candy', 'pastry', 'ice-cream', 'cookies', 'cake', 'other'],
    },
    { key: 'calories', label: 'Calories', type: 'number' },
    { key: 'servingSize', label: 'Serving Size', type: 'string' },
    { key: 'notes', label: 'Notes', type: 'string' },
    { key: 'tags', label: 'Tags', type: 'tags' },
    { key: 'favoriteStars', label: 'Stars', type: 'stars' },
  ],
  categories: ['chocolate', 'candy', 'pastry', 'ice-cream', 'cookies', 'cake', 'other'],
  sortOptions: [
    { key: 'name', label: 'Name', direction: 'asc' },
    { key: 'calories', label: 'Calories', direction: 'asc' },
    { key: 'favoriteStars', label: 'Stars', direction: 'desc' },
  ],
  importFormat: null,
});
