/** Intentional display order shared by the API and the accessible ticker strip. */
export const TAPE_SYMBOLS = [
  'MSFT',
  'NVDA',
  'AAPL',
  'GOOGL',
  'XOM',
  'CVX',
  'SMCI',
  'WMT',
  'BABA',
  'MU',
  'NKE',
  'LOW',
  'HD',
  'T',
  'TM',
  'TSM',
  'ADBE',
  'META',
  'PLTR',
  'OSCR',
  'UNH',
  'AMZN',
  'WDAY',
  'WFC',
  'BAC',
  'BA',
  'GE',
  'GD',
] as const;
export type TapeSymbol = (typeof TAPE_SYMBOLS)[number];
export type TapeEntry =
  | {
      symbol: TapeSymbol;
      status: 'available';
      highChange: number | null;
      lowChange: number | null;
      latestDay: string;
      previousDay: string;
      fetchedAt: string;
    }
  | {
      symbol: TapeSymbol;
      status: 'unavailable';
      reason: string;
    };
export interface TapeSnapshot {
  entries: TapeEntry[];
  generatedAt: string;
}

/** No rounding here: display precision must never discard the direction of a small move. */
export function percentChange(value: number, previous: number): number | null {
  if (previous === 0) return null;
  const change = ((value - previous) / previous) * 100;
  return Number.isFinite(change) ? change : null;
}
