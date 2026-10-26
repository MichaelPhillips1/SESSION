import type { DailyStock } from '../../../shared/types';
import { priceDomain } from './chartMath';
import { clamp } from './viewport';
import { linePath } from './miniChart';
export function lineDash(style: 'solid' | 'dashed' | 'dotted') {
  return style === 'dashed' ? '7 5' : style === 'dotted' ? '1 5' : undefined;
}
/** Derived only when data/window/size changes, never when the pointer moves. */
export function chartGeometry(days: readonly DailyStock[], width: number) {
  const height = width < 600 ? 334 : 292;
  const left = 18,
    right = 82,
    top = 20,
    bottom = height - 96,
    volumeTop = bottom + 20,
    volumeBottom = height - 26;
  const plotWidth = Math.max(1, width - left - right);
  const { lo, hi } = priceDomain(days);
  const priceY = (value: number) => bottom - ((value - lo) / (hi - lo)) * (bottom - top);
  const volumeMax = Math.max(...days.map((d) => d.volume), 0);
  const points = days.map((d, i) => ({
    x: left + ((i + 0.5) * plotWidth) / days.length,
    highY: priceY(d.highAverage),
    lowY: priceY(d.lowAverage),
    volumeY: volumeBottom - (d.volume / Math.max(volumeMax, 1)) * (volumeBottom - volumeTop),
  }));
  const high = points.map((p) => ({ x: p.x, y: p.highY }));
  const low = points.map((p) => ({ x: p.x, y: p.lowY }));
  const volume = points.map((p) => ({ x: p.x, y: p.volumeY }));
  const highLine = linePath(high),
    lowLine = linePath(low),
    volumeLine = linePath(volume);
  const slots = Math.min(
    9,
    days.length,
    Math.max(2, Math.floor(plotWidth / (width < 600 ? 64 : 140)) + 1),
  );
  const dateIndices = Array.from(
    new Set(
      Array.from({ length: slots }, (_, i) =>
        slots === 1 ? 0 : Math.round((i * (days.length - 1)) / (slots - 1)),
      ),
    ),
  );
  return {
    width,
    height,
    left,
    right,
    top,
    bottom,
    plotWidth,
    volumeTop,
    volumeBottom,
    volumeMax,
    points,
    highLine,
    lowLine,
    volumeLine,
    band:
      points.length > 1
        ? `${highLine} ${low
            .toReversed()
            .map((p) => `L${p.x.toFixed(2)},${p.y.toFixed(2)}`)
            .join(' ')} Z`
        : '',
    volumeArea: points.length
      ? `${volumeLine} L${points.at(-1)!.x},${volumeBottom} L${points[0]!.x},${volumeBottom} Z`
      : '',
    barWidth: Math.max(1, Math.min(36, (plotWidth / Math.max(days.length, 1)) * 0.53)),
    priceTicks: [0, 0.25, 0.5, 0.75, 1].map((t) => ({
      value: hi - t * (hi - lo),
      y: top + t * (bottom - top),
    })),
    dates: dateIndices.map((i) => ({ index: i, day: days[i]!.day, x: points[i]!.x })),
  };
}
export type ChartGeometry = ReturnType<typeof chartGeometry>;
export function pointerIndex(x: number, geometry: ChartGeometry): number {
  return clamp(
    Math.floor(((x - geometry.left) / geometry.plotWidth) * geometry.points.length),
    0,
    Math.max(0, geometry.points.length - 1),
  );
}
/** Flip beside the cursor and clamp in both directions, including narrow mobile plots. */
export function tooltipPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  tipWidth: number,
  tipHeight: number,
) {
  return {
    left: clamp(
      x + tipWidth + 22 > width ? x - tipWidth - 16 : x + 16,
      8,
      Math.max(8, width - tipWidth - 8),
    ),
    top: clamp(y - 28, 8, Math.max(8, height - tipHeight - 8)),
  };
}
