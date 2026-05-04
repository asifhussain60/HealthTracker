/**
 * NotificationAdapter.js
 *
 * Interface typedef for push/local notification scheduling.
 *
 * Phase 3 (optional self-reminders) and Phase 4.
 * For Phase 0/1, only the typedef exists.
 *
 * Solo-user scope: no recipient picker; reminders are always for the same user.
 * The `Permission` type mirrors the Web Notifications API string enum.
 *
 * @typedef {'granted' | 'denied' | 'default'} Permission
 */

/**
 * @typedef {Object} NotificationAdapter
 * @property {(title: string, body: string, when: string) => string}   scheduleReminder
 *   Schedule a notification. `when` is an ISO datetime string.
 *   Returns a reminderId string for later cancellation.
 * @property {(reminderId: string) => void}                            cancelReminder
 *   Cancel a previously scheduled reminder by its ID.
 * @property {() => Permission}                                        permissionStatus
 *   Returns the current notification permission status.
 *
 * Phase 3 / Phase 4 only. No implementation exists in Phase 0/1.
 */

// Null export — confirms typedef presence at import time (used by smoke tests).
// Do NOT instantiate. See AC-P0-B12.
export const NotificationAdapter = null;
