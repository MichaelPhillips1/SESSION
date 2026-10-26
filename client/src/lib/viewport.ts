import type { DailyStock } from '../../../shared/types';
/** UTC calendar-day coordinates; end is exclusive. Seven days can contain five sessions. */
export interface Viewport {
  start: number;
  span: number;
}
export const DAY_MS = 86_400_000;
export const MIN_WINDOW_DAYS = 7;
export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
export const dayNumber = (day: string) => Date.parse(`${day}T00:00:00Z`) / DAY_MS;
export function fitView(days: DailyStock[]): Viewport {
  if (!days.length) return { start: 0, span: 0 };
  const start = dayNumber(days[0]!.day);
  return { start, span: dayNumber(days.at(-1)!.day) + 1 - start };
}
export function visibleDays(days: DailyStock[], view: Viewport): DailyStock[] {
  return days.filter((d) => {
    const point = dayNumber(d.day) + 0.5;
    return point >= view.start && point < view.start + view.span;
  });
}
export function minimumSpan(days: DailyStock[]): number {
  return Math.min(MIN_WINDOW_DAYS, fitView(days).span);
}
export function constrainView(view: Viewport, days: DailyStock[]): Viewport {
  const full = fitView(days);
  if (!days.length) return full;
  const span = clamp(view.span, minimumSpan(days), full.span);
  let start = clamp(view.start, full.start, full.start + full.span - span);
  // A very sparse symbol may have a holiday/suspension longer than the minimum window.
  if (!visibleDays(days, { start, span }).length) {
    const center = start + span / 2;
    const closest = days.reduce((a, b) =>
      Math.abs(dayNumber(a.day) + 0.5 - center) < Math.abs(dayNumber(b.day) + 0.5 - center) ? a : b,
    );
    start = clamp(
      dayNumber(closest.day) + 0.5 - span / 2,
      full.start,
      full.start + full.span - span,
    );
  }
  return { start, span };
}
export function zoomView(
  view: Viewport,
  days: DailyStock[],
  factor: number,
  anchor = 0.5,
): Viewport {
  const full = fitView(days);
  const span = clamp(view.span * factor, minimumSpan(days), full.span);
  return constrainView(
    { start: view.start + (view.span - span) * clamp(anchor, 0, 1), span },
    days,
  );
}
export function rangeView(days: DailyStock[], calendarDays: number): Viewport {
  const full = fitView(days);
  const span = clamp(calendarDays, minimumSpan(days), full.span);
  return constrainView({ start: full.start + full.span - span, span }, days);
}
