/**
 * cannabisDevices.js — LibrarySchema descriptor for CannabisDevice.
 *
 * Simple descriptor for devices (vaporizers, pipes, etc.).
 * Products reference devices via recommendedDeviceId.
 *
 * AC-P1D-D6
 */
import { defineLibrarySchema } from '../LibrarySchema.js';

export const cannabisDevicesSchema = defineLibrarySchema({
  name: 'cannabisDevices',
  sliceKey: 'cannabisDevices',
  fields: [
    { key: 'name', label: 'Name', type: 'string' },
    {
      key: 'deviceType',
      label: 'Device Type',
      type: 'enum',
      options: ['vaporizer', 'pipe', 'bong', 'dab-rig', 'pre-roll', 'pen', 'other'],
    },
    { key: 'brand', label: 'Brand', type: 'string' },
    { key: 'notes', label: 'Notes', type: 'string' },
    { key: 'favoriteStars', label: 'Stars', type: 'stars' },
  ],
  categories: ['vaporizer', 'pipe', 'bong', 'pen', 'other'],
  sortOptions: [
    { key: 'name', label: 'Name', direction: 'asc' },
    { key: 'favoriteStars', label: 'Stars', direction: 'desc' },
  ],
  importFormat: null,
});
