import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import type { DailyStock } from '../../../shared/types';
import type { Preferences } from '../hooks/usePreferences';
import {
  clamp,
  constrainView,
  fitView,
  minimumSpan,
  rangeView,
  visibleDays,
  zoomView,
  type Viewport,
} from '../lib/viewport';
import { windowReference } from '../lib/chartMath';
import { chartGeometry, pointerIndex } from '../lib/chartGeometry';
import { dayFormat, priceFormat } from '../lib/format';
import { ChartDrawing, ChartCursor } from './chart/ChartDrawing';
import { ChartTooltip } from './chart/ChartTooltip';
import { ChartLegend, ChartToolbar, type ChartToggle } from './chart/ChartToolbar';

interface Props {
  days: DailyStock[];
  symbol: string;
  currency: string;
  prefs: Preferences;
  onMode: (mode: Preferences['mode']) => void;
  onVolumeType: (type: Preferences['volumeType']) => void;
  onToggle: (key: ChartToggle) => void;
  onSettings: () => void;
  onRefresh: () => void;
}
interface Cursor {
  index: number;
  y: number;
}
export function MarketChart({
  days,
  symbol,
  currency,
  prefs,
  onMode,
  onVolumeType,
  onToggle,
  onSettings,
  onRefresh,
}: Props) {
  const id = useId().replaceAll(':', '');
  const surface = useRef<HTMLDivElement>(null),
    interaction = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(900);
  const [view, setView] = useState<Viewport>(() => fitView(days));
  const [range, setRange] = useState('1M');
  const [cursor, setCursor] = useState<Cursor | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; start: number; span: number; moved: boolean } | null>(null);
  const frame = useRef<number | null>(null),
    pending = useRef<(() => void) | null>(null);
  useEffect(() => {
    const observer = new ResizeObserver((entries) =>
      setWidth(Math.max(240, entries[0]!.contentRect.width)),
    );
    observer.observe(surface.current!);
    return () => {
      observer.disconnect();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);
  const visible = useMemo(() => visibleDays(days, view), [days, view]);
  const geometry = useMemo(() => chartGeometry(visible, width), [visible, width]);
  const reference = useMemo(() => windowReference(visible), [visible]);
  const mode = prefs.mode === 'percent' && reference > 0 ? 'percent' : 'absolute';
  const full = useMemo(() => fitView(days), [days]);
  const selected = cursor ? visible[clamp(cursor.index, 0, visible.length - 1)]! : null;
  const point = cursor ? geometry.points[clamp(cursor.index, 0, visible.length - 1)]! : null;
  const clearPending = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    pending.current = null;
  }, []);
  // One latest pointer update per animation frame; static geometry/drawing stay memoized.
  const schedule = (action: () => void) => {
    pending.current = action;
    if (frame.current === null)
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const work = pending.current;
        pending.current = null;
        work?.();
      });
  };
  const updateView = useCallback((next: (current: Viewport) => Viewport) => {
    setView((current) => {
      const result = next(current);
      return result.start === current.start && result.span === current.span ? current : result;
    });
  }, []);
  const zoom = useCallback(
    (factor: number, anchor = 0.5) => {
      clearPending();
      updateView((current) => zoomView(current, days, factor, anchor));
      setRange('Custom');
      setCursor(null);
    },
    [days, clearPending, updateView],
  );
  const pan = useCallback(
    (start: number) => {
      updateView((current) => constrainView({ ...current, start }, days));
      setRange('Custom');
      setCursor(null);
    },
    [days, updateView],
  );
  const fit = () => {
    clearPending();
    setView(full);
    setRange('1M');
    setCursor(null);
  };
  const selectRange = (value: '1W' | '2W' | '1M') => {
    clearPending();
    setView(value === '1M' ? full : rangeView(days, value === '1W' ? 7 : 14));
    setRange(value);
    setCursor(null);
  };
  useEffect(() => {
    const element = surface.current!;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        pan(view.start + (event.deltaX / geometry.plotWidth) * view.span);
        return;
      }
      if (event.deltaY === 0) return;
      const rect = element.getBoundingClientRect();
      zoom(
        event.deltaY > 0 ? 1.25 : 0.8,
        clamp((event.clientX - rect.left - geometry.left) / geometry.plotWidth, 0, 1),
      );
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  }, [geometry.left, geometry.plotWidth, view, zoom, pan]);
  const locate = (event: PointerEvent<SVGSVGElement>): Cursor => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      index: pointerIndex(event.clientX - rect.left, geometry),
      y: Math.round(clamp(event.clientY - rect.top, geometry.top, geometry.volumeBottom)),
    };
  };
  const inspect = (next: Cursor) =>
    setCursor((current) =>
      current?.index === next.index && current.y === next.y ? current : next,
    );
  const move = (event: PointerEvent<SVGSVGElement>) => {
    const held = drag.current;
    if (held) {
      if (Math.abs(event.clientX - held.x) > 3) held.moved = true;
      if (held.moved) {
        const start = held.start + ((held.x - event.clientX) / geometry.plotWidth) * held.span;
        schedule(() => pan(start));
      }
    } else {
      const next = locate(event);
      schedule(() => inspect(next));
    }
  };
  const release = (event: PointerEvent<SVGSVGElement>) => {
    const held = drag.current;
    clearPending();
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (held?.moved) pan(held.start + ((held.x - event.clientX) / geometry.plotWidth) * held.span);
    else if (held) inspect(locate(event));
  };
  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (['ArrowLeft', 'ArrowRight', '+', '=', '-', 'Home', 'Escape'].includes(event.key))
      event.preventDefault();
    if (event.key === '+' || event.key === '=') zoom(0.8);
    if (event.key === '-') zoom(1.25);
    if (event.key === 'Home') fit();
    if (event.key === 'Escape') {
      clearPending();
      setCursor(null);
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      clearPending();
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      if (event.shiftKey) pan(view.start + direction);
      else
        setCursor((current) => ({
          index: clamp((current?.index ?? visible.length - 1) + direction, 0, visible.length - 1),
          y: geometry.top + 28,
        }));
    }
  };
  return (
    <>
      <ChartToolbar
        symbol={symbol}
        currency={currency}
        range={range}
        mode={mode}
        percentAvailable={reference > 0}
        prefs={prefs}
        onRange={selectRange}
        onMode={onMode}
        onVolumeType={onVolumeType}
        onSettings={onSettings}
        onFit={fit}
        onRefresh={onRefresh}
      />
      <div
        className="chart-surface"
        ref={surface}
        style={{ background: prefs.background || undefined }}
      >
        <div
          className="chart-interaction"
          ref={interaction}
          data-window-days={view.span}
          data-reference-day={visible[0]!.day}
          tabIndex={0}
          role="region"
          aria-label="Interactive daily price and volume chart"
          aria-describedby={`${id}-help`}
          onKeyDown={key}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              clearPending();
              setCursor(null);
            }
          }}
        >
          <svg
            width="100%"
            height={geometry.height}
            role="img"
            aria-label={`Daily average highs, lows and volume, ${dayFormat(visible[0]!.day)} to ${dayFormat(visible.at(-1)!.day)}`}
            style={{ cursor: dragging ? 'grabbing' : 'crosshair' }}
            onPointerMove={move}
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              clearPending();
              interaction.current?.focus({ preventScroll: true });
              event.currentTarget.setPointerCapture(event.pointerId);
              drag.current = { x: event.clientX, start: view.start, span: view.span, moved: false };
              setDragging(true);
            }}
            onPointerUp={release}
            onLostPointerCapture={() => {
              drag.current = null;
              setDragging(false);
            }}
            onPointerCancel={() => {
              clearPending();
              drag.current = null;
              setDragging(false);
              setCursor(null);
            }}
            onPointerLeave={(event) => {
              if (!drag.current && event.pointerType !== 'touch') {
                clearPending();
                setCursor(null);
              }
            }}
            onDoubleClick={fit}
          >
            <ChartDrawing
              geometry={geometry}
              prefs={prefs}
              currency={currency}
              mode={mode}
              reference={reference}
              id={id}
            />
            {cursor && point && !dragging && (
              <ChartCursor point={point} y={cursor.y} geometry={geometry} prefs={prefs} />
            )}
          </svg>
          {selected && point && cursor && !dragging && (
            <ChartTooltip
              day={selected}
              first={visible[0]!}
              currency={currency}
              mode={mode}
              prefs={prefs}
              x={point.x}
              y={cursor.y}
              width={width}
              height={geometry.height}
            />
          )}
        </div>
      </div>
      <footer className="chart-bottom">
        <div className="zoom-buttons">
          <button
            aria-label="Zoom out"
            disabled={view.span >= full.span - 1e-6}
            onClick={() => zoom(1.25)}
          >
            −
          </button>
          <span>{visible.length} sessions</span>
          <button
            aria-label="Zoom in"
            disabled={view.span <= minimumSpan(days) + 1e-6}
            title="Minimum: seven calendar days"
            onClick={() => zoom(0.8)}
          >
            +
          </button>
          <button
            aria-label="Pan earlier"
            disabled={view.start <= full.start + 1e-6}
            onClick={() => {
              clearPending();
              pan(view.start - 1);
            }}
          >
            ←
          </button>
          <button
            aria-label="Pan later"
            disabled={view.start + view.span >= full.start + full.span - 1e-6}
            onClick={() => {
              clearPending();
              pan(view.start + 1);
            }}
          >
            →
          </button>
        </div>
        <ChartLegend prefs={prefs} onToggle={onToggle} />
        <p
          className="chart-hint"
          title="Keyboard: ← → inspect; Shift + ← → pan; + − zoom; Home reset; Escape dismiss tooltip."
          id={`${id}-help`}
        >
          Scroll to zoom · drag to pan
          <span className="sr-only">
            . Double-click to fit. Keyboard: left/right inspect, Shift + left/right pan, plus/minus
            zoom, Home reset, Escape dismiss. Seven calendar day minimum. Prices auto-fit.
          </span>
        </p>
      </footer>
      {mode === 'percent' && (
        <p className="reference-note">
          Axis: first visible session midpoint · {dayFormat(visible[0]!.day)} ·{' '}
          {priceFormat(reference, 'absolute', 1, currency)}. H/L changes use each series’ own
          first-visible value.
        </p>
      )}
    </>
  );
}
