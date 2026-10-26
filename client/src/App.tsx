import { useCallback, useState, type FormEvent } from 'react';
import { usePreferences } from './hooks/usePreferences';
import { useStock } from './hooks/useStock';
import { MarketChart } from './components/MarketChart';
import { Settings } from './components/Settings';
import { Icon } from './components/Icon';
import { MarketSummary } from './components/MarketSummary';
import { DailyTable } from './components/DailyTable';
import { TickerTape } from './components/TickerTape';
export default function App() {
  const { prefs, update, reset } = usePreferences();
  const { data, loading, error, load } = useStock();
  const [input, setInput] = useState('AAPL');
  const [requested, setRequested] = useState('AAPL');
  const [settings, setSettings] = useState(false);
  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    setRequested(input.trim().toUpperCase());
    void load(input);
  };
  const select = useCallback(
    (symbol: string) => {
      setInput(symbol);
      setRequested(symbol);
      void load(symbol);
    },
    [load],
  );
  const latest = data?.days.at(-1);
  const first = data?.days[0];
  const timestamp = data?.fetchedAt ? new Date(data.fetchedAt) : null;
  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="/" aria-label="SESSION home">
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          SESSION<span className="brand-dot">®</span>
        </a>
        <span className="header-slash">/</span>
        <span className="workspace-title">Market workspace</span>
        <div className="header-end">
          <span className="source-pill">
            <i />
            Yahoo Finance
          </span>
          <button
            className="icon-button theme-toggle"
            aria-label={prefs.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={() => update('theme', prefs.theme === 'dark' ? 'light' : 'dark')}
          >
            <Icon name={prefs.theme === 'dark' ? 'sun' : 'moon'} />
          </button>
        </div>
      </header>
      <TickerTape onSelect={select} />
      <div className="workspace">
        <main id="main-content">
          <section className="overview-header" aria-label="Market overview">
            <div className="page-heading">
              <div>
                <h1>
                  The market, in focus<span>.</span>
                </h1>
                <p>Daily price averages from 15-minute intraday data with volume.</p>
              </div>
            </div>
            <form className="search-form" onSubmit={submit}>
              <div className="search-field">
                <label htmlFor="symbol-search">
                  <Icon name="search" />
                  <span className="sr-only">Stock symbol</span>
                </label>
                <input
                  id="symbol-search"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Search a stock symbol, e.g. AAPL"
                  maxLength={40}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                />
              </div>
              <button className="primary-button" type="submit">
                Load symbol
                <Icon name="arrow" size={16} />
              </button>
            </form>
          </section>
          {loading ? (
            <section className="state-panel loading-panel" aria-live="polite" aria-busy="true">
              <div className="loading-line" />
              <span className="eyebrow">RETRIEVING MARKET DATA</span>
              <h2>Loading {requested}…</h2>
              <p>Fetching the last month of 15-minute candles.</p>
              <div className="skeleton-chart" aria-hidden="true" />
            </section>
          ) : error ? (
            <section className="state-panel error-panel" role="alert">
              <span className="error-symbol">!</span>
              <span className="eyebrow">DATA UNAVAILABLE</span>
              <h2>Let’s try that again.</h2>
              <p>{error}</p>
              <button className="button" onClick={() => void load(requested)}>
                <Icon name="refresh" />
                Retry request
              </button>
            </section>
          ) : data && latest && first ? (
            <>
              <MarketSummary data={data} prefs={prefs} />
              <section className="chart-card" aria-label="Stock chart">
                <MarketChart
                  key={`${data.symbol}-${data.fetchedAt}`}
                  days={data.days}
                  symbol={data.symbol}
                  onRefresh={() => void load(data.symbol)}
                  prefs={prefs}
                  currency={data.currency}
                  onMode={(m) => update('mode', m)}
                  onVolumeType={(t) => update('volumeType', t)}
                  onToggle={(k) => update(k, !prefs[k])}
                  onSettings={() => setSettings(true)}
                />
              </section>
              <DailyTable data={data} prefs={prefs} />
              <div className="method-note">
                <span className="info-icon">i</span>
                <p>
                  <strong>Averages, not daily extremes.</strong> Each day is the arithmetic mean of
                  valid 15-minute highs and lows, with volume summed across those candles. The
                  latest session may be incomplete. Card changes compare the latest two available
                  sessions.
                  {data.skippedBars > 0 &&
                    ` ${data.skippedBars} incomplete, invalid, or duplicate candles were omitted.`}
                </p>
              </div>
            </>
          ) : (
            <section className="state-panel" role="status">
              <h2>No sessions available</h2>
              <p>Try another stock symbol to view its daily data.</p>
            </section>
          )}
          <footer className="main-footer">
            <span>
              SESSION <span> / </span> A daily market perspective
            </span>
            <span>
              {timestamp && Number.isFinite(timestamp.getTime())
                ? `Fetched ${timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}`
                : 'Powered by Yahoo Finance'}{' '}
              · 1-month window
            </span>
          </footer>
        </main>
      </div>
      {settings && (
        <Settings prefs={prefs} update={update} reset={reset} close={() => setSettings(false)} />
      )}
    </div>
  );
}
