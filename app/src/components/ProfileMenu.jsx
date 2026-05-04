/**
 * ProfileMenu.jsx — Avatar + dropdown menu for TopAppBar
 * AC-P1C-C5
 *
 * Props:
 *   initials:   string     — avatar initials (e.g. "AH")
 *   name:       string     — display name shown in open menu
 *   onSettings: () => void
 *   onExport:   () => void
 *   onReset:    () => void
 *
 * Accessibility: aria-expanded, role="menu" / role="menuitem", Escape closes,
 * outside-click closes.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar } from './primitives/Avatar.jsx';

export function ProfileMenu({
  initials = '??',
  name = '',
  onSettings,
  onExport,
  onReset,
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef    = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        close();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, close]);

  const handleItem = (cb) => () => {
    cb?.();
    close();
  };

  return (
    <div className="profile-menu">
      <button
        ref={triggerRef}
        type="button"
        className="profile-menu__trigger"
        aria-label="Open menu"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : 'false'}
        onClick={() => setOpen((o) => !o)}
      >
        <Avatar initials={initials} size="small" aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="profile-menu__dropdown"
          aria-label="Profile menu"
        >
          {name && (
            <div className="profile-menu__header" role="presentation">
              {name}
            </div>
          )}

          <button
            role="menuitem"
            type="button"
            className="profile-menu__item"
            onClick={handleItem(onSettings)}
          >
            Settings
          </button>

          <button
            role="menuitem"
            type="button"
            className="profile-menu__item"
            onClick={handleItem(onExport)}
          >
            Export data
          </button>

          <div className="profile-menu__divider" role="separator" />

          <button
            role="menuitem"
            type="button"
            className="profile-menu__item profile-menu__item--danger"
            onClick={handleItem(onReset)}
          >
            Reset app data
          </button>
        </div>
      )}
    </div>
  );
}
