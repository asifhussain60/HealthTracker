/**
 * useShortcut.js — Keyboard shortcut hook with mac/win modifier abstraction.
 *
 * AC-P0-C4
 *
 * Chord syntax (case-insensitive key portion):
 *   'mod+k'       — Cmd+K on mac, Ctrl+K on win/linux
 *   'ctrl+z'      — always CtrlKey
 *   'shift+enter' — always ShiftKey + Enter
 *   'mod+shift+f' — Cmd/Ctrl + Shift + F
 *
 * `mod` maps to:
 *   metaKey  when navigator.platform starts with 'Mac'
 *   ctrlKey  otherwise
 *
 * @param {string}   chord    - Shortcut chord string (e.g. 'mod+k')
 * @param {Function} callback - Called when the chord fires
 */
import { useEffect } from 'react';

/**
 * Determine whether `mod` resolves to metaKey on the current platform.
 * @returns {boolean}
 */
function isMac() {
  return /^Mac/i.test(navigator.platform ?? '');
}

/**
 * Parse a chord string into a structured descriptor.
 *
 * @param {string} chord
 * @returns {{ key: string, mod: boolean, ctrl: boolean, shift: boolean, alt: boolean }}
 */
function parseChord(chord) {
  const parts = chord.toLowerCase().split('+');
  const key   = parts[parts.length - 1];
  return {
    key,
    mod:   parts.includes('mod'),
    ctrl:  parts.includes('ctrl'),
    shift: parts.includes('shift'),
    alt:   parts.includes('alt'),
  };
}

/**
 * Check whether a KeyboardEvent matches the parsed chord.
 *
 * @param {KeyboardEvent} event
 * @param {{ key: string, mod: boolean, ctrl: boolean, shift: boolean, alt: boolean }} descriptor
 * @returns {boolean}
 */
function matches(event, descriptor) {
  // Key comparison — case-insensitive, normalise Enter/Space etc.
  const eventKey = event.key.toLowerCase();
  if (eventKey !== descriptor.key) return false;

  // mod → metaKey (mac) or ctrlKey (win)
  if (descriptor.mod) {
    if (isMac()) {
      if (!event.metaKey) return false;
    } else {
      if (!event.ctrlKey) return false;
    }
  }

  // explicit ctrl (independent of mod)
  if (descriptor.ctrl && !event.ctrlKey) return false;

  // shift
  if (descriptor.shift && !event.shiftKey) return false;

  // alt
  if (descriptor.alt && !event.altKey) return false;

  // Ensure no unexpected modifier keys are pressed when they are not in the chord
  // (prevents mod+k from firing on mod+shift+k unless shift is in the chord)
  if (!descriptor.shift && event.shiftKey) return false;
  if (!descriptor.alt   && event.altKey)   return false;

  return true;
}

export function useShortcut(chord, callback) {
  useEffect(() => {
    const descriptor = parseChord(chord);

    function handler(event) {
      if (matches(event, descriptor)) {
        callback(event);
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [chord, callback]);
}
