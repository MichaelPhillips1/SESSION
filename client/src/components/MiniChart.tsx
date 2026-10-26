import { memo, useId, useMemo } from 'react';
import { histogramGeometry, sparklineGeometry } from '../lib/miniChart';
export const MiniChart = memo(function MiniChart({
  values,
  color,
  kind = 'line',
}: {
  values: readonly number[];
  color: string;
  kind?: 'line' | 'bars';
}) {
  const id = useId().replaceAll(':', '');
  const line = useMemo(() => sparklineGeometry(values), [values]);
  const bars = useMemo(() => histogramGeometry(values), [values]);
  return (
    <svg className="mini-chart" viewBox="0 0 180 38" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-mini`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={kind === 'bars' ? 0.9 : 0.2} />
          <stop offset="1" stopColor={color} stopOpacity={kind === 'bars' ? 0.25 : 0} />
        </linearGradient>
      </defs>
      {kind === 'bars' ? (
        bars.map((bar, i) => <rect key={i} {...bar} rx=".8" fill={`url(#${id}-mini)`} />)
      ) : (
        <>
          <path d={line.area} fill={`url(#${id}-mini)`} />
          <path
            d={line.line}
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {line.points.length === 1 && (
            <circle {...{ cx: line.points[0]!.x, cy: line.points[0]!.y }} r="2" fill={color} />
          )}
        </>
      )}
    </svg>
  );
});
