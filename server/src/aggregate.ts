import type { StockResult } from '../../shared/types.js';
import { AppError, invalidData } from './errors.js';
import { sessionCoverage } from './sessions.js';

type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as RecordValue)
    : undefined;
const validPrice = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

/** Validate the boundary before doing arithmetic. Invalid/incomplete candles are omitted as a unit. */
export function aggregateChart(payload: unknown, fetchedAt: string): StockResult {
  const chart = record(record(payload)?.chart);
  if (!chart) throw invalidData();
  if (chart.error) {
    const code = record(chart.error)?.code;
    if (code === 'Not Found')
      throw new AppError(
        404,
        'SYMBOL_NOT_FOUND',
        'No stock was found for that symbol. Check the ticker and try again.',
      );
    throw new AppError(
      502,
      'UPSTREAM_ERROR',
      'Yahoo Finance could not provide this symbol. Please try again.',
    );
  }
  const result = Array.isArray(chart.result) ? record(chart.result[0]) : undefined;
  if (!result)
    throw new AppError(
      422,
      'NO_DATA',
      'No intraday data is available for this symbol in the requested period.',
    );
  const meta = record(result.meta);
  const timezone = meta?.exchangeTimezoneName;
  const currency = meta?.currency;
  if (typeof timezone !== 'string' || typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency))
    throw invalidData();
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    throw invalidData();
  }
  const timestamps = result.timestamp;
  const indicators = record(result.indicators);
  const quote = Array.isArray(indicators?.quote) ? record(indicators.quote[0]) : undefined;
  if (
    !Array.isArray(timestamps) ||
    !quote ||
    !Array.isArray(quote.high) ||
    !Array.isArray(quote.low) ||
    !Array.isArray(quote.volume)
  )
    throw invalidData();
  if ([quote.high, quote.low, quote.volume].some((values) => values.length !== timestamps.length))
    throw invalidData();
  const highValues: unknown[] = quote.high;
  const lowValues: unknown[] = quote.low;
  const volumeValues: unknown[] = quote.volume;
  const buckets = new Map<string, { high: number; low: number; volume: number; count: number }>();
  const seen = new Set<number>();
  let skippedBars = 0;
  timestamps.forEach((timestamp: unknown, i: number) => {
    const high: unknown = highValues[i];
    const low: unknown = lowValues[i];
    const volume: unknown = volumeValues[i];
    if (
      typeof timestamp !== 'number' ||
      !Number.isSafeInteger(timestamp) ||
      timestamp < 0 ||
      !validPrice(high) ||
      !validPrice(low) ||
      high < low ||
      typeof volume !== 'number' ||
      !Number.isSafeInteger(volume) ||
      volume < 0 ||
      seen.has(timestamp)
    ) {
      skippedBars++;
      return;
    }
    const date = new Date(timestamp * 1000);
    if (!Number.isFinite(date.getTime())) {
      skippedBars++;
      return;
    }
    seen.add(timestamp);
    const parts = formatter.formatToParts(date);
    const part = (type: string) => parts.find((p) => p.type === type)!.value;
    const day = `${part('year')}-${part('month')}-${part('day')}`;
    const bucket = buckets.get(day) ?? { high: 0, low: 0, volume: 0, count: 0 };
    bucket.high += high;
    bucket.low += low;
    bucket.volume += volume;
    bucket.count++;
    if (
      !Number.isFinite(bucket.high) ||
      !Number.isFinite(bucket.low) ||
      !Number.isSafeInteger(bucket.volume)
    )
      throw invalidData();
    buckets.set(day, bucket);
  });
  const days = [...buckets]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, b]) => ({
      day,
      lowAverage: Number((b.low / b.count).toFixed(4)),
      highAverage: Number((b.high / b.count).toFixed(4)),
      volume: b.volume,
    }));
  if (!days.length)
    throw new AppError(
      422,
      'NO_DATA',
      'No complete intraday candles are available for this symbol in the requested period.',
    );
  return {
    days,
    timezone,
    currency,
    fetchedAt,
    skippedBars,
    sessions: sessionCoverage(meta!, formatter, seen),
  };
}
