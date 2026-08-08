import { useRef, useState } from "react";
import { TOOLS } from "../index";
import { useSettingsStore } from "../../store/settings";
import "../tool.css";

/** 工具显隐与排序配置页：勾选启用、拖拽排序、重置默认 */
export function Settings() {
  const order = useSettingsStore((s) => s.order);
  const setEnabled = useSettingsStore((s) => s.setEnabled);
  const reorder = useSettingsStore((s) => s.reorder);
  const reset = useSettingsStore((s) => s.reset);
  const dragIdxRef = useRef<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  // 已启用按配置顺序在前，未启用的工具排后供勾选
  const enabled = order.map((id) => TOOLS.find((t) => t.id === id)!).filter(Boolean);
  const disabled = TOOLS.filter((t) => !order.includes(t.id));
  const items = [...enabled, ...disabled];

  const handleDragStart = (e: React.DragEvent, orderIdx: number) => {
    dragIdxRef.current = orderIdx;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(orderIdx));
  };

  const handleDragOver = (e: React.DragEvent, orderIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverIdx(orderIdx);
  };

  const handleDragLeave = () => {
    setOverIdx(null);
  };

  const handleDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    const fromIdx = dragIdxRef.current;
    if (fromIdx === null || fromIdx === toIdx) {
      dragIdxRef.current = null;
      setOverIdx(null);
      return;
    }
    reorder(fromIdx, toIdx);
    dragIdxRef.current = null;
    setOverIdx(null);
  };

  const handleDragEnd = () => {
    dragIdxRef.current = null;
    setOverIdx(null);
  };

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
          const isDragging = dragIdxRef.current === orderIdx;
          return (
            <div
              key={tool.id}
              className={`settings-item${isDragging ? " dragging" : ""}${overIdx === orderIdx && dragIdxRef.current !== orderIdx ? " drag-over" : ""}`}
              draggable={isEnabled}
              onDragStart={(e) => {
                if (isEnabled) handleDragStart(e, orderIdx);
              }}
              onDragOver={(e) => {
                if (isEnabled) handleDragOver(e, orderIdx);
              }}
              onDragLeave={handleDragLeave}
              onDrop={(e) => {
                if (isEnabled) handleDrop(e, orderIdx);
              }}
              onDragEnd={handleDragEnd}
            >
              {isEnabled && (
                <span className="drag-handle" title="拖拽排序">
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
