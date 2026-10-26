import { useEffect, useRef } from 'react';
import { defaults, type Preferences, type LineStyle } from '../hooks/usePreferences';
import { Icon } from './Icon';
type Update = <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
export function Settings({
  prefs,
  update,
  reset,
  close,
}: {
  prefs: Preferences;
  update: Update;
  reset: () => void;
  close: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current!;
    node.showModal();
    return () => node.close();
  }, []);
  const check = (key: 'high' | 'low' | 'fill' | 'volumeFill', label: string) => (
    <label className="check-row">
      <span>{label}</span>
      <input type="checkbox" checked={prefs[key]} onChange={(e) => update(key, e.target.checked)} />
    </label>
  );
  const slider = (
    key: 'highWidth' | 'lowWidth' | 'highOpacity' | 'lowOpacity' | 'fillOpacity' | 'volumeOpacity',
    label: string,
    min = 0,
    max = 1,
    step = 0.05,
  ) => (
    <label className="slider-row">
      <span>
        {label}
        <output>{max === 1 ? `${Math.round(prefs[key] * 100)}%` : `${prefs[key]} px`}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={prefs[key]}
        onChange={(e) => update(key, Number(e.target.value))}
      />
    </label>
  );
  const line = (kind: 'high' | 'low', title: string) => {
    const color = kind === 'high' ? 'highColor' : 'lowColor';
    const width = kind === 'high' ? 'highWidth' : 'lowWidth';
    const style = kind === 'high' ? 'highStyle' : 'lowStyle';
    const opacity = kind === 'high' ? 'highOpacity' : 'lowOpacity';
    return (
      <fieldset>
        <legend>{title}</legend>
        {check(kind, 'Show line')}
        <div className="settings-pair">
          <label className="color-row">
            Color
            <input
              type="color"
              value={prefs[color]}
              onChange={(e) => update(color, e.target.value)}
            />
          </label>
          <label>
            Style
            <select
              value={prefs[style]}
              onChange={(e) => update(style, e.target.value as LineStyle)}
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </label>
        </div>
        {slider(width, 'Thickness', 1, 5, 0.5)}
        {slider(opacity, 'Opacity')}
      </fieldset>
    );
  };
  return (
    <dialog
      ref={dialog}
      className="settings-dialog"
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      aria-labelledby="settings-title"
    >
      <header>
        <div>
          <span className="eyebrow">MAKE IT YOURS</span>
          <h2 id="settings-title">Chart appearance</h2>
        </div>
        <button className="icon-button" aria-label="Close settings" onClick={close}>
          <Icon name="close" />
        </button>
      </header>
      <div className="settings-content">
        {line('high', 'Average high')}
        {line('low', 'Average low')}
        <fieldset>
          <legend>Price canvas</legend>
          {check('fill', 'Shade between high and low')}
          {slider('fillOpacity', 'Shading opacity')}
          <label className="color-row">
            Custom background
            <input
              type="color"
              value={prefs.background || (prefs.theme === 'dark' ? '#0e1923' : '#ffffff')}
              onChange={(e) => update('background', e.target.value)}
            />
          </label>
          <button className="text-button" onClick={() => update('background', '')}>
            Use theme background
          </button>
        </fieldset>
        <fieldset>
          <legend>Trading volume</legend>
          <label className="select-row">
            Representation
            <select
              value={prefs.volumeType}
              onChange={(e) => update('volumeType', e.target.value as Preferences['volumeType'])}
            >
              <option value="histogram">Histogram</option>
              <option value="line">Line</option>
            </select>
          </label>
          <label className="color-row">
            Color
            <input
              type="color"
              value={prefs.volumeColor}
              onChange={(e) => update('volumeColor', e.target.value)}
            />
          </label>
          {slider('volumeOpacity', 'Opacity', 0.2)}
          {check('volumeFill', 'Gradient area under volume line')}
        </fieldset>
      </div>
      <footer>
        <span>Preferences save automatically</span>
        <button className="button" onClick={reset}>
          Reset appearance
        </button>
      </footer>
      <span className="sr-only">
        Default high color {defaults.highColor}, low color {defaults.lowColor}.
      </span>
    </dialog>
  );
}
