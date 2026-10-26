import { describe, it, expect } from 'vitest';
import { aggregateChart } from '../src/aggregate';
import { yahooFixture } from './fixture';
const at = '2026-10-23T12:00:00Z';
describe('daily aggregation', () => {
  it('uses arithmetic means of intraday highs/lows, rounds once, and sums integer volume', () => {
    expect(aggregateChart(yahooFixture(), at).days).toEqual([
      { day: '2026-10-20', highAverage: 103.5556, lowAverage: 100.5556, volume: 300 },
      { day: '2026-10-21', highAverage: 110, lowAverage: 107, volume: 0 },
    ]);
  });
  it('groups by exchange day rather than UTC, including a DST boundary', () => {
    const result = aggregateChart(
      yahooFixture({
        timestamp: [
          Date.parse('2026-11-02T02:00Z') / 1000,
          Date.parse('2026-11-02T05:00Z') / 1000,
          Date.parse('2026-11-02T05:15Z') / 1000,
        ],
      }),
      at,
    );
    expect(result.days.map((d) => d.day)).toEqual(['2026-11-01', '2026-11-02']);
    expect(result.days[0]!.volume).toBe(100);
  });
  it('sorts dates and drops repeated timestamps without double-counting volume', () => {
    const fixture = yahooFixture({ timestamp: [1792589400, 1792503000, 1792589400] });
    const result = aggregateChart(fixture, at);
    expect(result.days.map((d) => d.day)).toEqual([...result.days.map((d) => d.day)].sort());
    expect(result.days.reduce((sum, d) => sum + d.volume, 0)).toBe(300);
    expect(result.skippedBars).toBe(1);
  });
  it('skips incomplete candles as units and retains zero volume', () => {
    const fixture = yahooFixture({
      indicators: {
        quote: [{ high: [null, 104, 110], low: [99, 101, 107], volume: [100, 200, 0] }],
      },
    });
    const result = aggregateChart(fixture, at);
    expect(result.days[0]).toEqual({
      day: '2026-10-20',
      highAverage: 104,
      lowAverage: 101,
      volume: 200,
    });
    expect(result.skippedBars).toBe(1);
  });
  it.each([NaN, Infinity, -1, '102'])(
    'rejects invalid numeric price %s without coercion',
    (value) => {
      const fixture = yahooFixture({
        indicators: {
          quote: [{ high: [value, 104, 110], low: [99, 101, 107], volume: [100, 200, 0] }],
        },
      });
      expect(aggregateChart(fixture, at).skippedBars).toBe(1);
    },
  );
  it.each([null, -1, 1.2, Infinity, '12'])('omits candles with invalid volume %s', (value) => {
    const fixture = yahooFixture({
      indicators: {
        quote: [{ high: [102, 104, 110], low: [99, 101, 107], volume: [value, 200, 0] }],
      },
    });
    expect(aggregateChart(fixture, at).days[0]!.volume).toBe(200);
  });
  it('omits inverted highs/lows and invalid timestamps', () => {
    const fixture = yahooFixture({
      timestamp: [null, 1792503000, 1792589400],
      indicators: { quote: [{ high: [102, 99, 110], low: [99, 101, 107], volume: [100, 200, 0] }] },
    });
    expect(aggregateChart(fixture, at).skippedBars).toBe(2);
  });
  it.each([
    {},
    { chart: { result: [{ meta: {} }] } },
    yahooFixture({ meta: { exchangeTimezoneName: 'invalid', currency: 'USD' } }),
    yahooFixture({ indicators: { quote: [{ high: [1], low: [0], volume: [0] }] } }),
  ])('rejects malformed structure or mismatched arrays', (value) => {
    expect(() => aggregateChart(value, at)).toThrow(expect.objectContaining({ status: 502 }));
  });
  it('returns no-data errors for empty and entirely null candles', () => {
    expect(() => aggregateChart({ chart: { result: [], error: null } }, at)).toThrow(
      expect.objectContaining({ status: 422 }),
    );
    expect(() =>
      aggregateChart(
        yahooFixture({ timestamp: [], indicators: { quote: [{ high: [], low: [], volume: [] }] } }),
        at,
      ),
    ).toThrow(expect.objectContaining({ status: 422 }));
  });
  it('maps Yahoo invalid-symbol envelopes to a 404', () => {
    expect(() =>
      aggregateChart({ chart: { result: null, error: { code: 'Not Found' } } }, at),
    ).toThrow(expect.objectContaining({ status: 404 }));
  });
});
