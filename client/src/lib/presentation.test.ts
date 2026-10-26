import { describe, it, expect } from 'vitest';
import { dailySummary } from './summary';
import { histogramGeometry, sparklineGeometry } from './miniChart';
import { chartGeometry, pointerIndex, tooltipPosition } from './chartGeometry';
import { parsePreferences } from '../hooks/usePreferences';
import { priceFormat } from './format';
const days = [
  { day: '2026-10-21', highAverage: 100, lowAverage: 98, volume: 10 },
  { day: '2026-10-22', highAverage: 110, lowAverage: 100, volume: 20 },
  { day: '2026-10-23', highAverage: 112, lowAverage: 99, volume: 40 },
];
describe('summary presentation values', () => {
  it('compares each latest average to its own previous available session, not month start', () => {
    const summary = dailySummary(days);
    expect(summary.highChange).toBeCloseTo((2 / 110) * 100);
    expect(summary.lowChange).toBe(-1);
    expect(summary.totalVolume).toBe(70);
    expect(summary.latest?.day).toBe('2026-10-23');
    expect(summary.previous?.day).toBe('2026-10-22');
    expect(days[0]!.highAverage).toBe(100);
  });
  it('does not invent a change when history or a nonzero prior price is missing', () => {
    expect(dailySummary([])).toMatchObject({
      latest: null,
      previous: null,
      highChange: null,
      totalVolume: 0,
    });
    expect(dailySummary(days.slice(-1))).toMatchObject({
      highChange: null,
      lowChange: null,
      totalVolume: 40,
    });
    expect(dailySummary([{ ...days[0]!, highAverage: 0, lowAverage: 0 }, days[1]!])).toMatchObject({
      highChange: null,
      lowChange: null,
    });
  });
  it('retains exact zero change independently for both averages', () => {
    expect(dailySummary([days[0]!, { ...days[0]!, day: '2026-10-22' }])).toMatchObject({
      highChange: 0,
      lowChange: 0,
    });
  });
});
describe('lightweight summary SVGs', () => {
  it('keeps the latest point on the right and encodes higher values higher on the canvas', () => {
    const geometry = sparklineGeometry([10, 20, 10]);
    expect(geometry.points[2]!.x).toBeGreaterThan(geometry.points[0]!.x);
    expect(geometry.points[1]!.y).toBeLessThan(geometry.points[0]!.y);
    expect(geometry.points[2]!.y).toBe(geometry.points[0]!.y);
  });
  it('handles empty, single, flat and zero values without invalid SVG coordinates', () => {
    expect(sparklineGeometry([]).line).toBe('');
    for (const values of [[0], [10, 10, 10], [0, 0]]) {
      const geometry = sparklineGeometry(values);
      expect(geometry.line).not.toMatch(/NaN|Infinity/);
      expect(geometry.points.every((p) => p.y === 19)).toBe(true);
    }
  });
  it('uses genuine proportional volume heights and leaves zero volume at zero', () => {
    const bars = histogramGeometry([0, 10, 40]);
    expect(bars[0]!.height).toBe(0);
    expect(bars[2]!.height).toBe(bars[1]!.height * 4);
    expect(bars.every((b) => Number.isFinite(b.y) && b.width > 0)).toBe(true);
  });
});
describe('chart geometry and migration', () => {
  it('keeps both price series inside the padded plot and shares x coordinates with volume', () => {
    const model = chartGeometry(days, 1200);
    for (const point of model.points) {
      expect(point.highY).toBeGreaterThan(model.top);
      expect(point.lowY).toBeLessThan(model.bottom);
      expect(point.highY).toBeLessThan(point.lowY);
      expect(model.volumeLine).toContain(point.x.toFixed(2));
    }
    expect(pointerIndex(-100, model)).toBe(0);
    expect(pointerIndex(1500, model)).toBe(2);
  });
  it('uses fewer actual date labels at narrow widths and preserves the first/last dates', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({
      ...days[0]!,
      day: `2026-10-${String(i + 1).padStart(2, '0')}`,
    }));
    const narrow = chartGeometry(many, 280),
      wide = chartGeometry(many, 1200);
    expect(narrow.dates.length).toBeLessThan(wide.dates.length);
    expect(narrow.dates[0]!.day).toBe(many[0]!.day);
    expect(narrow.dates.at(-1)!.day).toBe(many.at(-1)!.day);
  });
  it('flips and bounds tooltips at every plot corner on desktop and mobile', () => {
    for (const width of [240, 380, 1340])
      for (const height of [292, 334])
        for (const x of [0, width / 2, width])
          for (const y of [0, height]) {
            const tipWidth = Math.min(224, width - 16),
              tipHeight = 178;
            const tip = tooltipPosition(x, y, width, height, tipWidth, tipHeight);
            expect(tip.left).toBeGreaterThanOrEqual(8);
            expect(tip.top).toBeGreaterThanOrEqual(8);
            expect(tip.left + tipWidth).toBeLessThanOrEqual(width - 8);
            expect(tip.top + tipHeight).toBeLessThanOrEqual(height - 8);
          }
  });
  it('discards old hidden-volume preferences and disallows a zero-opacity volume panel', () => {
    const prefs = parsePreferences('{"volume":false,"volumeOpacity":0,"volumeType":"line"}');
    expect(prefs).not.toHaveProperty('volume');
    expect(prefs.volumeType).toBe('line');
    expect(prefs.volumeOpacity).toBeGreaterThan(0);
  });
  it('keeps exact four-place currency values and safe percentage formatting', () => {
    expect(priceFormat(123.4, 'absolute', 1, 'USD')).toBe('$123.4000');
    expect(priceFormat(0, 'percent', 0, 'USD')).toBe('—');
    expect(priceFormat(100, 'percent', 100, 'USD')).toBe('0.0000%');
  });
});
