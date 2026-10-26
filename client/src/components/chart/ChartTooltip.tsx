import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { DailyStock } from '../../../../shared/types';
import type { Preferences } from '../../hooks/usePreferences';
import { percentChange } from '../../../../shared/tape';
import { changeFormat, dayFormat, priceFormat, volumeFormat } from '../../lib/format';
import { tooltipPosition } from '../../lib/chartGeometry';
export function ChartTooltip({
  day,
  first,
  currency,
  mode,
  prefs,
  x,
  y,
  width,
  height,
}: {
  day: DailyStock;
  first: DailyStock;
  currency: string;
  mode: Preferences['mode'];
  prefs: Preferences;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const node = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 224, height: 178 });
  const values = useMemo(
    () => ({
      high: priceFormat(day.highAverage, 'absolute', 1, currency),
      low: priceFormat(day.lowAverage, 'absolute', 1, currency),
      volume: volumeFormat(day.volume),
      highChange: percentChange(day.highAverage, first.highAverage),
      lowChange: percentChange(day.lowAverage, first.lowAverage),
    }),
    [day, first, currency],
  );
  useLayoutEffect(() => {
    const element = node.current!;
    const next = { width: element.offsetWidth, height: element.offsetHeight };
    setSize((prev) => (prev.width === next.width && prev.height === next.height ? prev : next));
  }, [day, first, currency, mode, width]);
  const position = tooltipPosition(x, y, width, height, size.width, size.height);
  const change = (value: number | null) => (
    <small
      className={value === null || value === 0 ? 'neutral' : value > 0 ? 'positive' : 'negative'}
    >
      {changeFormat(value, 4)}
    </small>
  );
  return (
    <div ref={node} className="chart-tooltip" style={position} role="status">
      <strong>
        <time dateTime={day.day}>{dayFormat(day.day, true)}</time>
      </strong>
      <dl>
        <div>
          <dt>
            <i className="series-marker" style={{ background: prefs.highColor }} />
            Average high
          </dt>
          <dd>
            {values.high}
            {mode === 'percent' && change(values.highChange)}
          </dd>
        </div>
        <div>
          <dt>
            <i className="series-marker square" style={{ background: prefs.lowColor }} />
            Average low
          </dt>
          <dd>
            {values.low}
            {mode === 'percent' && change(values.lowChange)}
          </dd>
        </div>
        <div>
          <dt>
            <i className="series-marker volume-dot" />
            Trading volume
          </dt>
          <dd>{values.volume}</dd>
        </div>
      </dl>
      {mode === 'percent' && (
        <p className="tooltip-note">H/L change vs each series’ first visible value.</p>
      )}
    </div>
  );
}
