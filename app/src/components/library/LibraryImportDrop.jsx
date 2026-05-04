/**
 * LibraryImportDrop.jsx — Drag-and-drop CSV/JSON import zone.
 *
 * Accepts dragged files or a file input. Calls onImport with the parsed
 * data array. Error reporting via onError callback.
 *
 * AC-P1D-D1
 */
import { useRef } from 'react';

/**
 * @param {Object} props
 * @param {Function} props.onImport - Called with parsed items array on success.
 * @param {Function} [props.onError] - Called with error message on failure.
 * @param {string|null} [props.importFormat] - 'csv' | 'json' | null.
 */
export function LibraryImportDrop({ onImport, onError, importFormat }) {
  const inputRef = useRef(null);

  function parseFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      try {
        if (importFormat === 'csv' || file.name.endsWith('.csv')) {
          const lines = text.trim().split('\n');
          const headers = lines[0].split(',').map((h) => h.trim());
          const items = lines.slice(1).map((line) => {
            const vals = line.split(',').map((v) => v.trim());
            const obj = {};
            headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
            return obj;
          });
          onImport(items);
        } else {
          const parsed = JSON.parse(text);
          onImport(Array.isArray(parsed) ? parsed : [parsed]);
        }
      } catch (err) {
        onError?.(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) parseFile(file);
  }

  return (
    <div
      className="library-import-drop"
      data-testid="library-import-drop"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      role="region"
      aria-label="Import zone — drag and drop CSV or JSON"
    >
      <span>Drag CSV/JSON here or</span>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        Browse
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-label="Import file"
      />
    </div>
  );
}
