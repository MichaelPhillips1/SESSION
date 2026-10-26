import { describe, it, expect, vi } from 'vitest';
import { createYahooProvider } from '../src/yahoo';
import { yahooFixture } from './fixture';
describe('Yahoo HTTP boundary', () => {
  it('always requests one month of 15-minute regular-session data with a user agent', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json(yahooFixture()));
    const result = await createYahooProvider(fetcher)('^GSPC');
    const [url, options] = fetcher.mock.calls[0]!;
    expect(String(url)).toContain('/chart/%5EGSPC?');
    expect(new URL(String(url)).searchParams.get('range')).toBe('1mo');
    expect(new URL(String(url)).searchParams.get('interval')).toBe('15m');
    expect(new URL(String(url)).searchParams.get('includePrePost')).toBe('false');
    expect(options?.headers).toHaveProperty('User-Agent');
    expect(result.days).toHaveLength(2);
  });
  it.each([
    [404, 404],
    [429, 503],
    [500, 502],
    [401, 502],
  ])('maps HTTP %s to %s', async (upstream, status) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('', { status: upstream }));
    await expect(createYahooProvider(fetcher)('AAPL')).rejects.toMatchObject({ status });
  });
  it('handles broken JSON and network errors', async () => {
    await expect(
      createYahooProvider(vi.fn().mockResolvedValue(new Response('<html>')))('AAPL'),
    ).rejects.toMatchObject({ code: 'INVALID_UPSTREAM_DATA' });
    await expect(
      createYahooProvider(vi.fn().mockRejectedValue(new TypeError('fetch failed')))('AAPL'),
    ).rejects.toMatchObject({ code: 'UPSTREAM_UNAVAILABLE' });
  });
  it('aborts on deadlines instead of leaving requests pending', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(
        (_url, options) =>
          new Promise((_resolve, reject) =>
            options!.signal!.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            ),
          ),
      );
    await expect(createYahooProvider(fetcher, 5)('AAPL')).rejects.toMatchObject({
      status: 504,
      code: 'UPSTREAM_TIMEOUT',
    });
  });
  it('rejects oversized responses', async () => {
    await expect(
      createYahooProvider(vi.fn().mockResolvedValue(new Response('x'.repeat(2_000_001))))('AAPL'),
    ).rejects.toMatchObject({ code: 'INVALID_UPSTREAM_DATA' });
  });
});
