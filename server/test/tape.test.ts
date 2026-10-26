import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { aggregateChart } from '../src/aggregate';
import { completedPair, TapeService } from '../src/tape';
import { StockService } from '../src/service';
import { createApp } from '../src/app';
import { AppError } from '../src/errors';
import { TAPE_SYMBOLS } from '../../shared/tape';
const epoch = (value: string) => Date.parse(value) / 1000;
function scheduled(
  days = ['2026-10-21', '2026-10-22', '2026-10-23'],
  fetchedAt = '2026-10-24T12:00:00Z',
  hours = ['13:30', '20:00'],
) {
  const periods = days.map((day) => ({
    start: epoch(`${day}T${hours[0]}Z`),
    end: epoch(`${day}T${hours[1]}Z`),
  }));
  const timestamp: number[] = [],
    high: number[] = [],
    low: number[] = [],
    volume: number[] = [];
  periods.forEach((p, i) => {
    for (let time = p.start; time < p.end; time += 900) {
      timestamp.push(time);
      high.push(110 + i);
      low.push(100 - i);
      volume.push(10);
    }
  });
  return {
    payload: {
      chart: {
        error: null,
        result: [
          {
            meta: {
              currency: 'USD',
              exchangeTimezoneName: 'America/New_York',
              tradingPeriods: periods.map((p) => [p]),
              currentTradingPeriod: { regular: periods.at(-1) },
            },
            timestamp,
            indicators: { quote: [{ high, low, volume }] },
          },
        ],
      },
    },
    fetchedAt,
  };
}
function result(...args: Parameters<typeof scheduled>) {
  const { payload, fetchedAt } = scheduled(...args);
  return aggregateChart(payload, fetchedAt);
}
const now = () => Date.parse('2026-10-24T12:00:00Z');
describe('completed regular-session selection', () => {
  it('excludes an open session and independently compares high and low averages', () => {
    const value = result(undefined, '2026-10-23T18:00:00Z');
    const pair = completedPair(value, Date.parse('2026-10-23T18:00:00Z'))!;
    expect(pair.latest.day).toBe('2026-10-22');
    expect(pair.previous.day).toBe('2026-10-21');
    expect(pair.latest.highAverage).toBe(111);
    expect(pair.latest.lowAverage).toBe(99);
  });
  it('includes the latest session after its actual close, retaining Friday through the weekend', () => {
    const pair = completedPair(result(), now())!;
    expect(pair.latest.day).toBe('2026-10-23');
    expect(pair.previous.day).toBe('2026-10-22');
  });
  it('uses a scheduled early close and skips an absent holiday', () => {
    const value = result(['2026-11-24', '2026-11-25', '2026-11-27'], '2026-11-27T18:01:00Z', [
      '14:30',
      '18:00',
    ]);
    expect(completedPair(value, Date.parse('2026-11-27T18:01:00Z'))!.latest.day).toBe('2026-11-27');
    expect(completedPair(value, Date.parse('2026-11-27T17:59:00Z'))!.latest.day).toBe('2026-11-25');
    expect(completedPair(value, Date.parse('2026-11-27T18:01:00Z'))!.previous.day).toBe(
      '2026-11-25',
    );
  });
  it('uses date-specific UTC boundaries across daylight-saving changes', () => {
    const { payload, fetchedAt } = scheduled(['2026-10-30', '2026-11-02'], '2026-11-03T12:00:00Z', [
      '14:30',
      '21:00',
    ]);
    const first = payload.chart.result[0]!;
    const period = first.meta.tradingPeriods[0]![0]!;
    period.start -= 3600;
    period.end -= 3600;
    // Shift corresponding Friday candles into EDT while Monday remains EST.
    first.timestamp = first.timestamp.map((t, i) => (i < 26 ? t - 3600 : t));
    const value = aggregateChart(payload, fetchedAt);
    expect(value.sessions!.every((s) => s.covered)).toBe(true);
    expect(completedPair(value, Date.parse(fetchedAt))!.latest.day).toBe('2026-11-02');
  });
  it('does not promote a pre-close snapshot when time advances', () => {
    expect(completedPair(result(undefined, '2026-10-23T19:59:00Z'), now())).toBeNull();
  });
  it('rejects incomplete final-session coverage rather than silently skipping that trading day', () => {
    const { payload, fetchedAt } = scheduled();
    payload.chart.result[0]!.indicators.quote[0]!.high.pop();
    payload.chart.result[0]!.timestamp.pop();
    payload.chart.result[0]!.indicators.quote[0]!.low.pop();
    payload.chart.result[0]!.indicators.quote[0]!.volume.pop();
    const value = aggregateChart(payload, fetchedAt);
    expect(value.sessions!.at(-1)!.covered).toBe(false);
    expect(completedPair(value, now())).toBeNull();
  });
  it('requires actual schedules and at least two sessions', () => {
    const value = result();
    value.sessions = [];
    expect(completedPair(value, now())).toBeNull();
    expect(completedPair(result(['2026-10-23']), now())).toBeNull();
  });
});
describe('ticker batch caching and HTTP delivery', () => {
  it('preserves all 28 symbols, bounds concurrency to four, and coalesces/cache-hits batches', async () => {
    let active = 0,
      max = 0,
      clock = now();
    const stock = result();
    const provider = vi.fn(async () => {
      active++;
      max = Math.max(max, active);
      await new Promise((resolve) => setTimeout(resolve, 2));
      active--;
      return stock;
    });
    const tape = new TapeService(new StockService(provider, 60_000, 100, () => clock), () => clock);
    const [a, b] = await Promise.all([tape.get(), tape.get()]);
    expect(a).toEqual(b);
    expect(a.entries.map((e) => e.symbol)).toEqual([...TAPE_SYMBOLS]);
    expect(max).toBe(4);
    expect(provider).toHaveBeenCalledTimes(28);
    expect(provider).toHaveBeenCalledWith('MSFT', '5d');
    const first = a.entries[0]!;
    expect(first.status).toBe('available');
    if (first.status === 'available') {
      expect(first.highChange).toBeCloseTo(100 / 111);
      expect(first.lowChange).toBeCloseTo(-100 / 99);
    }
    await tape.get();
    expect(provider).toHaveBeenCalledTimes(28);
    clock += 3_600_001;
    await tape.get();
    expect(provider).toHaveBeenCalledTimes(56);
  });
  it('caches individual failures briefly without blocking successful symbols', async () => {
    let clock = now();
    const provider = vi.fn(async (symbol: string) => {
      if (symbol === 'NVDA') throw new AppError(503, 'UPSTREAM_RATE_LIMIT', 'Please try later.');
      return result();
    });
    const tape = new TapeService(new StockService(provider, 60_000, 100, () => clock), () => clock);
    const snapshot = await tape.get();
    expect(snapshot.entries[1]).toEqual({
      symbol: 'NVDA',
      status: 'unavailable',
      reason: 'Please try later.',
    });
    expect(snapshot.entries.filter((e) => e.status === 'available')).toHaveLength(27);
    await tape.get();
    expect(provider).toHaveBeenCalledTimes(28);
    clock += 60_001;
    await tape.get();
    expect(provider).toHaveBeenCalledTimes(29);
  });
  it('falls back to monthly history when five days cannot supply a verified pair', async () => {
    const provider = vi.fn(async (_symbol: string, range?: string) =>
      range === '5d' ? result(['2026-10-23']) : result(),
    );
    const tape = new TapeService(new StockService(provider), now);
    expect((await tape.get()).entries.every((e) => e.status === 'available')).toBe(true);
    expect(provider).toHaveBeenCalledTimes(56);
  });
  it('expires a pre-close tape shortly after the actual upcoming session end', async () => {
    let clock = Date.parse('2026-10-23T19:30:00Z');
    const provider = vi.fn(async () => result(undefined, new Date(clock).toISOString()));
    const tape = new TapeService(new StockService(provider, 60_000, 100, () => clock), () => clock);
    expect((await tape.get()).entries[0]).toMatchObject({ latestDay: '2026-10-22' });
    clock = Date.parse('2026-10-23T20:02:00Z');
    expect((await tape.get()).entries[0]).toMatchObject({ latestDay: '2026-10-23' });
    expect(provider).toHaveBeenCalledTimes(56);
  });
  it('returns per-symbol insufficient history instead of invented percentages', async () => {
    const provider = vi.fn(async () => result(['2026-10-23']));
    const response = await request(createApp({ provider, now }))
      .get('/api/market-tape')
      .expect(200);
    expect(response.body.entries).toHaveLength(28);
    expect(response.body.entries.every((e: { status: string }) => e.status === 'unavailable')).toBe(
      true,
    );
  });
  it('does not alter the mandatory assessment endpoint or allow tape failure to break it', async () => {
    const provider = vi.fn(async (symbol: string) => {
      if (symbol === 'NVDA') throw new AppError(502, 'UPSTREAM_ERROR', 'Unavailable');
      return result();
    });
    const app = createApp({ provider, now });
    const tape = await request(app).get('/api/market-tape').expect(200);
    expect(tape.body.entries[1].status).toBe('unavailable');
    const response = await request(app).get('/api/stocks/MSFT').expect(200);
    expect(Object.keys(response.body[0]).sort()).toEqual([
      'day',
      'highAverage',
      'lowAverage',
      'volume',
    ]);
    expect(response.body).toEqual(result().days);
  });
});
