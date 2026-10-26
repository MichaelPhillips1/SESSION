import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { AppError } from '../src/errors';
import { dailyFixture } from './fixture';
describe('Express API contract', () => {
  it('normalizes symbols, returns the exact array contract and exposes metadata as headers', async () => {
    const provider = vi.fn().mockResolvedValue(dailyFixture);
    const app = createApp({ provider });
    const response = await request(app).get('/api/stocks/%20aapl%20').expect(200);
    expect(provider).toHaveBeenCalledWith('AAPL');
    expect(response.body).toEqual(dailyFixture.days);
    expect(Object.keys(response.body[0]).sort()).toEqual([
      'day',
      'highAverage',
      'lowAverage',
      'volume',
    ]);
    expect(response.headers['x-exchange-timezone']).toBe('America/New_York');
    expect(response.headers['x-currency']).toBe('USD');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-powered-by']).toBeUndefined();
    await request(app).get('/api/stocks/AAPL').expect('X-Cache', 'HIT');
    expect(provider).toHaveBeenCalledTimes(1);
  });
  it.each(['%24bad', 'A'.repeat(21), 'foo%20bar', '%3Cscript%3E'])(
    'rejects invalid input %s before upstream calls',
    async (symbol) => {
      const provider = vi.fn();
      const response = await request(createApp({ provider }))
        .get(`/api/stocks/${symbol}`)
        .expect(400);
      expect(response.body.error.code).toBe('INVALID_SYMBOL');
      expect(provider).not.toHaveBeenCalled();
    },
  );
  it.each([['BRK-B'], ['^GSPC'], ['BTC-USD'], ['EURUSD=X'], ['0700.HK']])(
    'accepts Yahoo symbol syntax %s',
    async (symbol) => {
      await request(createApp({ provider: vi.fn().mockResolvedValue(dailyFixture) }))
        .get(`/api/stocks/${encodeURIComponent(symbol)}`)
        .expect(200);
    },
  );
  it.each([404, 422, 502, 503, 504])('returns structured errors for status %s', async (status) => {
    const response = await request(
      createApp({
        provider: vi.fn().mockRejectedValue(new AppError(status, 'TEST_ERROR', 'Safe error')),
      }),
    )
      .get('/api/stocks/AAPL')
      .expect(status);
    expect(response.body).toEqual({ error: { code: 'TEST_ERROR', message: 'Safe error' } });
  });
  it('adds retry guidance for Yahoo rate limiting', async () => {
    await request(
      createApp({
        provider: vi.fn().mockRejectedValue(new AppError(503, 'UPSTREAM_RATE_LIMIT', 'Wait')),
      }),
    )
      .get('/api/stocks/AAPL')
      .expect('Retry-After', '60')
      .expect(503);
  });
  it('does not leak internal errors', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const response = await request(
      createApp({ provider: vi.fn().mockRejectedValue(new Error('secret')) }),
    )
      .get('/api/stocks/AAPL')
      .expect(500);
    expect(JSON.stringify(response.body)).not.toContain('secret');
  });
  it('returns health and JSON 404 responses', async () => {
    const app = createApp();
    await request(app).get('/api/health').expect(200, { status: 'ok' });
    await request(app).get('/api/stocks').expect(404);
    await request(app).get('/api/unknown').expect(404).expect('Content-Type', /json/);
  });
});
