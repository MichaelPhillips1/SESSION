const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 2,
});
const integerFormatter = new Intl.NumberFormat('en-US');
const dateFormatters = [
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }),
];
const currencyFormatters = new Map<string, Intl.NumberFormat>();
export const compact = (value: number) => compactFormatter.format(value);
export const volumeFormat = (value: number) => integerFormatter.format(value);
export const dayFormat = (day: string, long = false) =>
  dateFormatters[long ? 1 : 0]!.format(new Date(`${day}T12:00:00Z`));
export function priceFormat(
  value: number,
  mode: 'absolute' | 'percent',
  reference: number,
  currency: string,
  digits = 4,
): string {
  if (mode === 'percent')
    return reference > 0 ? changeFormat((value / reference - 1) * 100, digits) : '—';
  const key = `${currency}:${digits}`;
  let formatter = currencyFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    if (currencyFormatters.size >= 24)
      currencyFormatters.delete(currencyFormatters.keys().next().value!);
    currencyFormatters.set(key, formatter);
  }
  return formatter.format(value);
}
/** Nonzero changes keep their sign even below the chosen display precision. */
export function changeFormat(change: number | null, digits = 2): string {
  if (change === null || !Number.isFinite(change)) return '—';
  if (change === 0) return `${(0).toFixed(digits)}%`;
  const magnitude = Math.abs(change).toFixed(digits),
    sign = change > 0 ? '+' : '-';
  return Number(magnitude) === 0
    ? `${sign}<${(10 ** -digits).toFixed(digits)}%`
    : `${sign}${magnitude}%`;
}
