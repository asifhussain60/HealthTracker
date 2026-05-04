# Meal Library — Seed & Importer Spec

**Status:** active · architect-owned · canonical (referenced by `_workspace/plan/phase-1-master-plan.md` § 6 P1.D D15 and `DESIGN-REQUIREMENTS.md` § 2 #24)
**Owner:** architect · **Created:** 2026-05-04

This spec governs how the `meals` library is seeded on first migration and how MyNetDiary CSV exports are imported. The `<LibraryView<MealInventoryItem>>` at `/food/library` consumes the schema descriptor in `app/src/data/library/schemas/meals.ts`; this document is the data-side contract that descriptor binds to.

Cross-references:
- Schema shape: `reference/architecture/data-model.md` § 11.5.3 (`MealInventoryItem`).
- Library generic: `DESIGN-REQUIREMENTS.md` § 11.5.
- Calorie derivation rule: `DESIGN-REQUIREMENTS.md` § 2 decisions #9 + #24 — `derived_calories = refCalories × plateWeight / referenceWeight`.

---

## A · MyNetDiary CSV importer contract

### A.1 Required column headers (case-insensitive, order-independent)

| Header | Maps to | Type | Notes |
|---|---|---|---|
| `Recipe Name` | `name` | string | Required. Trimmed; collapsed internal whitespace. |
| `Servings` | (used only for derivation) | number | Optional but recommended. If present, `refCalories = rawCalories / servings` is **not** done — MyNetDiary's per-serving values are taken as-is for `referenceWeight = 100 g`. The `Servings` value is ignored unless a `Reference Weight (g)` column is present (see A.2). |
| `Calories` | `refCalories` | number | Required if not blank. Empty value → row imported with `refCalories: null` and a `needs-cal` badge surfaced on the library card. |
| `Protein (g)` | `refProtein` | number | Default 0 if blank. |
| `Carbs (g)` | `refCarbs` | number | Default 0 if blank. |
| `Fat (g)` | `refFat` | number | Default 0 if blank. |
| `URL` | `mynetdiaryUrl` | string \| null | Optional. Used as the canonical idempotency key when present. |

### A.2 Optional column headers

| Header | Maps to | Notes |
|---|---|---|
| `Category` | `category` | One of `breakfast \| lunch \| dinner \| snack \| shake`. If absent, importer falls back to keyword heuristic on `name` (e.g., "shake" / "smoothie" → `shake`; "oatmeal" / "yogurt" → `breakfast`); else defaults to `snack` and surfaces a `needs-category` badge. |
| `Reference Weight (g)` | `referenceWeight` | Defaults to `100`. Sets `referenceUnit = 'g'`. |
| `Reference Unit` | `referenceUnit` | `'g' \| 'oz'`. Defaults to `'g'`. |
| `Fiber (g)` | `refFiber` | Optional micronutrient. |
| `Sodium (mg)` | `refSodium` | Optional micronutrient. |
| `Tags` | `tags` | Comma-separated; e.g., `halal, high-protein, IF-friendly`. |
| `Ingredients` | `ingredients` | Free-text; piped into shopping-list aggregation. |
| `Prep Notes` | `prepNotes` | Free-text. |
| `Favorite Stars` | `favoriteStars` | `0..3`. Defaults to `0`. |

### A.3 Transformation rules

1. **Header normalization.** Lowercase, strip non-alphanumerics (`Recipe Name` → `recipename`). Maps via a fixed alias table in the importer.
2. **Numeric coercion.** Strip currency / unit suffixes (`g`, `mg`, `cal`); parse `Number(...)`; reject `NaN` (row → `needs-cal` badge if the calorie column was the offender; otherwise reject row with reason logged).
3. **Source attribution.** Every imported row sets `source: 'csv-import'` (or `'mynetdiary'` if a `URL` column is present and matches `*.mynetdiary.com/*`).
4. **Audit fields.** Importer wraps each row through `LibraryRepo.create()` — never bypassed — so `createdAt / updatedAt / createdBy / updatedBy / schemaVersion` are populated by the generic (HT-CORE-008).
5. **Tag de-duplication.** Tags are lower-cased, trimmed, and de-duplicated within each row before insert.
6. **Reference unit defaults.** If `Reference Weight (g)` is absent but `Reference Unit` is `'oz'`, importer emits a debt entry (`reference-weight-implied-default`) and defaults to `100 g` regardless — manual correction expected.

### A.4 Idempotency

The importer **upserts**, never duplicates:

1. If `mynetdiaryUrl` is present on the incoming row AND matches an existing item's `mynetdiaryUrl` → **update** that item (patch `refCalories / refProtein / refCarbs / refFat / refFiber / refSodium / referenceWeight` only; **do not overwrite** user-edited `tags / favoriteStars / prepNotes / category / notes`).
2. Else if `name` (normalized: lowercased, whitespace-collapsed, punctuation-stripped) matches an existing item's normalized name AND that item has `mynetdiaryUrl: null` → **update** that item with same patch rules.
3. Else → **create** new item.

Reporting shape (returned to UI from `<LibraryImportDrop>`):

```ts
{ added: number; updated: number; skipped: number; needsAttention: { rowIndex, reason }[] }
```

### A.5 Validation rules

| Condition | Action |
|---|---|
| `name` empty / blank | Row rejected; `needsAttention` entry with `reason: 'missing-name'`. |
| `Calories` missing or non-numeric | Row imported with `refCalories: null`; card displays `needs-cal` badge; row excluded from auto-plan favorites until corrected. |
| `Category` missing AND keyword heuristic fails | Row imported with `category: 'snack'`; card displays `needs-category` badge. |
| Duplicate `mynetdiaryUrl` within the same CSV | Last-row-wins inside the CSV; idempotency rule A.4 still applied vs the existing library. |
| Negative numeric value on any macro field | Row rejected; `reason: 'negative-macro:<field>'`. |
| File parse error (malformed quoting, BOM, etc.) | Whole import aborted; UI surfaces single error toast; nothing committed. |

### A.6 Conflict resolution

When an idempotent update would overwrite a field the user has explicitly edited (tracked via `updatedBy === 'user'` since last `csv-import`):

- Reference-macro fields (`refCalories / refProtein / refCarbs / refFat / referenceWeight`): **CSV wins** (canonical source is MyNetDiary).
- User-curated fields (`tags / favoriteStars / prepNotes / category / notes / ingredients`): **user wins** (CSV value silently dropped).
- `name`: **user wins**; CSV value appended to `notes` as `imported-as: <csv-name>` for traceability.

This split is enforced inside `parseMyNetDiaryCsv()` → `normalizeForUpsert()`, not at the UI layer.

---

## B · 30-meal starter pack

Seeded into `mealLibrary[]` by the forward migration `v_legacy → v3` (see § C). Six items per category × five categories = **30 items**. Each marked favorite is also marked `favoriteStars: 2` (a single ⭐⭐⭐ "house special" exists per category).

| # | name | category | refCalories | referenceWeight (g) | favorite | notes |
|--:|---|---|--:|--:|:-:|---|
| 1 | Greek yogurt + berries + granola | breakfast | 320 | 280 | ⭐⭐⭐ | IF-friendly post-window; high protein |
| 2 | Spinach + feta egg-white omelette | breakfast | 280 | 220 | ⭐⭐ | 4 egg whites + 1 yolk; halal feta |
| 3 | Steel-cut oats + banana + almond butter | breakfast | 410 | 320 | ⭐⭐ | slow carb; fills the AM block |
| 4 | Cottage cheese + pineapple bowl | breakfast | 240 | 250 | | low-fat 2% cottage cheese |
| 5 | Avocado toast on sprouted-grain | breakfast | 350 | 180 | | ½ avocado + chili flakes |
| 6 | Protein pancakes + maple drizzle | breakfast | 380 | 240 | | Kodiak mix; weekend treat |
| 7 | Grilled chicken + quinoa + roasted veg bowl | lunch | 520 | 400 | ⭐⭐⭐ | meal-prep staple; high protein |
| 8 | Mediterranean tuna salad wrap | lunch | 460 | 320 | ⭐⭐ | whole-wheat lavash; olive oil |
| 9 | Turkey + hummus + cucumber lettuce wraps | lunch | 380 | 300 | ⭐⭐ | low-carb; quick assembly |
| 10 | Lentil soup + side salad | lunch | 410 | 450 | | vegetarian; high fiber |
| 11 | Salmon poke bowl (no rice) | lunch | 480 | 380 | | seaweed + edamame + ponzu |
| 12 | Chicken shawarma plate | lunch | 620 | 420 | | rice + garlic sauce; restaurant pick |
| 13 | Grilled salmon + sweet potato + asparagus | dinner | 580 | 420 | ⭐⭐⭐ | omega-3 staple |
| 14 | Beef + broccoli stir-fry over jasmine rice | dinner | 640 | 460 | ⭐⭐ | low-sodium soy; fresh ginger |
| 15 | Chicken biryani (light) + raita | dinner | 720 | 480 | ⭐⭐ | basmati; halal protein |
| 16 | Whole-wheat pasta + turkey meatballs + marinara | dinner | 590 | 440 | | comfort dinner; Sundays |
| 17 | Lamb kofta + tabbouleh + tzatziki | dinner | 680 | 460 | | weekend / family meals |
| 18 | Vegetable curry + chickpeas + roti | dinner | 540 | 460 | | one whole-wheat roti |
| 19 | Apple + 2 tbsp natural peanut butter | snack | 220 | 200 | ⭐⭐⭐ | go-to afternoon snack |
| 20 | Hummus + carrot + cucumber sticks | snack | 180 | 220 | ⭐⭐ | dipping platter |
| 21 | Mixed nuts (almonds, walnuts, pistachios) ¼ cup | snack | 200 | 30 | ⭐⭐ | unsalted; portion-controlled |
| 22 | String cheese + dark chocolate square | snack | 160 | 50 | | 70% cocoa; controlled indulgence |
| 23 | Hard-boiled eggs (2) + everything seasoning | snack | 180 | 110 | | high-protein; meal-prep |
| 24 | Greek yogurt + honey drizzle | snack | 200 | 200 | | post-prayer evening snack |
| 25 | Whey protein + banana + almond milk shake | shake | 280 | 350 | ⭐⭐⭐ | post-workout staple |
| 26 | Plant protein + spinach + berries shake | shake | 240 | 380 | ⭐⭐ | vegan option; pre-workout |
| 27 | Casein + peanut butter + cocoa nighttime shake | shake | 320 | 360 | ⭐⭐ | bedtime; slow protein |
| 28 | Greek yogurt + protein + frozen mango shake | shake | 300 | 380 | | thicker; meal-replacement style |
| 29 | Chocolate whey + oat + banana recovery shake | shake | 380 | 400 | | post-LIIFT4 day |
| 30 | Electrolyte + collagen + lime sip | shake | 80 | 350 | | pre-fast-break hydration shake |

**Favorites distribution** (per A.4 / `WeeklyPlanGenerator.mealStrategy`):

- Breakfast: rows 1 (⭐⭐⭐), 2, 3 — 3 favorites
- Lunch: rows 7 (⭐⭐⭐), 8, 9 — 3 favorites
- Dinner: rows 13 (⭐⭐⭐), 14, 15 — 3 favorites
- Snack: rows 19 (⭐⭐⭐), 20, 21 — 3 favorites
- Shake: rows 25 (⭐⭐⭐), 26, 27 — 3 favorites

Total favorites: 15 (5 categories × 3 each); house specials: 5 (one per category).

**Default fields applied to every seeded row:**

```ts
{
  tags: [],                     // user fills as needed
  ingredients: '',              // user fills via library editor
  prepNotes: '',
  mynetdiaryUrl: null,          // seeds are not MyNetDiary-sourced
  source: 'manual',             // distinguishes seed from CSV imports
  referenceUnit: 'g',
  // refProtein / refCarbs / refFat: 0 in seed; user adds from MyNetDiary on first edit
  refProtein: 0, refCarbs: 0, refFat: 0,
  refFiber: null, refSodium: null,
  isActive: true,
}
```

`refProtein / refCarbs / refFat` are intentionally `0` in the seed: per decision #12 (plate-weight scaling removed) + #9 (per-recipe calorie sum), only `refCalories` is load-bearing for the calorie ring. Macros are user-paste-only via the library editor.

---

## C · Migration touchpoints

### C.1 Forward migration `v_legacy → v3` extension

The single forward migration (decision #13, P0 B10) is extended in P1.D D15 to populate `mealLibrary[]`. Migration steps relevant to this seed:

1. **If `state.libraries.meals` is missing or empty** → insert all 30 rows from § B as new `MealInventoryItem` records, each wrapped through `LibraryRepo.create()` so audit fields + `schemaVersion: 3` are populated.
2. **If `state.libraries.meals` already contains items** (re-running migration / partial state) → upsert each seed row by normalized name per § A.4 rule 2; do not overwrite user-edited fields (§ A.6).
3. **Set `state.schemaVersion = 3` on the meals slice** if not already.

### C.2 Collapsed `mealTemplates` slice

The legacy `mealTemplates` slice in `store.js` (dead since the wireframe canon shifted to the library pattern) is collapsed:

| Legacy field | Disposition |
|---|---|
| `mealTemplates.items[]` (string-name array) | **Migrated** to `mealLibrary[]` rows: each name becomes an item with `category: 'snack'` (default unless name matches heuristic in § A.3), `refCalories: null`, `needs-cal` badge surfaced. |
| `mealTemplates.favorites[]` (string-name array) | **Migrated**: matched names get `favoriteStars: 2`. |
| `mealTemplates.lastUsed` | **Dropped** (replaced by `WeeklyPlanGenerator.mealStrategy`'s `repeatGapDays` constraint). |

After migration, the `mealTemplates` slice key is removed from the persisted store via the same migration's cleanup pass. Executor commit AC marker for the collapse: same as D15 (`AC-P1D-15`).

### C.3 Dead-code follow-on

Once D15 lands, the executor must also remove (in the same commit, audited under D15):

- Any `useMealTemplates()` hook references in `app/src/data/`.
- Any `<MealTemplatesView>` or analog component.
- Any selectors that still read `state.mealTemplates`.

If any of the above are non-trivial to remove (touch >5 files), the executor files a `debt-logger` entry deferring the cleanup to a follow-up commit within P1.D — but the slice key removal itself is non-negotiable on D15.

### C.4 Forward compatibility

Phase 2 (Supabase) consumes `mealLibrary[]` directly via `SupabaseAdapter`; the seed is replayed only on first-run for a given `userId` (idempotent guard: skip if `meals` count > 0 for that user). No additional migration needed for the multi-user swap.

---

*This document is the single source of truth for the meals library seed and importer contract. Edits to either the 30-row table or the CSV column map must be paired with a `DESIGN-REQUIREMENTS.md` § 2 decision update if user-visible.*
