import { useCallback, useEffect, useRef, useState } from "react";
import { TOOLS } from "../index";
import { useSettingsStore } from "../../store/settings";
import "../tool.css";

/** 工具显隐与排序配置页：勾选启用、拖拽排序、重置默认 */
export function Settings() {
  const order = useSettingsStore((s) => s.order);
  const setEnabled = useSettingsStore((s) => s.setEnabled);
  const reorder = useSettingsStore((s) => s.reorder);
  const reset = useSettingsStore((s) => s.reset);
  const [dragging, setDragging] = useState(false);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const dragFromRef = useRef<number | null>(null);
  const overIdxRef = useRef<number | null>(null);

  // 已启用按配置顺序在前，未启用的工具排后供勾选
  const enabled = order.map((id) => TOOLS.find((t) => t.id === id)!).filter(Boolean);
  const disabled = TOOLS.filter((t) => !order.includes(t.id));
  const items = [...enabled, ...disabled];

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragFromRef.current === null) return;
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const item = el?.closest<HTMLElement>("[data-order-idx]");
    const idx = item ? Number(item.dataset.orderIdx) : -1;
    const next = idx >= 0 ? idx : null;
    overIdxRef.current = next;
    setOverIdx(next);
  }, []);

  const handleMouseUp = useCallback(() => {
    const from = dragFromRef.current;
    const to = overIdxRef.current;
    dragFromRef.current = null;
    overIdxRef.current = null;
    setDragging(false);
    setOverIdx(null);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.style.userSelect = "";
    if (from !== null && to !== null && from !== to) {
      reorder(from, to);
    }
  }, [handleMouseMove, reorder]);

  const handleMouseDown = useCallback((e: React.MouseEvent, orderIdx: number) => {
    e.preventDefault();
    dragFromRef.current = orderIdx;
    setDragging(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.userSelect = "none";
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="tool-page">
      <div className="toolbar">
        <span className="hint">拖拽手柄调整启用工具顺序，取消勾选则隐藏</span>
        <span className="spacer" />
        <button className="btn btn-danger" onClick={reset}>
          恢复默认
        </button>
      </div>
      <div className="settings-list">
        {items.map((tool) => {
          const orderIdx = order.indexOf(tool.id);
          const isEnabled = orderIdx >= 0;
          const isDragging = dragging && dragFromRef.current === orderIdx;
          return (
            <div
              key={tool.id}
              data-order-idx={isEnabled ? orderIdx : undefined}
              className={`settings-item${isDragging ? " dragging" : ""}${overIdx === orderIdx && !isDragging ? " drag-over" : ""}`}
            >
              {isEnabled && (
                <span
                  className="drag-handle"
                  title="拖拽排序"
                  onMouseDown={(e) => handleMouseDown(e, orderIdx)}
                >
                  ⋮⋮
                </span>
              )}
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setEnabled(tool.id, e.target.checked)}
                />
              </label>
              <span className="tool-icon">{tool.icon}</span>
              <span className="settings-name">{tool.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}