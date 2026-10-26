import type { StockResult } from '../../shared/types.js';
import { aggregateChart } from './aggregate.js';
import { AppError, invalidData } from './errors.js';

export type YahooRange = '1mo' | '5d';
export type StockProvider = (symbol: string, range?: YahooRange) => Promise<StockResult>;
/** Injectable HTTP boundary keeps service and endpoint tests deterministic. */
export function createYahooProvider(
  fetcher: typeof fetch = fetch,
  timeoutMs = 8_000,
): StockProvider {
  return async (symbol, range = '1mo') => {
    const url = new URL(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`,
    );
    url.search = new URLSearchParams({
      interval: '15m',
      range,
      includePrePost: 'false',
    }).toString();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetcher(url, {
        signal: controller.signal,
        redirect: 'error',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
        },
      });
      if (response.status === 404)
        throw new AppError(
          404,
          'SYMBOL_NOT_FOUND',
          'No stock was found for that symbol. Check the ticker and try again.',
        );
      if (response.status === 429)
        throw new AppError(
          503,
          'UPSTREAM_RATE_LIMIT',
          'Yahoo Finance is limiting requests. Please wait a minute and try again.',
        );
      if (!response.ok)
        throw new AppError(
          502,
          'UPSTREAM_ERROR',
          'Yahoo Finance is temporarily unavailable. Please try again.',
        );
      // Bound decompressed response size as well as total request time.
      if (!response.body) throw invalidData();
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let length = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.length;
        if (length > 2_000_000) {
          await reader.cancel();
          throw invalidData();
        }
        chunks.push(value);
      }
      let payload: unknown;
      try {
        payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch {
        throw invalidData();
      }
      return aggregateChart(payload, new Date().toISOString());
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (controller.signal.aborted)
        throw new AppError(
          504,
          'UPSTREAM_TIMEOUT',
          'Yahoo Finance took too long to respond. Please try again.',
        );
      throw new AppError(
        502,
        'UPSTREAM_UNAVAILABLE',
        'Could not connect to Yahoo Finance. Please try again.',
      );
    } finally {
      clearTimeout(timer);
    }
  };
}
