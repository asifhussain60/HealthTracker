/**
 * meals-library-seed.integration.test.jsx — D15 integration tests.
 *
 * Verifies that after migration, 30 meal cards render and audit fields are present.
 * AC-P1D-D15
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LibraryView } from '../../../../components/library/LibraryView.jsx';
import { mealsSchema } from '../../schemas/meals.js';
import { MEAL_SEED_30 } from '../MEAL_SEED_30.js';
import { stampNewRecord } from '../../../repositories/_internal/auditFields.js';

// ── Minimal store stub ────────────────────────────────────────────────────────

function makeSeededStore(items) {
  let state = { meals: items };
  return {
    getState: () => state,
    setState: (patch) => { state = { ...state, ...patch }; },
    subscribe: () => () => {},
  };
}

describe('meals-library-seed integration', () => {
  it('renders 30 meal cards after seed', () => {
    const seededItems = MEAL_SEED_30.map((m) => stampNewRecord(m));
    const store = makeSeededStore(seededItems);

    const { container } = render(
      <LibraryView schema={mealsSchema} store={store} />
    );

    // LibraryItemCard renders with data-testid="library-item-card"
    const cards = container.querySelectorAll('[data-testid="library-item-card"]');
    expect(cards.length).toBe(30);
  });

  it('all seeded items have createdAt/updatedAt/createdBy/updatedBy/schemaVersion', () => {
    const seededItems = MEAL_SEED_30.map((m) => stampNewRecord(m));
    for (const item of seededItems) {
      expect(item.createdAt).toBeTruthy();
      expect(item.updatedAt).toBeTruthy();
      expect(item.createdBy).toBe('me');
      expect(item.updatedBy).toBe('me');
      expect(item.schemaVersion).toBe(3);
    }
  });

  it('CSV import-drop upserts without duplicating', () => {
    // Start with 30 seeded items
    const seededItems = MEAL_SEED_30.map((m) => stampNewRecord(m));

    // Import a 1-item CSV
    const { parseMyNetDiaryCsv } = require('../parseMyNetDiaryCsv.js');
    const csv = 'Recipe Name,Calories,Category\nChicken Salad,350,lunch';
    const result = parseMyNetDiaryCsv(csv, seededItems);
    // The item should be added (it's new)
    expect(result.added).toBe(1);
    expect(result.updated + result.skipped).toBe(0);

    // Import same CSV again — should upsert, not add
    const result2 = parseMyNetDiaryCsv(csv, [...seededItems, ...result.items]);
    expect(result2.added).toBe(0);
  });

  it('structural lint: no seeded item missing audit fields', () => {
    const seededItems = MEAL_SEED_30.map((m) => stampNewRecord(m));
    const REQUIRED_AUDIT_FIELDS = ['createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'schemaVersion', 'id', 'userId'];
    for (const item of seededItems) {
      for (const field of REQUIRED_AUDIT_FIELDS) {
        expect(item[field], `${item.name} missing ${field}`).toBeTruthy();
      }
    }
  });
});
