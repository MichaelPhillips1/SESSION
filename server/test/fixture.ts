export function yahooFixture(overrides: Record<string, unknown> = {}) {
  return {
    chart: {
      error: null,
      result: [
        {
          meta: { exchangeTimezoneName: 'America/New_York', currency: 'USD' },
          timestamp: [
            Date.parse('2026-10-20T13:30Z') / 1000,
            Date.parse('2026-10-20T13:45Z') / 1000,
            Date.parse('2026-10-21T13:30Z') / 1000,
          ],
          indicators: {
            quote: [
              {
                high: [102.123456, 104.987654, 110],
                low: [99.123456, 101.987654, 107],
                volume: [100, 200, 0],
              },
            ],
          },
          ...overrides,
        },
      ],
    },
  };
}
export const dailyFixture = {
  days: [{ day: '2026-10-20', highAverage: 103.5556, lowAverage: 100.5556, volume: 300 }],
  currency: 'USD',
  timezone: 'America/New_York',
  fetchedAt: '2026-10-23T12:00:00Z',
  skippedBars: 0,
};
