/**
 * meals.js — LibrarySchema descriptor for MealInventoryItem.
 *
 * Fields per reference/architecture/data-model.md § MealInventoryItem:
 *   name, category (enum), tags, ingredients, prepNotes,
 *   mynetdiaryUrl, favoriteStars, referenceWeight, referenceUnit (enum),
 *   refCalories, refProtein, refCarbs, refFat, refFiber, refSodium.
 *
 * AC-P1D-D4
 */
import { defineLibrarySchema } from '../LibrarySchema.js';

export const mealsSchema = defineLibrarySchema({
  name: 'meals',
  sliceKey: 'meals',
  fields: [
    { key: 'name', label: 'Name', type: 'string' },
    {
      key: 'category',
      label: 'Category',
      type: 'enum',
      options: ['breakfast', 'lunch', 'dinner', 'snack', 'shake'],
    },
    { key: 'tags', label: 'Tags', type: 'tags' },
    { key: 'ingredients', label: 'Ingredients', type: 'string' },
    { key: 'prepNotes', label: 'Prep Notes', type: 'string' },
    { key: 'mynetdiaryUrl', label: 'MyNetDiary URL', type: 'string' },
    { key: 'favoriteStars', label: 'Stars', type: 'stars' },
    { key: 'referenceWeight', label: 'Reference Weight', type: 'number' },
    {
      key: 'referenceUnit',
      label: 'Reference Unit',
      type: 'enum',
      options: ['g', 'oz'],
    },
    { key: 'refCalories', label: 'Calories', type: 'number' },
    { key: 'refProtein', label: 'Protein (g)', type: 'number' },
    { key: 'refCarbs', label: 'Carbs (g)', type: 'number' },
    { key: 'refFat', label: 'Fat (g)', type: 'number' },
    { key: 'refFiber', label: 'Fiber (g)', type: 'number' },
    { key: 'refSodium', label: 'Sodium (mg)', type: 'number' },
  ],
  categories: ['breakfast', 'lunch', 'dinner', 'snack', 'shake'],
  sortOptions: [
    { key: 'favoriteStars', label: 'Stars', direction: 'desc' },
    { key: 'name', label: 'Name', direction: 'asc' },
    { key: 'category', label: 'Category', direction: 'asc' },
    { key: 'refCalories', label: 'Calories', direction: 'asc' },
  ],
  importFormat: 'csv',
});
