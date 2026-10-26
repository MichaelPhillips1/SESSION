import { describe, it, expect, vi } from 'vitest';
import { StockService } from '../src/service';
import { dailyFixture } from './fixture';
describe('stock service cache', () => {
  it('deduplicates concurrent requests and expires values', async () => {
    let now = 0;
    const provider = vi.fn().mockResolvedValue(dailyFixture);
    const service = new StockService(provider, 100, 2, () => now);
    await Promise.all([service.get('AAPL'), service.get('AAPL')]);
    expect(provider).toHaveBeenCalledTimes(1);
    expect((await service.get('AAPL')).cached).toBe(true);
    now = 101;
    await service.get('AAPL');
    expect(provider).toHaveBeenCalledTimes(2);
  });
  it('evicts oldest entries when capacity is reached', async () => {
    const provider = vi.fn().mockResolvedValue(dailyFixture);
    const service = new StockService(provider, 1000, 1);
    await service.get('AAPL');
    await service.get('TSLA');
    await service.get('AAPL');
    expect(provider).toHaveBeenCalledTimes(3);
  });
  it('never caches rejected requests', async () => {
    const provider = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(dailyFixture);
    const service = new StockService(provider);
    await expect(service.get('AAPL')).rejects.toThrow('offline');
    await service.get('AAPL');
    expect(provider).toHaveBeenCalledTimes(2);
  });
});
