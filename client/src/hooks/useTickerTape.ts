import { useEffect, useState } from 'react';
import { TAPE_SYMBOLS, type TapeSnapshot, type TapeEntry } from '../../../shared/tape';
let request: { promise: Promise<TapeSnapshot>; expires: number } | null = null;
const validDay = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
export function parseTape(input: unknown): TapeSnapshot {
  if (!input || typeof input !== 'object') throw new Error('Invalid ticker tape response.');
  const snapshot = input as Partial<TapeSnapshot>;
  if (
    !Array.isArray(snapshot.entries) ||
    snapshot.entries.length !== TAPE_SYMBOLS.length ||
    typeof snapshot.generatedAt !== 'string' ||
    !Number.isFinite(Date.parse(snapshot.generatedAt))
  )
    throw new Error('Invalid ticker tape response.');
  const valid = snapshot.entries.every((value: unknown, i) => {
    if (!value || typeof value !== 'object') return false;
    const entry = value as Record<string, unknown>;
    if (entry.symbol !== TAPE_SYMBOLS[i]) return false;
    if (entry.status === 'unavailable') return typeof entry.reason === 'string';
    const percent = (v: unknown) => v === null || (typeof v === 'number' && Number.isFinite(v));
    return (
      entry.status === 'available' &&
      percent(entry.highChange) &&
      percent(entry.lowChange) &&
      validDay(entry.latestDay) &&
      validDay(entry.previousDay) &&
      String(entry.previousDay) < String(entry.latestDay) &&
      typeof entry.fetchedAt === 'string' &&
      Number.isFinite(Date.parse(entry.fetchedAt))
    );
  });
  if (!valid) throw new Error('Invalid ticker tape entries.');
  return snapshot as TapeSnapshot;
}
function loadTape(force = false): Promise<TapeSnapshot> {
  if (!force && request && request.expires > Date.now()) return request.promise;
  const promise = fetch('/api/market-tape', { signal: AbortSignal.timeout(120_000) }).then(
    async (response) => {
      if (!response.ok) throw new Error('Market tape temporarily unavailable.');
      return parseTape(await response.json());
    },
  );
  const current = { promise, expires: Date.now() + 3_600_000 };
  request = current;
  void promise.catch(() => {
    if (request === current) request = null;
  });
  return promise;
}
export function useTickerTape() {
  const [entries, setEntries] = useState<TapeEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setFailed(false);
    setEntries(null);
    void loadTape(attempt > 0)
      .then((snapshot) => {
        if (active) setEntries(snapshot.entries);
      })
      .catch(() => {
        if (active) {
          setFailed(true);
          setEntries(
            TAPE_SYMBOLS.map((symbol) => ({
              symbol,
              status: 'unavailable',
              reason: 'Market tape temporarily unavailable. Select to load this symbol.',
            })),
          );
        }
      });
    // Shared promise survives StrictMode remounts; main-symbol requests are independent.
    return () => {
      active = false;
    };
  }, [attempt]);
  return { entries, failed, retry: () => setAttempt((n) => n + 1) };
}
