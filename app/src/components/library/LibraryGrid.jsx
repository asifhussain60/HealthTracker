/**
 * LibraryGrid.jsx — Responsive grid wrapping LibraryItemCard components.
 *
 * AC-P1D-D1
 */
import { LibraryItemCard } from './LibraryItemCard.jsx';

/**
 * @param {Object} props
 * @param {Object[]} props.items - Filtered + sorted item array.
 * @param {Object} props.schema - LibrarySchema descriptor.
 * @param {Function} props.onEdit - Called with item when Edit clicked.
 * @param {Function} props.onDelete - Called with item when Delete clicked.
 */
export function LibraryGrid({ items, schema, onEdit, onDelete }) {
  if (!items || items.length === 0) {
    return (
      <div className="library-grid library-grid--empty" role="status">
        No items yet.
      </div>
    );
  }

  return (
    <div className="library-grid">
      {items.map((item) => (
        <LibraryItemCard
          key={item.id}
          item={item}
          schema={schema}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
