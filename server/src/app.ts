import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { StockService, normalizeSymbol } from './service.js';
import { createYahooProvider, type StockProvider } from './yahoo.js';
import { AppError } from './errors.js';
import { TapeService } from './tape.js';

export function createApp(
  options: { provider?: StockProvider; staticDir?: string; now?: () => number } = {},
) {
  const app = express();
  const service = new StockService(
    options.provider ?? createYahooProvider(),
    60_000,
    100,
    options.now ?? Date.now,
  );
  const tape = new TapeService(service, options.now ?? Date.now);
  app.disable('x-powered-by');
  app.use(helmet());
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/api/market-tape', async (_req, res) => {
    res.set('Cache-Control', 'no-store').json(await tape.get());
  });
  app.get('/api/stocks/:symbol', async (req, res) => {
    const symbol = normalizeSymbol(req.params.symbol);
    const { result, cached } = await service.get(symbol);
    res
      .set({
        'Cache-Control': 'no-store',
        'X-Exchange-Timezone': result.timezone,
        'X-Currency': result.currency,
        'X-Fetched-At': result.fetchedAt,
        'X-Cache': cached ? 'HIT' : 'MISS',
        'X-Skipped-Bars': String(result.skippedBars),
      })
      .json(result.days);
  });
  app.use('/api', (_req, _res, next) =>
    next(new AppError(404, 'NOT_FOUND', 'API endpoint not found. Use /api/stocks/:symbol.')),
  );
  if (options.staticDir && existsSync(path.join(options.staticDir, 'index.html'))) {
    app.use(express.static(options.staticDir, { index: false, maxAge: '1h' }));
    app.get('/', (_req, res) =>
      res.sendFile(path.join(options.staticDir!, 'index.html'), {
        headers: { 'Cache-Control': 'no-cache' },
      }),
    );
  }
  app.use((_req, _res, next) => next(new AppError(404, 'NOT_FOUND', 'Page not found.')));
  const errors: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    if (error instanceof AppError) {
      if (error.code === 'UPSTREAM_RATE_LIMIT' || error.code === 'BUSY')
        res.set('Retry-After', '60');
      res.status(error.status).json({ error: { code: error.code, message: error.message } });
      return;
    }
    console.error(
      'Unexpected API error:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred. Please try again.',
      },
    });
  };
  app.use(errors);
  return app;
}
