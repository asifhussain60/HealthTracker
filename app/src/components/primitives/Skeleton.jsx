/**
 * Skeleton.jsx — MD3 Skeleton primitive (extended from P0 C1)
 * AC-P1B-DISPLAY · AC-P0-C1 (backward compatible)
 *
 * Shape variants: text | circle | rect (MD3 mode)
 * No shape prop → legacy skeleton class for P0 consumers.
 *
 * All colours via CSS variables — no hex in JSX.
 *
 * @param {object}  props
 * @param {'text'|'circle'|'rect'} [props.shape] - MD3 shape variant
 * @param {string}  [props.width]    - CSS width value (default: '100%')
 * @param {string}  [props.height]   - CSS height value (default: '16px')
 * @param {boolean} [props.animate]  - Enable shimmer animation
 * @param {string}  [props.className] - Additional class names
 */
export function Skeleton({ shape, width = '100%', height = '16px', animate = false, className = '' }) {
  const md3Shapes = new Set(['text', 'circle', 'rect']);
  const isMd3 = shape && md3Shapes.has(shape);

  const classes = isMd3
    ? [
        'md3-skeleton',
        `md3-skeleton--${shape}`,
        animate ? 'md3-skeleton--animate' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')
    : [
        'skeleton',
        animate ? 'skeleton--animate' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ');

  return (
    <div
      className={classes}
      aria-hidden="true"
      style={{ width, height }}
    />
  );
}
