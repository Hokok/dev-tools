import { useCallback, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import "./resizable-split.css";

interface ResizableSplitProps {
  left: ReactNode;
  right: ReactNode;
  /** 左 pane 初始占比（0~1），默认 0.5 */
  defaultRatio?: number;
  /** 透传给外层容器的 style（如 flex 权重） */
  style?: CSSProperties;
}

const MIN_RATIO = 0.15;
const MAX_RATIO = 0.85;

/**
 * 可拖拽分隔的左右分栏：中间 6px 分隔条，按住拖动调整两侧宽度。
 * 不持久化比例，组件卸载即复位（YAGNI，需持久化再加）。
 */
export function ResizableSplit({ left, right, defaultRatio = 0.5, style }: ResizableSplitProps) {
  const [ratio, setRatio] = useState(defaultRatio);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startRatio: number } | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { startX: e.clientX, startRatio: ratioRef.current };
    const move = (ev: PointerEvent) => {
      const d = dragRef.current;
      const el = containerRef.current;
      if (!d || !el) return;
      const width = el.getBoundingClientRect().width;
      if (width <= 0) return;
      const delta = (ev.clientX - d.startX) / width;
      const next = Math.min(MAX_RATIO, Math.max(MIN_RATIO, d.startRatio + delta));
      setRatio(next);
    };
    const up = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.body.style.cursor = "";
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    document.body.style.cursor = "col-resize";
  }, []);

  // 拖拽回调中读取最新 ratio（避免闭包陈旧）
  const ratioRef = useRef(ratio);
  ratioRef.current = ratio;

  const leftStyle: CSSProperties = {
    flexGrow: ratio,
    flexBasis: 0,
    flexShrink: 1,
    minWidth: 0,
  };
  const rightStyle: CSSProperties = {
    flexGrow: 1 - ratio,
    flexBasis: 0,
    flexShrink: 1,
    minWidth: 0,
  };

  return (
    <div className="resizable-split" ref={containerRef} style={style}>
      <div className="resizable-pane" style={leftStyle}>
        {left}
      </div>
      <div className="resize-handle" onPointerDown={onPointerDown} title="拖动调整宽度" />
      <div className="resizable-pane" style={rightStyle}>
        {right}
      </div>
    </div>
  );
}
