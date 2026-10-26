import type { StockResult } from '../../shared/types.js';
import type { StockProvider, YahooRange } from './yahoo.js';
import { AppError } from './errors.js';

export function normalizeSymbol(raw: string): string {
  const symbol = raw.trim().toUpperCase();
  if (!/^[A-Z0-9^][A-Z0-9.\-^=]{0,19}$/.test(symbol))
    throw new AppError(
      400,
      'INVALID_SYMBOL',
      'Enter a valid ticker, such as AAPL, TSLA, or BRK-B (maximum 20 characters).',
    );
  return symbol;
}

/** Bounded process-local cache. Concurrent identical requests share one upstream call. */
export class StockService {
  private cache = new Map<string, { result: StockResult; expires: number }>();
  private pending = new Map<string, Promise<StockResult>>();
  constructor(
    private provider: StockProvider,
    private ttlMs = 60_000,
    private capacity = 100,
    private now = Date.now,
  ) {}
  async get(
    symbol: string,
    range: YahooRange = '1mo',
  ): Promise<{ result: StockResult; cached: boolean }> {
    const key = `${range}:${symbol}`;
    const cached = this.cache.get(key);
    if (cached && cached.expires > this.now()) return { result: cached.result, cached: true };
    const inflight = this.pending.get(key);
    if (inflight) return { result: await inflight, cached: true };
    if (this.pending.size >= 30)
      throw new AppError(503, 'BUSY', 'The data service is busy. Please try again shortly.');
    const request = range === '1mo' ? this.provider(symbol) : this.provider(symbol, range);
    this.pending.set(key, request);
    try {
      const result = await request;
      this.cache.delete(key);
      if (this.cache.size >= this.capacity) this.cache.delete(this.cache.keys().next().value!);
      this.cache.set(key, { result, expires: this.now() + this.ttlMs });
      return { result, cached: false };
    } finally {
      this.pending.delete(key);
    }
  }
}
