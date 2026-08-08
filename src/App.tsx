import { useEffect, useState } from "react";
import { TOOLS } from "./tools";
import { Settings } from "./tools/settings/Settings";
import { useAppStore } from "./store/app";
import { useSettingsStore } from "./store/settings";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { CommandPalette } from "./components/CommandPalette";
import "./App.css";

const SETTINGS_ID = "settings";

export default function App() {
  const activeTool = useAppStore((s) => s.activeTool);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const toolOrder = useSettingsStore((s) => s.order);
  const [cmdOpen, setCmdOpen] = useState(false);

  useKeyboardShortcuts(setCmdOpen);

  // 同步主题到根节点，驱动 CSS 变量
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // 按配置顺序渲染侧边栏菜单
  const visibleTools = toolOrder
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const isSettings = activeTool === SETTINGS_ID;
  // 当前工具被隐藏时（如历史「加载」）仍可渲染，仅菜单不高亮
  const active = isSettings ? null : TOOLS.find((t) => t.id === activeTool) ?? visibleTools[0];
  const ActiveTool = active?.component;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-title">devbox</div>
        {visibleTools.map((t) => (
          <button
            key={t.id}
            className={`tool-btn ${t.id === activeTool ? "active" : ""}`}
            onClick={() => setActiveTool(t.id)}
          >
            <span className="tool-icon">{t.icon}</span>
            <span>{t.name}</span>
          </button>
        ))}
        <div className="spacer" />
        <button
          className={`tool-btn ${isSettings ? "active" : ""}`}
          onClick={() => setActiveTool(SETTINGS_ID)}
        >
          <span className="tool-icon">⚙</span>
          <span>设置</span>
        </button>
        <button className="tool-btn" onClick={toggleTheme}>
          <span className="tool-icon">{theme === "dark" ? "☀" : "🌙"}</span>
          <span>{theme === "dark" ? "浅色主题" : "深色主题"}</span>
        </button>
      </aside>
      <main className="work-area">
        <div className="tool-slot">
          <ErrorBoundary>
            {isSettings ? <Settings /> : ActiveTool && <ActiveTool key={activeTool} />}
          </ErrorBoundary>
        </div>
      </main>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
