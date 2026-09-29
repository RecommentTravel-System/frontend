import { useEffect, useRef, useState } from 'react';


const storageKey = 'wayvee-search-map-split';
function readSplit() {
  try { const raw = localStorage.getItem(storageKey); const value = Number(raw); return raw !== null && Number.isFinite(value) && value >= 0 && value <= 1 ? value : .38; } catch { return .38; }
}
export function useMapResize(active, root) {
  const [split, setSplit] = useState(readSplit);
  const [available, setAvailable] = useState(800);
  const [dragging, setDragging] = useState(false);
  const previous = useRef(split || .38);
  const drag = useRef(null);
  useEffect(() => {
    if (!active || !root.current) return;
    const element = root.current;
    const measure = () => {
      const style = getComputedStyle(element);
      const sidebar = element.querySelector('.search-sidebar');
      const width = element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - (sidebar?.getBoundingClientRect().width || 200) - 18 - 3 * (parseFloat(style.columnGap) || 0);
      setAvailable(Math.max(0, width));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [active, root]);
  const max = Math.max(220, available - 280);
  const width = split === 0 ? 0 : Math.min(max, Math.max(220, available * split));
  function update(value) {
    const next = Math.min(1, Math.max(0, value));
    setSplit(next);
    if (next > 0) previous.current = next;
    try { localStorage.setItem(storageKey, String(next)); } catch { /* Resizing remains usable without persistence. */ }
  }
  function resize(pixels) { update(pixels < 110 ? 0 : Math.min(max, Math.max(220, pixels)) / Math.max(1, available)); }
  function end() { drag.current = null; setDragging(false); }
  return {
    width, collapsed: split === 0, dragging: active && dragging,
    toggle: () => update(split === 0 ? previous.current : 0),
    reset: () => update(.38),
    separator: {
      role: 'separator', tabIndex: 0, 'aria-orientation': 'vertical', 'aria-label': 'Điều chỉnh độ rộng danh sách và bản đồ',
      'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(width / Math.max(1, max) * 100),
      'aria-valuetext': split === 0 ? 'Danh sách đã thu gọn, bản đồ mở rộng' : `Danh sách rộng ${Math.round(width)} pixel`,
      'aria-controls': 'search-result-panel',
      onPointerDown(event) {
        if (event.button !== 0 || !window.matchMedia('(min-width: 851px)').matches) return;
        event.preventDefault(); event.currentTarget.focus();
        drag.current = { x: event.clientX, width };
        event.currentTarget.setPointerCapture(event.pointerId); setDragging(true);
      },
      onPointerMove(event) { if (drag.current) resize(drag.current.width + event.clientX - drag.current.x); },
      onPointerUp(event) { end(); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); },
      onPointerCancel: end, onLostPointerCapture: end,
      onDoubleClick: () => update(.38),
      onKeyDown(event) {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'Home' || (event.key === 'ArrowLeft' && width <= 220)) update(0);
        else if (event.key === 'ArrowRight' && split === 0) resize(220);
        else if (event.key === 'End') resize(max);
        else if (event.key === 'Enter') update(split === 0 ? previous.current : 0);
        else resize(width + (event.key === 'ArrowLeft' ? -1 : 1) * (event.shiftKey ? 80 : 24));
      },
    },
  };
}
