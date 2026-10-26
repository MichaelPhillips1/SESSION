import type { SessionCoverage } from '../../shared/types.js';
const record = (v: unknown): Record<string, unknown> | undefined =>
  v !== null && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : undefined;

/** Read actual Yahoo regular sessions, including early closes and exchange-specific breaks.
 * Unknown schedules are not replaced by a weekday/16:00 assumption. */
export function sessionCoverage(
  meta: Record<string, unknown>,
  dateFormatter: Intl.DateTimeFormat,
  accepted: ReadonlySet<number>,
): SessionCoverage[] {
  const periods = meta.tradingPeriods;
  const regular = Array.isArray(periods) ? periods : record(periods)?.regular;
  const groups = new Map<string, { start: number; end: number }[]>();
  const dayOf = (timestamp: number) => {
    const parts = dateFormatter.formatToParts(new Date(timestamp * 1000));
    const part = (type: string) => parts.find((p) => p.type === type)!.value;
    return `${part('year')}-${part('month')}-${part('day')}`;
  };
  const add = (value: unknown) => {
    const p = record(value);
    if (
      !p ||
      typeof p.start !== 'number' ||
      typeof p.end !== 'number' ||
      !Number.isSafeInteger(p.start) ||
      !Number.isSafeInteger(p.end) ||
      p.start < 0 ||
      p.end <= p.start ||
      p.end - p.start > 86_400 ||
      !Number.isFinite(new Date(p.end * 1000).getTime())
    )
      return;
    const day = dayOf(p.start);
    const group = groups.get(day) ?? [];
    if (!group.some((s) => s.start === p.start && s.end === p.end)) {
      group.push({ start: p.start, end: p.end });
      groups.set(day, group);
    }
  };
  const visit = (value: unknown, depth = 0) => {
    if (Array.isArray(value) && depth < 3) value.forEach((v) => visit(v, depth + 1));
    else add(value);
  };
  visit(regular);
  // Also retain a current/upcoming session, so cache expiry can respect its actual close.
  add(record(meta.currentTradingPeriod)?.regular);
  return [...groups]
    .map(([day, parts]) => ({
      day,
      start: Math.min(...parts.map((p) => p.start)),
      end: Math.max(...parts.map((p) => p.end)),
      covered: parts.every((p) => {
        for (let timestamp = p.start; timestamp < p.end; timestamp += 900)
          if (!accepted.has(timestamp)) return false;
        return true;
      }),
    }))
    .sort((a, b) => a.day.localeCompare(b.day));
}
