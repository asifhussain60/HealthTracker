/**
 * librarySlices.js — Thin slice definitions for all 9 library slice keys.
 *
 * Each library slice holds a simple array of items managed by LibraryRepo.
 * The LibraryRepo handles all CRUD directly via store.getState()/setState().
 *
 * Slices defined here:
 *   meals, workoutPrograms, workoutRoutines, exercises,
 *   cannabisProducts, cannabisDevices, workLocations,
 *   fastingSafeItems, sweetToothItems.
 *
 * The combined store simply merges these initial states. LibraryRepo reads/writes
 * through store.getState()[sliceKey] and store.setState({ [sliceKey]: ... }).
 *
 * AC-P1D-D8
 */

export const librarySlicesInitial = {
  meals:            [],
  workoutPrograms:  [],
  workoutRoutines:  [],
  exercises:        [],
  cannabisProducts: [],
  cannabisDevices:  [],
  workLocations:    [],
  fastingSafeItems: [],
  sweetToothItems:  [],
};
