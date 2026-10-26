import { memo, useMemo, useState } from 'react';
import type { MarketData } from '../hooks/useStock';
import type { Preferences } from '../hooks/usePreferences';
import { dayFormat, volumeFormat } from '../lib/format';
export const DailyTable = memo(function DailyTable({
  data,
  prefs,
}: {
  data: MarketData;
  prefs: Preferences;
}) {
  const [order, setOrder] = useState<'newest' | 'oldest'>('newest');
  const rows = useMemo(
    () => (order === 'newest' ? data.days.toReversed() : data.days),
    [data.days, order],
  );
  const first = data.days[0]!;
  const latest = data.days.at(-1)!;
  return (
    <section className="table-card">
      <header>
        <div>
          <h2>
            Daily breakdown <span>{data.days.length} sessions</span>
          </h2>
        </div>
        <label className="sort-control">
          <span className="sr-only">Table order</span>
          <select value={order} onChange={(e) => setOrder(e.target.value as typeof order)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
      </header>
      <div className="table-scroll" tabIndex={0} role="region" aria-label="Daily stock data table">
        <table>
          <caption className="sr-only">
            {data.symbol} daily aggregation. Prices in {data.currency}, four decimal places;
            whole-number trading volume. All fetched sessions, independent of chart zoom.
          </caption>
          <thead>
            <tr>
              <th scope="col">TRADING DAY</th>
              <th scope="col">
                <i style={{ background: prefs.highColor }} />
                AVERAGE HIGH <span>({data.currency})</span>
              </th>
              <th scope="col">
                <i className="square" style={{ background: prefs.lowColor }} />
                AVERAGE LOW <span>({data.currency})</span>
              </th>
              <th scope="col">TRADING VOLUME</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.day}>
                <th scope="row">
                  <time dateTime={d.day}>{dayFormat(d.day, true)}</time>
                </th>
                <td>{d.highAverage.toFixed(4)}</td>
                <td>{d.lowAverage.toFixed(4)}</td>
                <td>{volumeFormat(d.volume)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer>
        <span>
          {dayFormat(first.day)} — {dayFormat(latest.day, true)} · {data.timezone}
        </span>
        <span>All available sessions</span>
      </footer>
    </section>
  );
});
