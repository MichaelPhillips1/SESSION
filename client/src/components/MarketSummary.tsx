import { memo, useMemo } from 'react';
import type { MarketData } from '../hooks/useStock';
import type { Preferences } from '../hooks/usePreferences';
import { changeFormat, compact, dayFormat, priceFormat, volumeFormat } from '../lib/format';
import { dailySummary } from '../lib/summary';
import { MiniChart } from './MiniChart';
import { Icon } from './Icon';
export const MarketSummary = memo(function MarketSummary({
  data,
  prefs,
}: {
  data: MarketData;
  prefs: Preferences;
}) {
  const summary = useMemo(() => dailySummary(data.days), [data.days]);
  const series = useMemo(
    () => ({
      high: data.days.map((d) => d.highAverage),
      low: data.days.map((d) => d.lowAverage),
      volume: data.days.map((d) => d.volume),
    }),
    [data.days],
  );
  const { latest, previous } = summary;
  if (!latest) return null;
  const priceCards = [
    {
      label: 'Latest average high',
      value: latest.highAverage,
      change: summary.highChange,
      color: prefs.highColor,
      values: series.high,
    },
    {
      label: 'Latest average low',
      value: latest.lowAverage,
      change: summary.lowChange,
      color: prefs.lowColor,
      values: series.low,
    },
  ];
  return (
    <section className="summary-grid" aria-label="Latest daily summary">
      {priceCards.map((card, i) => (
        <article className="metric-card" key={card.label} aria-label={card.label}>
          <header>
            <span className="metric-label">
              <i
                className={`metric-dot ${i === 1 ? 'square' : ''}`}
                style={{ background: card.color }}
              />
              {card.label}
            </span>
            <span
              className={`metric-change ${card.change === null || card.change === 0 ? 'neutral' : card.change > 0 ? 'positive' : 'negative'}`}
              title={
                previous
                  ? `Latest available session ${latest.day} vs ${previous.day}; the latest session may be partial.`
                  : 'A previous session is required.'
              }
            >
              {changeFormat(card.change)}
              <small>vs prior session</small>
            </span>
          </header>
          <div className="metric-body">
            <div className="metric-value">
              <strong>{priceFormat(card.value, 'absolute', 1, data.currency)}</strong>
              <time dateTime={latest.day}>{dayFormat(latest.day, true)}</time>
            </div>
            <MiniChart values={card.values} color={card.color} />
          </div>
          <span className="sr-only">
            {previous
              ? `Change from ${previous.day} to ${latest.day}.`
              : 'Not enough sessions for a change.'}{' '}
            The latest session may be partial. Sparkline shows all retrieved daily averages.
          </span>
        </article>
      ))}
      <article className="metric-card volume-metric" aria-label="Month trading volume">
        <header>
          <span className="metric-label">
            <Icon name="volume" size={13} />
            Month volume
          </span>
          <span className="metric-context">{data.days.length} available sessions</span>
        </header>
        <div className="metric-body">
          <div className="metric-value">
            <strong title={volumeFormat(summary.totalVolume)}>
              {compact(summary.totalVolume)}
            </strong>
            <small>Sum of retrieved volume</small>
          </div>
          <MiniChart values={series.volume} color={prefs.volumeColor} kind="bars" />
        </div>
      </article>
    </section>
  );
});
