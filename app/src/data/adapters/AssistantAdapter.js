/**
 * AssistantAdapter.js
 *
 * Interface typedef for AI assistant integration.
 *
 * Phase 4 — Claude API with prompt caching.
 * For Phase 0/1, only the typedef exists. There is no stub implementation.
 *
 * @typedef {Object} DailySummary
 * @property {string} date
 * @property {string} narrative   - Human-readable summary of the day's health data.
 * @property {string[]} highlights
 */

/**
 * @typedef {Object} CorrelationInsight
 * @property {string} metric1
 * @property {string} metric2
 * @property {number} correlation  - Pearson r, -1 to 1
 * @property {string} narrative
 */

/**
 * @typedef {Object} AssistantAdapter
 * @property {(prompt: string, context: object) => string}   ask            - Synchronous in interface;
 *   concrete implementations may queue async work and return a placeholder.
 * @property {(date: string) => DailySummary}                dailySummary   - Summary for a given date.
 * @property {() => CorrelationInsight[]}                    correlations   - Cross-metric insights.
 *
 * Phase 4 only. No implementation exists in Phase 0/1.
 */

// Null export — confirms typedef presence at import time (used by smoke tests).
// Do NOT instantiate. See AC-P0-B12.
export const AssistantAdapter = null;
