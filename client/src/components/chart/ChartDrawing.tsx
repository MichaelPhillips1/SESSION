import { memo } from 'react';
import type { Preferences } from '../../hooks/usePreferences';
import type { ChartGeometry } from '../../lib/chartGeometry';
import { lineDash } from '../../lib/chartGeometry';
import { compact, dayFormat, priceFormat } from '../../lib/format';
/** Stable SVG layer. Cursor movement updates a separate overlay, not these paths/axes. */
export const ChartDrawing = memo(function ChartDrawing({
  geometry: g,
  prefs,
  currency,
  mode,
  reference,
  id,
}: {
  geometry: ChartGeometry;
  prefs: Preferences;
  currency: string;
  mode: Preferences['mode'];
  reference: number;
  id: string;
}) {
  const first = g.points[0];
  return (
    <g className="chart-drawing">
      <defs>
        <linearGradient id={`${id}-band`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={prefs.highColor} />
          <stop offset="1" stopColor={prefs.lowColor} />
        </linearGradient>
        <linearGradient id={`${id}-bars`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={prefs.volumeColor} stopOpacity="1" />
          <stop offset="1" stopColor={prefs.volumeColor} stopOpacity=".38" />
        </linearGradient>
        <linearGradient id={`${id}-volume`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={prefs.volumeColor} stopOpacity=".5" />
          <stop offset="1" stopColor={prefs.volumeColor} stopOpacity=".02" />
        </linearGradient>
        <clipPath id={`${id}-price-clip`}>
          <rect x={g.left} y={g.top} width={g.plotWidth} height={g.bottom - g.top} />
        </clipPath>
      </defs>
      {g.priceTicks.map((tick, i) => (
        <g key={i}>
          <line className="gridline" x1={g.left} x2={g.width - g.right} y1={tick.y} y2={tick.y} />
          <text className="axis-label" x={g.width - g.right + 12} y={tick.y + 4}>
            {priceFormat(tick.value, mode, reference, currency, 2)}
          </text>
        </g>
      ))}
      {g.dates.map((date) => (
        <g key={date.day}>
          <line
            className="gridline vertical"
            x1={date.x}
            x2={date.x}
            y1={g.top}
            y2={g.volumeBottom}
          />
          <text className="axis-label date-label" textAnchor="middle" x={date.x} y={g.height - 8}>
            {dayFormat(date.day)}
          </text>
        </g>
      ))}
      <g clipPath={`url(#${id}-price-clip)`}>
        {prefs.fill && g.band && (
          <path d={g.band} fill={`url(#${id}-band)`} opacity={prefs.fillOpacity} />
        )}
        {prefs.high && (
          <path
            className="price-series"
            d={g.highLine}
            stroke={prefs.highColor}
            strokeWidth={prefs.highWidth}
            strokeOpacity={prefs.highOpacity}
            strokeDasharray={lineDash(prefs.highStyle)}
          />
        )}
        {prefs.low && (
          <path
            className="price-series"
            d={g.lowLine}
            stroke={prefs.lowColor}
            strokeWidth={prefs.lowWidth}
            strokeOpacity={prefs.lowOpacity}
            strokeDasharray={lineDash(prefs.lowStyle)}
          />
        )}
        {g.points.length === 1 && first && (
          <>
            {prefs.high && <circle cx={first.x} cy={first.highY} r="3.5" fill={prefs.highColor} />}{' '}
            {prefs.low && (
              <rect
                x={first.x - 3.5}
                y={first.lowY - 3.5}
                width="7"
                height="7"
                fill={prefs.lowColor}
              />
            )}
          </>
        )}
      </g>
      <g className="volume-series" aria-hidden="true">
        <line
          className="separator-line"
          x1={g.left}
          x2={g.width - g.right}
          y1={g.volumeTop - 10}
          y2={g.volumeTop - 10}
        />
        {g.volumeMax > 0 && (
          <text className="axis-label volume-axis" x={g.width - g.right + 12} y={g.volumeTop + 5}>
            {compact(g.volumeMax)}
          </text>
        )}
        <text className="axis-label volume-axis" x={g.width - g.right + 12} y={g.volumeBottom}>
          0
        </text>
        {prefs.volumeType === 'histogram' ? (
          g.points.map((point, i) => (
            <rect
              key={i}
              x={point.x - g.barWidth / 2}
              y={point.volumeY}
              width={g.barWidth}
              height={g.volumeBottom - point.volumeY}
              rx="1"
              fill={`url(#${id}-bars)`}
              opacity={prefs.volumeOpacity}
            />
          ))
        ) : (
          <g opacity={prefs.volumeOpacity}>
            {prefs.volumeFill && <path d={g.volumeArea} fill={`url(#${id}-volume)`} />}
            <path
              d={g.volumeLine}
              stroke={prefs.volumeColor}
              strokeWidth="1.8"
              className="price-series"
            />
            {g.points.length === 1 && first && (
              <circle cx={first.x} cy={first.volumeY} r="3" fill={prefs.volumeColor} />
            )}
          </g>
        )}
      </g>
    </g>
  );
});

/** The small moving layer does not invalidate memoized paths and axes. */
export function ChartCursor({
  point,
  y,
  geometry: g,
  prefs,
}: {
  point: ChartGeometry['points'][number];
  y: number;
  geometry: ChartGeometry;
  prefs: Preferences;
}) {
  return (
    <g className="cursor-overlay" pointerEvents="none">
      <rect
        x={point.x - g.barWidth / 2 - 2}
        y={g.top}
        width={g.barWidth + 4}
        height={g.volumeBottom - g.top}
        className="cursor-column"
      />
      <line className="crosshair" x1={point.x} x2={point.x} y1={g.top} y2={g.volumeBottom} />
      <line className="crosshair horizontal" x1={g.left} x2={g.width - g.right} y1={y} y2={y} />
      {prefs.high && (
        <>
          <circle cx={point.x} cy={point.highY} r="8" fill={prefs.highColor} opacity=".14" />
          <circle
            cx={point.x}
            cy={point.highY}
            r="4"
            fill={prefs.highColor}
            stroke="var(--panel)"
            strokeWidth="1.5"
          />
        </>
      )}
      {prefs.low && (
        <>
          <rect
            x={point.x - 6}
            y={point.lowY - 6}
            width="12"
            height="12"
            fill={prefs.lowColor}
            opacity=".14"
          />
          <rect
            x={point.x - 3.5}
            y={point.lowY - 3.5}
            width="7"
            height="7"
            fill={prefs.lowColor}
            stroke="var(--panel)"
            strokeWidth="1.5"
          />
        </>
      )}
    </g>
  );
}
