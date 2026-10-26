/** Shared SVG geometry for lightweight summary visuals. Values stay in source order. */
export interface Point {
  x: number;
  y: number;
}
export const linePath = (points: readonly Point[]) =>
  points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
export function sparklineGeometry(
  values: readonly number[],
  width = 180,
  height = 38,
  padding = 3,
) {
  if (!values.length) return { points: [] as Point[], line: '', area: '' };
  const min = Math.min(...values),
    max = Math.max(...values),
    span = max - min;
  const points = values.map((value, i) => ({
    x:
      values.length === 1 ? width / 2 : padding + (i / (values.length - 1)) * (width - padding * 2),
    y: span === 0 ? height / 2 : height - padding - ((value - min) / span) * (height - padding * 2),
  }));
  const line = linePath(points);
  return {
    points,
    line,
    area: `${line} L${points.at(-1)!.x},${height} L${points[0]!.x},${height} Z`,
  };
}
export function histogramGeometry(
  values: readonly number[],
  width = 180,
  height = 38,
  padding = 2,
) {
  const max = Math.max(...values, 1),
    step = (width - padding * 2) / Math.max(1, values.length);
  return values.map((value, i) => {
    const barHeight = (value / max) * (height - padding * 2);
    return {
      x: padding + (i + 0.2) * step,
      y: height - padding - barHeight,
      width: step * 0.6,
      height: barHeight,
    };
  });
}
