import type { DailyStock, StockResult } from '../../shared/types.js';
import {
  TAPE_SYMBOLS,
  percentChange,
  type TapeEntry,
  type TapeSnapshot,
  type TapeSymbol,
} from '../../shared/tape.js';
import type { StockService } from './service.js';
import { AppError } from './errors.js';

export function completedPair(
  result: StockResult,
  now: number,
): { latest: DailyStock; previous: DailyStock } | null {
  const closed = result.sessions
    ?.filter((s) => s.end * 1000 <= now)
    .sort((a, b) => b.day.localeCompare(a.day));
  if (!closed || closed.length < 2) return null;
  const [latestSession, previousSession] = closed;
  const fetched = Date.parse(result.fetchedAt);
  // A pre-close snapshot must not become a completed session just because its cache ages.
  if (
    !Number.isFinite(fetched) ||
    !latestSession!.covered ||
    !previousSession!.covered ||
    latestSession!.end * 1000 > fetched ||
    previousSession!.end * 1000 > fetched
  )
    return null;
  const latest = result.days.find((d) => d.day === latestSession!.day);
  const previous = result.days.find((d) => d.day === previousSession!.day);
  return latest && previous ? { latest, previous } : null;
}

const HOUR = 3_600_000;
/** One ordered batch, four workers, per-symbol daily-data caches and short failure caching.
 * Requests are demand-driven; neither animation loops nor timers call the provider. */
export class TapeService {
  private cache = new Map<TapeSymbol, { entry: TapeEntry; expires: number }>();
  private pending: Promise<TapeSnapshot> | null = null;
  constructor(
    private stocks: StockService,
    private now = Date.now,
  ) {}
  get(): Promise<TapeSnapshot> {
    if (this.pending) return this.pending;
    this.pending = this.load().finally(() => {
      this.pending = null;
    });
    return this.pending;
  }
  private async one(symbol: TapeSymbol): Promise<TapeEntry> {
    const cached = this.cache.get(symbol);
    if (cached && cached.expires > this.now()) return cached.entry;
    let entry: TapeEntry;
    let expires = this.now() + 60_000;
    try {
      let { result } = await this.stocks.get(symbol, '5d');
      let pair = completedPair(result, this.now());
      // Rare short/partial history: retry using the existing assessment month provider.
      if (!pair) {
        result = (await this.stocks.get(symbol)).result;
        pair = completedPair(result, this.now());
      }
      if (!pair)
        throw new AppError(
          422,
          'INSUFFICIENT_SESSIONS',
          'Two completed sessions with verified candle coverage are not available.',
        );
      entry = {
        symbol,
        status: 'available',
        latestDay: pair.latest.day,
        previousDay: pair.previous.day,
        highChange: percentChange(pair.latest.highAverage, pair.previous.highAverage),
        lowChange: percentChange(pair.latest.lowAverage, pair.previous.lowAverage),
        fetchedAt: result.fetchedAt,
      };
      const nextClose = result.sessions
        ?.filter((s) => s.end * 1000 > this.now())
        .map((s) => s.end * 1000 + 60_000);
      expires = Math.min(this.now() + HOUR, ...(nextClose ?? []));
    } catch (error) {
      entry = {
        symbol,
        status: 'unavailable',
        reason:
          error instanceof AppError
            ? error.message
            : 'Session changes are temporarily unavailable.',
      };
    }
    this.cache.set(symbol, { entry, expires });
    return entry;
  }
  private async load(): Promise<TapeSnapshot> {
    const entries: TapeEntry[] = new Array(TAPE_SYMBOLS.length);
    let cursor = 0;
    await Promise.all(
      Array.from({ length: 4 }, async () => {
        while (cursor < TAPE_SYMBOLS.length) {
          const i = cursor++;
          entries[i] = await this.one(TAPE_SYMBOLS[i]!);
        }
      }),
    );
    return { entries, generatedAt: new Date(this.now()).toISOString() };
  }
}
