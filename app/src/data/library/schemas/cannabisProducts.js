/**
 * cannabisProducts.js — LibrarySchema descriptor for CannabisProduct.
 *
 * Rich descriptor: form, type, thcPercent, riskLevel, favoriteStars,
 * munchiesRisk, sedationRisk, dayNight classification, recommendedDeviceId.
 *
 * AC-P1D-D6
 */
import { defineLibrarySchema } from '../LibrarySchema.js';

export const cannabisProductsSchema = defineLibrarySchema({
  name: 'cannabisProducts',
  sliceKey: 'cannabisProducts',
  fields: [
    { key: 'name', label: 'Name', type: 'string' },
    { key: 'brand', label: 'Brand', type: 'string' },
    {
      key: 'form',
      label: 'Form',
      type: 'enum',
      options: ['flower', 'capsule', 'tincture', 'edible', 'concentrate', 'infused-preroll', 'cartridge', 'topical'],
    },
    { key: 'type', label: 'Type / Strain', type: 'string' },
    { key: 'thcPercent', label: 'THC %', type: 'number' },
    { key: 'thcMgPerUnit', label: 'THC mg/unit', type: 'number' },
    { key: 'cbdPercent', label: 'CBD %', type: 'number' },
    {
      key: 'riskLevel',
      label: 'Risk Level',
      type: 'enum',
      options: ['low', 'medium', 'medium-high', 'high'],
    },
    {
      key: 'munchiesRisk',
      label: 'Munchies Risk',
      type: 'enum',
      options: ['low', 'medium', 'high'],
    },
    {
      key: 'sedationRisk',
      label: 'Sedation Risk',
      type: 'enum',
      options: ['low', 'medium', 'high'],
    },
    {
      key: 'dayNight',
      label: 'Day/Night',
      type: 'enum',
      options: ['day-evening', 'evening', 'evening-night', 'night', 'night-only', 'test-only'],
    },
    { key: 'recommendedDeviceId', label: 'Recommended Device', type: 'string' },
    { key: 'usagePlan', label: 'Usage Plan', type: 'string' },
    { key: 'notes', label: 'Notes', type: 'string' },
    { key: 'tags', label: 'Tags', type: 'tags' },
    { key: 'favoriteStars', label: 'Stars', type: 'stars' },
  ],
  categories: ['flower', 'capsule', 'tincture', 'edible', 'concentrate', 'infused-preroll'],
  sortOptions: [
    { key: 'favoriteStars', label: 'Stars', direction: 'desc' },
    { key: 'name', label: 'Name', direction: 'asc' },
    { key: 'riskLevel', label: 'Risk Level', direction: 'asc' },
  ],
  importFormat: null,
});
