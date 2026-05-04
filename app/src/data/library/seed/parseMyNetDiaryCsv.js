/**
 * parseMyNetDiaryCsv.js — MyNetDiary CSV importer.
 *
 * Contract: reference/product/meal-library-seed.md § A
 *
 * parseMyNetDiaryCsv(csvText, existingItems) → {
 *   added: number,
 *   updated: number,
 *   skipped: number,
 *   needsAttention: { rowIndex, reason }[],
 *   items: MealInventoryItem[],  // merged result (existing + new/updated)
 * }
 *
 * Pure function — no store access, no Date.now(), no side effects.
 * Caller wraps results through LibraryRepo.create() for audit fields.
 *
 * AC-P1D-D15
 */

// ── Header alias table (§ A.1 + A.2) ─────────────────────────────────────────

const HEADER_MAP = {
  recipename:        'name',
  calories:          'calories',
  'protein(g)':      'refProtein',
  'carbs(g)':        'refCarbs',
  'fat(g)':          'refFat',
  'fiber(g)':        'refFiber',
  'sodium(mg)':      'refSodium',
  url:               'mynetdiaryUrl',
  category:          'category',
  'referenceweight(g)': 'referenceWeight',
  referenceunit:     'referenceUnit',
  tags:              'tags',
  ingredients:       'ingredients',
  prepnotes:         'prepNotes',
  favoritestars:     'favoriteStars',
};

// ── Category keyword heuristic (§ A.3) ────────────────────────────────────────

const CATEGORY_KEYWORDS = {
  breakfast: ['oatmeal', 'oat', 'yogurt', 'egg', 'pancake', 'waffle', 'granola', 'muffin', 'toast'],
  shake:     ['shake', 'smoothie', 'protein shake', 'smoothie'],
  lunch:     ['salad', 'wrap', 'sandwich', 'bowl', 'soup'],
  dinner:    ['stir-fry', 'curry', 'biryani', 'pasta', 'salmon', 'chicken', 'beef', 'lamb'],
  snack:     [],  // fallback
};

function guessCategory(name) {
  const lower = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (cat === 'snack') continue; // snack is the fallback
    for (const kw of keywords) {
      if (lower.includes(kw)) return cat;
    }
  }
  return null; // unknown → caller sets 'snack' + needs-category badge
}

// ── CSV parser (handles quoted strings) ───────────────────────────────────────

/**
 * Parse a CSV line that may contain quoted fields.
 * Handles: "field with, comma", "field with ""escaped"" quotes"
 *
 * @param {string} line
 * @returns {string[]}
 */
function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }

  // If still in quotes at end of line, the CSV is malformed but we still push
  fields.push(current);
  return fields;
}

/**
 * Normalize a header string per § A.3 rule 1.
 * Lowercase, strip non-alphanumerics except parentheses for "(g)" / "(mg)".
 *
 * @param {string} header
 * @returns {string}
 */
function normalizeHeader(header) {
  return header.toLowerCase().replace(/[^a-z0-9()]/g, '');
}

/**
 * Normalize an item name for idempotency comparison (§ A.4 rule 2).
 * Lowercase, whitespace-collapsed, punctuation-stripped.
 *
 * @param {string} name
 * @returns {string}
 */
function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

// ── Numeric coercion (§ A.3 rule 2) ──────────────────────────────────────────

