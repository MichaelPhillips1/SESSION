import type { Preferences } from '../../hooks/usePreferences';
import { lineDash } from '../../lib/chartGeometry';
import { Icon } from '../Icon';
export type ChartToggle = 'high' | 'low' | 'fill';
export function ChartToolbar({
  symbol,
  currency,
  range,
  mode,
  percentAvailable,
  prefs,
  onRange,
  onMode,
  onVolumeType,
  onSettings,
  onFit,
  onRefresh,
}: {
  symbol: string;
  currency: string;
  range: string;
  mode: Preferences['mode'];
  percentAvailable: boolean;
  prefs: Preferences;
  onRange: (range: '1W' | '2W' | '1M') => void;
  onMode: (mode: Preferences['mode']) => void;
  onVolumeType: (type: Preferences['volumeType']) => void;
  onSettings: () => void;
  onFit: () => void;
  onRefresh: () => void;
}) {
  return (
    <header className="chart-heading">
      <div className="instrument">
        <span className="instrument-avatar">{symbol.slice(0, 1)}</span>
        <div>
          <h2>{symbol}</h2>
          <p>
            Daily price averages <span>·</span> {currency}
          </p>
        </div>
        <button
          className="icon-button refresh-button"
          aria-label="Refresh data"
          title="Refresh data (up to 60-second cache)"
          onClick={onRefresh}
        >
          <Icon name="refresh" size={15} />
        </button>
      </div>
      <div className="toolbar-actions">
        <div className="range-mode">
          <div className="range-group" aria-label="Viewing range">
            {(['1W', '2W', '1M'] as const).map((label) => (
              <button
                key={label}
                aria-pressed={range === label}
                className={range === label ? 'selected' : ''}
                onClick={() => onRange(label)}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="toolbar-divider" />
          <div className="segment" aria-label="Price axis mode">
            <button
              className={mode === 'absolute' ? 'selected' : ''}
              aria-pressed={mode === 'absolute'}
              onClick={() => onMode('absolute')}
            >
              {currency === 'USD' ? '$' : currency}
            </button>
            <button
              className={mode === 'percent' ? 'selected' : ''}
              aria-pressed={mode === 'percent'}
              disabled={!percentAvailable}
              title="Axis: first visible session midpoint"
              onClick={() => onMode('percent')}
            >
              %
            </button>
          </div>
        </div>
        <div className="tool-options">
          <label className="volume-select">
            <span className="sr-only">Volume representation</span>
            <select
              value={prefs.volumeType}
              onChange={(e) => onVolumeType(e.target.value as Preferences['volumeType'])}
            >
              <option value="histogram">Volume: Histogram</option>
              <option value="line">Volume: Line</option>
            </select>
          </label>
          <button
            className="icon-button"
            title="Auto-fit chart (Home)"
            aria-label="Auto-fit chart"
            onClick={onFit}
          >
            <Icon name="reset" size={16} />
          </button>
          <button
            className="settings-button icon-button"
            aria-label="Chart appearance"
            title="Chart appearance"
            onClick={onSettings}
          >
            <Icon name="settings" size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
export function ChartLegend({
  prefs,
  onToggle,
}: {
  prefs: Preferences;
  onToggle: (key: ChartToggle) => void;
}) {
  return (
    <div className="legend" aria-label="Chart series">
      {(['high', 'low'] as const).map((key) => (
        <button
          key={key}
          aria-pressed={prefs[key]}
          className={!prefs[key] ? 'muted-legend' : ''}
          onClick={() => onToggle(key)}
        >
          <svg width="23" height="9" aria-hidden="true">
            <path
              d="M1 5 H22"
              stroke={key === 'high' ? prefs.highColor : prefs.lowColor}
              strokeWidth="2"
              strokeDasharray={lineDash(key === 'high' ? prefs.highStyle : prefs.lowStyle)}
              fill="none"
            />
          </svg>
          Average {key}
        </button>
      ))}
      <button
        aria-pressed={prefs.fill}
        className={!prefs.fill ? 'muted-legend' : ''}
        onClick={() => onToggle('fill')}
      >
        <i
          className="fill-dot"
          style={{ background: `linear-gradient(${prefs.highColor}66,${prefs.lowColor}66)` }}
        />
        Range fill
      </button>
      <span className="volume-key">
        <i style={{ background: prefs.volumeColor }} />
        Volume
      </span>
    </div>
  );
}
