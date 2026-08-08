import { TOOLS } from "../index";
import { useSettingsStore } from "../../store/settings";
import "../tool.css";

/** 工具显隐与排序配置页：勾选启用、↑↓ 调整顺序、重置默认 */
export function Settings() {
  const order = useSettingsStore((s) => s.order);
  const setEnabled = useSettingsStore((s) => s.setEnabled);
  const move = useSettingsStore((s) => s.move);
  const reset = useSettingsStore((s) => s.reset);

  // 已启用按配置顺序在前，未启用的工具排后供勾选
  const enabled = order.map((id) => TOOLS.find((t) => t.id === id)!).filter(Boolean);
  const disabled = TOOLS.filter((t) => !order.includes(t.id));
  const items = [...enabled, ...disabled];

  return (
    <div className="tool-page">
      <div className="toolbar">
        <span className="hint">勾选要显示在侧边栏的工具，↑↓ 调整显示顺序</span>
        <span className="spacer" />
        <button className="btn btn-danger" onClick={reset}>恢复默认</button>
      </div>
      <div className="settings-list">
        {items.map((tool) => {
          const idx = order.indexOf(tool.id);
          const isEnabled = idx >= 0;
          return (
            <div key={tool.id} className="settings-item">
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setEnabled(tool.id, e.target.checked)}
                />
              </label>
              <span className="tool-icon">{tool.icon}</span>
              <span className="settings-name">{tool.name}</span>
              <span className="spacer" />
              {isEnabled && (
                <>
                  <button className="btn btn-sm" disabled={idx === 0} onClick={() => move(tool.id, -1)}>
                    ↑
                  </button>
                  <button className="btn btn-sm" disabled={idx === order.length - 1} onClick={() => move(tool.id, 1)}>
                    ↓
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