function coerceNumber(val) {
  if (val === null || val === undefined || val === '') return null;
  // Strip unit suffixes
  const stripped = String(val).replace(/[gGmMcC]+$/, '').trim();
  const n = Number(stripped);
  return isNaN(n) ? null : n;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Parse a MyNetDiary CSV string and merge against an existing library.
 *
 * @param {string} csvText - Raw CSV text.
 * @param {Object[]} existingItems - Current library items (not mutated).
 * @returns {{ added: number, updated: number, skipped: number, needsAttention: Object[], items: Object[] }}
 */
export function parseMyNetDiaryCsv(csvText, existingItems = []) {
  const needsAttention = [];
  let added = 0;
  let updated = 0;
  let skipped = 0;

  // Clone existing items so we can mutate for upserts
  const merged = existingItems.map((item) => ({ ...item }));

  // ── Parse CSV ──────────────────────────────────────────────────────────────
  let lines;
  try {
    lines = csvText.split(/\r?\n/).filter((l) => l.trim() !== '');
  } catch {
    return { added: 0, updated: 0, skipped: 0, needsAttention: [{ rowIndex: 0, reason: 'parse-error' }], items: merged };
  }

  if (lines.length < 2) {
    return { added, updated, skipped, needsAttention, items: merged };
  }

  // Parse headers
  const rawHeaders = parseCsvLine(lines[0]);
  const headers = rawHeaders.map((h) => normalizeHeader(h.trim()));

  // ── Process rows ───────────────────────────────────────────────────────────
  for (let rowIdx = 1; rowIdx < lines.length; rowIdx++) {
    const rawFields = parseCsvLine(lines[rowIdx]);

    // Check for unclosed quote (malformed) — gracefully degrade
    // Build row object
    const raw = {};
    headers.forEach((h, i) => {
      raw[h] = (rawFields[i] ?? '').trim();
    });

    // Map raw → canonical field names
    const mapped = {};
    for (const [normalizedHeader, value] of Object.entries(raw)) {
      const canonical = HEADER_MAP[normalizedHeader];
      if (canonical) {
        mapped[canonical] = value;
      }
    }

    // ── Validate name ──────────────────────────────────────────────────────
    const name = mapped.name?.trim() ?? '';
    if (!name) {
      needsAttention.push({ rowIndex: rowIdx, reason: 'missing-name' });
      skipped++;
      continue;
    }

    // ── Validate macros ────────────────────────────────────────────────────
    let hasNegativeMacro = false;
    for (const field of ['refProtein', 'refCarbs', 'refFat', 'refFiber', 'refSodium']) {
      if (mapped[field] !== undefined && mapped[field] !== '') {
        const n = coerceNumber(mapped[field]);
        if (n !== null && n < 0) {
          needsAttention.push({ rowIndex: rowIdx, reason: `negative-macro:${field}` });
          hasNegativeMacro = true;
          break;
        }
      }
    }
    if (hasNegativeMacro) {
      skipped++;
      continue;
    }

    // ── Coerce calories ────────────────────────────────────────────────────
    let refCalories = null;
    if (mapped.calories !== undefined && mapped.calories !== '') {
      refCalories = coerceNumber(mapped.calories);
      if (refCalories === null) {
        // Non-numeric; treat as missing
        needsAttention.push({ rowIndex: rowIdx, reason: 'needs-cal' });
        refCalories = null;
      }
    } else {
      // Empty calories
      needsAttention.push({ rowIndex: rowIdx, reason: 'needs-cal' });
    }

    // ── Coerce numeric fields ──────────────────────────────────────────────
    const refProtein = coerceNumber(mapped.refProtein) ?? 0;
    const refCarbs   = coerceNumber(mapped.refCarbs) ?? 0;
    const refFat     = coerceNumber(mapped.refFat) ?? 0;
    const refFiber   = mapped.refFiber ? coerceNumber(mapped.refFiber) : null;
    const refSodium  = mapped.refSodium ? coerceNumber(mapped.refSodium) : null;
    const referenceWeight = coerceNumber(mapped.referenceWeight) ?? 100;
    const favoriteStars = Math.min(3, Math.max(0, coerceNumber(mapped.favoriteStars) ?? 0));

    // ── Category ───────────────────────────────────────────────────────────
    let category = (mapped.category ?? '').toLowerCase().trim();
    const validCategories = ['breakfast', 'lunch', 'dinner', 'snack', 'shake'];
    if (!validCategories.includes(category)) {
      const guessed = guessCategory(name);
      if (guessed) {
        category = guessed;
      } else {
        category = 'snack';
        needsAttention.push({ rowIndex: rowIdx, reason: 'needs-category' });
      }
    }

    // ── Source ─────────────────────────────────────────────────────────────
    const url = mapped.mynetdiaryUrl?.trim() ?? null;
    let source = 'csv-import';
    if (url && url.includes('mynetdiary.com')) {
      source = 'mynetdiary';
    }

    // ── Tags ───────────────────────────────────────────────────────────────
    const rawTags = mapped.tags ?? '';
    const tags = rawTags
      ? [...new Set(rawTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))]
      : [];

    // ── Build item ─────────────────────────────────────────────────────────
    const item = {
      name,
      category,
      refCalories,
      refProtein,
      refCarbs,
      refFat,
      refFiber,
      refSodium,
      referenceWeight,
      referenceUnit: 'g',
      favoriteStars,
      source,
      mynetdiaryUrl: url || null,
      tags,
      ingredients: mapped.ingredients ?? '',
      prepNotes: mapped.prepNotes ?? '',
      isActive: true,
    };

    // ── Idempotency check (§ A.4) ──────────────────────────────────────────
    const normalizedIncoming = normalizeName(name);

    // Rule 1: match by mynetdiaryUrl if present
    let existingIdx = -1;
    if (url) {
      existingIdx = merged.findIndex((e) => e.mynetdiaryUrl === url);
    }

    // Rule 2: match by normalized name if no url match
    if (existingIdx === -1) {
      existingIdx = merged.findIndex(
        (e) => !e.mynetdiaryUrl && normalizeName(e.name ?? '') === normalizedIncoming
      );
    }

    if (existingIdx !== -1) {
      // Update: patch reference-macro fields only (§ A.6)
      const existing = merged[existingIdx];
      merged[existingIdx] = {
        ...existing,
        refCalories: refCalories ?? existing.refCalories,
        refProtein,
        refCarbs,
        refFat,
        refFiber: refFiber ?? existing.refFiber,
        refSodium: refSodium ?? existing.refSodium,
        referenceWeight,
        // User-curated fields are NOT overwritten (§ A.6):
        // tags, favoriteStars, prepNotes, category, notes, ingredients are preserved
      };
      updated++;
    } else {
      // Create new item
      merged.push(item);
      added++;
    }
  }

  return {
    added,
    updated,
    skipped,
    needsAttention,
    items: merged,
  };
}
