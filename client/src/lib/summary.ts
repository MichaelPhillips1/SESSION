import type { DailyStock } from '../../../shared/types';
import { percentChange } from '../../../shared/tape';
/** Summary deltas use adjacent available sessions, independent of the chart viewport and tape. */
export function dailySummary(days: readonly DailyStock[]) {
  const latest = days.at(-1) ?? null,
    previous = days.at(-2) ?? null;
  return {
    latest,
    previous,
    highChange: latest && previous ? percentChange(latest.highAverage, previous.highAverage) : null,
    lowChange: latest && previous ? percentChange(latest.lowAverage, previous.lowAverage) : null,
    totalVolume: days.reduce((total, d) => total + d.volume, 0),
  };
}
