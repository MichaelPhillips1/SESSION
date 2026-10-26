import { useCallback, useEffect, useRef, useState } from 'react';
import type { DailyStock } from '../../../shared/types';
export interface MarketData {
  days: DailyStock[];
  symbol: string;
  currency: string;
  timezone: string;
  fetchedAt: string;
  skippedBars: number;
}
export function parseDays(value: unknown): DailyStock[] {
  if (!Array.isArray(value)) throw new Error('The server returned an invalid response.');
  if (
    !value.every((d: unknown) => {
      if (!d || typeof d !== 'object') return false;
      const row = d as Record<string, unknown>;
      return (
        typeof row.day === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(row.day) &&
        typeof row.highAverage === 'number' &&
        Number.isFinite(row.highAverage) &&
        row.highAverage >= 0 &&
        typeof row.lowAverage === 'number' &&
        Number.isFinite(row.lowAverage) &&
        row.lowAverage >= 0 &&
        row.highAverage >= row.lowAverage &&
        typeof row.volume === 'number' &&
        Number.isSafeInteger(row.volume) &&
        row.volume >= 0
      );
    })
  )
    throw new Error('The server returned invalid daily values.');
  const days = value as DailyStock[];
  if (days.some((day, i) => i > 0 && day.day <= days[i - 1]!.day))
    throw new Error('The server returned unordered daily values.');
  return days;
}
export function useStock() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const active = useRef<AbortController | null>(null);
  const load = useCallback(async (input: string) => {
    const symbol = input.trim().toUpperCase();
    if (!/^[A-Z0-9^][A-Z0-9.\-^=]{0,19}$/.test(symbol)) {
      active.current?.abort();
      setLoading(false);
      setData(null);
      setError('Enter a valid ticker, such as AAPL, TSLA, or BRK-B.');
      return;
    }
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setLoading(true);
    setError('');
    setData(null);
    const timer = window.setTimeout(() => controller.abort('timeout'), 15_000);
    try {
      const response = await fetch(`/api/stocks/${encodeURIComponent(symbol)}`, {
        signal: controller.signal,
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const message = (body as { error?: { message?: unknown } })?.error?.message;
        throw new Error(
          typeof message === 'string' ? message : 'Could not load market data. Please try again.',
        );
      }
      const days = parseDays(body);
      const currency = response.headers.get('X-Currency') ?? 'USD';
      if (!/^[A-Z]{3}$/.test(currency)) throw new Error('The server returned an invalid currency.');
      if (!controller.signal.aborted)
        setData({
          days,
          symbol,
          currency,
          timezone: response.headers.get('X-Exchange-Timezone') ?? 'Exchange local time',
          fetchedAt: response.headers.get('X-Fetched-At') ?? '',
          skippedBars: Number(response.headers.get('X-Skipped-Bars') ?? 0),
        });
    } catch (err) {
      if (active.current !== controller) return;
      if (controller.signal.reason === 'timeout')
        setError('The request timed out. Please try again.');
      else if (!controller.signal.aborted)
        setError(
          err instanceof Error ? err.message : 'Could not load market data. Please try again.',
        );
    } finally {
      window.clearTimeout(timer);
      if (active.current === controller) setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load('AAPL');
    return () => active.current?.abort();
  }, [load]);
  return { data, loading, error, load };
}
