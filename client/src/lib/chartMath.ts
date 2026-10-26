import type { DailyStock } from '../../../shared/types';
export function windowReference(visible: readonly DailyStock[]): number {
  return visible.length ? (visible[0]!.highAverage + visible[0]!.lowAverage) / 2 : 0;
}
/** Always include both series, regardless of visibility preferences. No manual scale state. */
export function priceDomain(visible: readonly DailyStock[]): { lo: number; hi: number } {
  if (!visible.length) return { lo: 0, hi: 1 };
  const min = Math.min(...visible.map((d) => d.lowAverage));
  const max = Math.max(...visible.map((d) => d.highAverage));
  const center = (min + max) / 2;
  const half = (Math.max(max - min, Math.abs(center) * 0.002, 0.01) / 2) * 1.35;
  return { lo: center - half, hi: center + half };
}
