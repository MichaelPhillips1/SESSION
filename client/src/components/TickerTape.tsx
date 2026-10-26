import { memo } from 'react';
import { TAPE_SYMBOLS, type TapeEntry } from '../../../shared/tape';
import { useTickerTape } from '../hooks/useTickerTape';
import { changeFormat, dayFormat } from '../lib/format';

function Change({
  label,
  value,
  loading = false,
}: {
  label: 'H' | 'L';
  value: number | null;
  loading?: boolean;
}) {
  const direction = value === null || value === 0 ? 'neutral' : value > 0 ? 'positive' : 'negative';
  return (
    <span className={`tape-change ${direction}`}>
      <span>{label}</span> {loading ? '…' : changeFormat(value)}
    </span>
  );
}
function entryDescription(symbol: string, entry: TapeEntry | undefined) {
  if (!entry) return `${symbol}: loading completed-session changes. Select to load stock.`;
  if (entry.status === 'unavailable') return `${symbol}: ${entry.reason}`;
  return `${symbol}: average high ${changeFormat(entry.highChange)}, average low ${changeFormat(entry.lowChange)}. ${dayFormat(entry.previousDay, true)} to ${dayFormat(entry.latestDay, true)}. Changes use each series' previous completed session. A dash means the previous average is zero.`;
}
export const TickerTape = memo(function TickerTape({
  onSelect,
}: {
  onSelect: (symbol: string) => void;
}) {
  const { entries, failed, retry } = useTickerTape();
  return (
    <section
      className="ticker-tape"
      aria-label="Completed-session market ticker tape"
      aria-busy={!entries}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.scrollLeft = 0;
      }}
    >
      <p className="sr-only">
        Average high and low changes between each stock’s two most recent completed sessions. Hover
        to pause. Focus pauses motion and enables horizontal keyboard browsing.
      </p>
      {failed && (
        <button className="tape-retry" onClick={retry}>
          Retry market tape
        </button>
      )}
      <div className="ticker-track">
        {[0, 1].map((copy) => (
          <div className="ticker-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
            {TAPE_SYMBOLS.map((symbol, i) => {
              const entry = entries?.[i];
              const available = entry?.status === 'available' ? entry : undefined;
              const description = entryDescription(symbol, entry);
              return (
                <button
                  className="tape-entry"
                  key={symbol}
                  tabIndex={copy === 1 ? -1 : 0}
                  aria-label={description}
                  title={description}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onSelect(symbol)}
                >
                  <strong>{symbol}</strong>
                  <Change label="H" value={available?.highChange ?? null} loading={!entries} />
                  <Change label="L" value={available?.lowChange ?? null} loading={!entries} />
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
});
