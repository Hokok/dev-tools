import { useState } from "react";
import { CATEGORIES, TOOLS } from "../tools";
import type { ToolDef } from "../tools";
import { useAppStore } from "../store/app";
import { useSettingsStore } from "../store/settings";

const SETTINGS_ID = "settings";

interface SidebarProps {
  isSettings: boolean;
  onSelect: (id: string) => void;
}

/** 侧边栏：按分类分组渲染工具，分组可折叠；底部为主题切换与设置 */
export function Sidebar({ isSettings, onSelect }: SidebarProps) {
  const activeTool = useAppStore((s) => s.activeTool);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const toolOrder = useSettingsStore((s) => s.order);

  // 折叠状态：category id → 是否折叠（默认展开）
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const visibleTools = toolOrder
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  // 按 CATEGORIES 定义顺序分组，空组跳过
  const groups = CATEGORIES.map((c) => ({
    ...c,
    tools: visibleTools.filter((t) => t.category === c.id),
  })).filter((g) => g.tools.length > 0);

  const toggleCollapse = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const renderTool = (t: ToolDef) => (
    <button
      key={t.id}
      className={`tool-btn ${t.id === activeTool ? "active" : ""}`}
      onClick={() => onSelect(t.id)}
      title={t.name}
    >
      <span className="tool-icon">{t.icon}</span>
      <span className="tool-btn-label">{t.name}</span>
    </button>
  );

  return (
    <aside className="sidebar">
      {groups.map((g) => (
        <div key={g.id} className="sidebar-group">
          <button
            className="sidebar-group-header"
            onClick={() => toggleCollapse(g.id)}
            title={collapsed[g.id] ? "展开分组" : "折叠分组"}
          >
            <span className="sidebar-group-arrow">{collapsed[g.id] ? "▸" : "▾"}</span>
            <span className="sidebar-group-label">{g.label}</span>
          </button>
          {!collapsed[g.id] && (
            <div className="sidebar-group-items">{g.tools.map(renderTool)}</div>
          )}
        </div>
      ))}
      <div className="spacer" />
      <button className="tool-btn" onClick={toggleTheme} title={theme === "dark" ? "切换浅色主题" : "切换深色主题"}>
        <span className="tool-icon">{theme === "dark" ? "☀" : "🌙"}</span>
        <span className="tool-btn-label">{theme === "dark" ? "浅色主题" : "深色主题"}</span>
      </button>
      <button
        className={`tool-btn ${isSettings ? "active" : ""}`}
        onClick={() => onSelect(SETTINGS_ID)}
        title="设置"
      >
        <span className="tool-icon">⚙</span>
        <span className="tool-btn-label">设置</span>
      </button>
    </aside>
  );
}
