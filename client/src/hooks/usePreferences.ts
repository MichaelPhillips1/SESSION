import { useEffect, useState } from 'react';
export type LineStyle = 'solid' | 'dashed' | 'dotted';
export interface Preferences {
  theme: 'dark' | 'light';
  mode: 'absolute' | 'percent';
  high: boolean;
  low: boolean;
  fill: boolean;
  highColor: string;
  lowColor: string;
  volumeColor: string;
  background: string;
  highWidth: number;
  lowWidth: number;
  highOpacity: number;
  lowOpacity: number;
  fillOpacity: number;
  volumeOpacity: number;
  highStyle: LineStyle;
  lowStyle: LineStyle;
  volumeType: 'histogram' | 'line';
  volumeFill: boolean;
}
export const defaults: Preferences = {
  theme: 'dark',
  mode: 'absolute',
  high: true,
  low: true,
  fill: true,
  highColor: '#419963',
  lowColor: '#cf6c73',
  volumeColor: '#617a96',
  background: '',
  highWidth: 2,
  lowWidth: 2,
  highOpacity: 1,
  lowOpacity: 1,
  fillOpacity: 0.18,
  volumeOpacity: 0.85,
  highStyle: 'solid',
  lowStyle: 'dashed',
  volumeType: 'histogram',
  volumeFill: true,
};
const choices: Record<string, string[]> = {
  theme: ['dark', 'light'],
  mode: ['absolute', 'percent'],
  highStyle: ['solid', 'dashed', 'dotted'],
  lowStyle: ['solid', 'dashed', 'dotted'],
  volumeType: ['histogram', 'line'],
};
const bounds: Record<string, [number, number]> = {
  highWidth: [1, 5],
  lowWidth: [1, 5],
  highOpacity: [0, 1],
  lowOpacity: [0, 1],
  fillOpacity: [0, 1],
  volumeOpacity: [0.2, 1],
};
export function parsePreferences(raw: string | null): Preferences {
  try {
    const input: unknown = JSON.parse(raw ?? '{}');
    if (!input || typeof input !== 'object') return { ...defaults };
    const output = { ...defaults };
    for (const key of Object.keys(defaults) as (keyof Preferences)[]) {
      const value = (input as Record<string, unknown>)[key];
      const base = defaults[key];
      const valid =
        typeof base === 'boolean'
          ? typeof value === 'boolean'
          : bounds[key]
            ? typeof value === 'number' &&
              Number.isFinite(value) &&
              value >= bounds[key]![0] &&
              value <= bounds[key]![1]
            : choices[key]
              ? typeof value === 'string' && choices[key]!.includes(value)
              : typeof value === 'string' &&
                (/^#[0-9a-f]{6}$/i.test(value) || (key === 'background' && value === ''));
      if (valid) Object.assign(output, { [key]: value });
    }
    return output;
  } catch {
    return { ...defaults };
  }
}
export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(() => {
    try {
      return parsePreferences(localStorage.getItem('session.preferences.v1'));
    } catch {
      return { ...defaults };
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = prefs.theme;
    try {
      localStorage.setItem('session.preferences.v1', JSON.stringify(prefs));
    } catch {
      /* Private mode/storage quota must not block chart use. */
    }
  }, [prefs]);
  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setPrefs((prev) => ({ ...prev, [key]: value }));
  return { prefs, update, reset: () => setPrefs({ ...defaults, theme: prefs.theme }) };
}
