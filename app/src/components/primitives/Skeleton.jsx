/**
 * Skeleton.jsx — Gray placeholder block for loading states.
 *
 * AC-P0-C1
 * Uses CSS variables for colour. Animation via skeleton--animate class.
 * aria-hidden=true since it is purely decorative.
 *
 * @param {object}  props
 * @param {string}  [props.width]   - CSS width value (default: '100%')
 * @param {string}  [props.height]  - CSS height value (default: '16px')
 * @param {boolean} [props.animate] - Enable shimmer animation
 * @param {string}  [props.className] - Additional class names
 */
export function Skeleton({ width = '100%', height = '16px', animate = false, className = '' }) {
  const animateClass = animate ? 'skeleton--animate' : '';
  return (
    <div
      className={`skeleton ${animateClass} ${className}`.trim()}
      aria-hidden="true"
      style={{ width, height }}
    />
  );
}
