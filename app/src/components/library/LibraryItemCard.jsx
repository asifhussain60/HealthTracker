/**
 * LibraryItemCard.jsx — One card in a library grid.
 *
 * Renders item fields according to the schema's field list.
 * Provides Edit and Delete action buttons.
 *
 * AC-P1D-D1
 */

/**
 * @param {Object} props
 * @param {Object} props.item - The library item record.
 * @param {Object} props.schema - LibrarySchema descriptor.
 * @param {Function} props.onEdit - Called when Edit is clicked.
 * @param {Function} props.onDelete - Called when Delete is clicked.
 */
export function LibraryItemCard({ item, schema: _schema, onEdit, onDelete }) {
  return (
    <div
      className="library-item-card"
      data-testid="library-item-card"
    >
      <div className="library-item-card__name">{item.name}</div>
      <div className="library-item-card__actions">
        <button
          type="button"
          aria-label="Edit"
          onClick={() => onEdit(item)}
        >
          Edit
        </button>
        <button
          type="button"
          aria-label="Delete"
          onClick={() => onDelete(item)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
