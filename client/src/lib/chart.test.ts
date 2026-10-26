import { describe, it, expect } from 'vitest';
import { constrainView, rangeView, zoomView, fitView, visibleDays, dayNumber } from './viewport';
import { windowReference, priceDomain } from './chartMath';
import { parsePreferences, defaults } from '../hooks/usePreferences';
import { parseDays } from '../hooks/useStock';
import { parseTape } from '../hooks/useTickerTape';
import { priceFormat, changeFormat } from './format';
import { percentChange, TAPE_SYMBOLS } from '../../../shared/tape';
const days = [
  '2026-10-01',
  '2026-10-05',
  '2026-10-12',
  '2026-10-19',
  '2026-10-20',
  '2026-10-21',
  '2026-10-22',
  '2026-10-23',
].map((day, i) => ({ day, highAverage: 110 - i, lowAverage: 100 - i, volume: 1000 }));
describe('calendar viewport and window-relative chart math', () => {
  it('enforces seven calendar days instead of seven sessions and clamps both ends', () => {
    const full = fitView(days);
    expect(constrainView({ start: full.start - 10, span: 100 }, days)).toEqual(full);
    const minimal = constrainView({ start: full.start + 100, span: 1 }, days);
    expect(minimal).toEqual({ start: dayNumber('2026-10-17'), span: 7 });
    expect(visibleDays(days, minimal)).toHaveLength(5);
    expect(zoomView(minimal, days, 0.8, 1)).toEqual(minimal);
    expect(rangeView(days, 7)).toEqual(minimal);
    expect(rangeView(days, 14).span).toBe(14);
  });
  it('retains every session when history is shorter than seven days', () => {
    const short = days.slice(-2);
    const full = fitView(short);
    expect(full.span).toBe(2);
    expect(zoomView(full, short, 0.01)).toEqual(full);
    expect(rangeView(short, 7)).toEqual(full);
    expect(zoomView(fitView(days.slice(-1)), days.slice(-1), 0.01).span).toBe(1);
  });
  it('never leaves a sparse history window empty or navigates beyond fetched dates', () => {
    const sparse = [days[0]!, days.at(-1)!];
    const view = constrainView({ start: dayNumber('2026-10-09'), span: 7 }, sparse);
    expect(visibleDays(sparse, view).length).toBeGreaterThan(0);
    expect(view.start).toBeGreaterThanOrEqual(fitView(sparse).start);
    expect(view.start + view.span).toBeLessThanOrEqual(
      fitView(sparse).start + fitView(sparse).span,
    );
  });
  it('updates the common axis baseline when the leftmost visible session changes', () => {
    const week = rangeView(days, 7),
      previous = constrainView({ ...week, start: week.start - 7 }, days);
    expect(windowReference(visibleDays(days, week))).toBe(102);
    expect(windowReference(visibleDays(days, previous))).toBe(103);
    expect(windowReference(days)).toBe(105);
    const zoomed = zoomView(fitView(days), days, 0.5, 1);
    expect(windowReference(visibleDays(days, zoomed))).not.toBe(windowReference(days));
  });
  it.each([
    ['rising', 110, 100, 10],
    ['falling', 90, 100, -10],
    ['unchanged', 100, 100, 0],
  ])(
    'shows %s series changes from the series own leftmost value',
    (_name, value, base, expected) => {
      expect(percentChange(Number(value), Number(base))).toBe(expected);
    },
  );
  it('keeps both series fully within the automatic padded domain, including flat/zero data', () => {
    for (const values of [days, days.slice(-2), [{ ...days[0]!, highAverage: 0, lowAverage: 0 }]]) {
      const { lo, hi } = priceDomain(values);
      expect(lo).toBeLessThan(Math.min(...values.map((d) => d.lowAverage)));
      expect(hi).toBeGreaterThan(Math.max(...values.map((d) => d.highAverage)));
      expect(Number.isFinite(lo) && Number.isFinite(hi)).toBe(true);
    }
  });
  it('a falling visible window is negative even when prices exceed an older offscreen baseline', () => {
    const history = [
      { day: '2026-10-01', highAverage: 102, lowAverage: 98, volume: 1 },
      { day: '2026-10-19', highAverage: 202, lowAverage: 198, volume: 1 },
      { day: '2026-10-23', highAverage: 192, lowAverage: 188, volume: 1 },
    ];
    const visible = visibleDays(history, rangeView(history, 7));
    expect(windowReference(visible)).toBe(200);
    expect(priceFormat(190, 'percent', windowReference(visible), 'USD')).toBe('-5.0000%');
    expect(percentChange(192, visible[0]!.highAverage)).toBeLessThan(0);
    expect(percentChange(188, visible[0]!.lowAverage)).toBeLessThan(0);
  });
  it('formats axis percentages using the common midpoint, separately from own-series changes', () => {
    expect(priceFormat(110, 'percent', 105, 'USD')).toBe('+4.7619%');
    expect(priceFormat(100, 'percent', 105, 'USD')).toBe('-4.7619%');
    expect(changeFormat(percentChange(90, 100), 4)).toBe('-10.0000%');
  });
});
describe('safe formatting and preferences', () => {
  it.each([
    [0, '0.00%'],
    [1.234, '+1.23%'],
    [-1.234, '-1.23%'],
    [0.0001, '+<0.01%'],
    [-0.0001, '-<0.01%'],
    [null, '—'],
  ])('preserves signed movement %s as %s', (value, expected) =>
    expect(changeFormat(value as number | null)).toBe(expected),
  );
  it('does not divide by a zero previous value', () => expect(percentChange(10, 0)).toBeNull());
  it('recovers invalid preferences and discards obsolete grid state', () => {
    expect(parsePreferences('bad json')).toEqual(defaults);
    const parsed = parsePreferences(
      '{"theme":"light","highWidth":100,"highColor":"bad","mode":"oops","fillOpacity":0.4,"grid":false}',
    );
    expect(parsed).toMatchObject({
      theme: 'light',
      highWidth: 2,
      highColor: defaults.highColor,
      mode: 'absolute',
      fillOpacity: 0.4,
    });
    expect(parsed).not.toHaveProperty('grid');
  });
  it('rejects malformed daily values and unordered records', () => {
    expect(() => parseDays([{ ...days[0], highAverage: '110' }])).toThrow();
    expect(() => parseDays(days.toReversed())).toThrow();
    expect(parseDays(days)).toEqual(days);
  });
  it('rejects a reordered/partial ticker snapshot instead of attaching values to wrong symbols', () => {
    const entries = TAPE_SYMBOLS.map((symbol) => ({
      symbol,
      status: 'unavailable',
      reason: 'test',
    }));
    const payload = { entries, generatedAt: '2026-10-24T12:00:00Z' };
    expect(parseTape(payload).entries).toHaveLength(28);
    expect(() => parseTape({ ...payload, entries: entries.toReversed() })).toThrow();
    expect(() => parseTape({ ...payload, entries: entries.slice(1) })).toThrow();
  });
});
