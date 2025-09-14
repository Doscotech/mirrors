import { useCallback, useRef } from 'react';

interface LongPressOptions {
  ms?: number;
  moveTolerance?: number; // pixels
  onCancel?: () => void;
}

interface Point { x: number; y: number; }

function getPoint(e: PointerEvent | React.PointerEvent): Point {
  return { x: (e as PointerEvent).clientX, y: (e as PointerEvent).clientY };
}

export function useLongPress(onLongPress: (e: PointerEvent | React.PointerEvent) => void, opts: LongPressOptions = {}) {
  const { ms = 450, moveTolerance = 8, onCancel } = opts;
  const timerRef = useRef<number | null>(null);
  const originRef = useRef<Point | null>(null);
  const triggeredRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    triggeredRef.current = false;
    originRef.current = getPoint(e);
    clear();
    timerRef.current = window.setTimeout(() => {
      triggeredRef.current = true;
      onLongPress(e);
    }, ms);
  }, [ms, onLongPress, clear]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!originRef.current || !timerRef.current) return;
    const p = getPoint(e);
    const dx = Math.abs(p.x - originRef.current.x);
    const dy = Math.abs(p.y - originRef.current.y);
    if (dx > moveTolerance || dy > moveTolerance) {
      clear();
      onCancel?.();
    }
  }, [moveTolerance, onCancel, clear]);

  const onPointerUp = useCallback(() => {
    if (!triggeredRef.current) {
      clear();
      onCancel?.();
    }
  }, [onCancel, clear]);

  const onPointerLeave = onPointerUp;

  return { onPointerDown, onPointerMove, onPointerUp, onPointerLeave };
}
