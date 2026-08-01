import { useEffect } from "react";
import { TOOLS, getTool } from "./tools";
import { useAppStore } from "./store/app";
import "./App.css";

export default function App() {
  const activeTool = useAppStore((s) => s.activeTool);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const Tool = getTool(activeTool)?.component ?? TOOLS[0].component;

  // 同步主题到根节点，驱动 CSS 变量
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-title">devbox</div>
        {TOOLS.map((t) => (
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
        <button className="tool-btn" onClick={toggleTheme}>
          <span className="tool-icon">{theme === "dark" ? "☀" : "🌙"}</span>
          <span>{theme === "dark" ? "浅色主题" : "深色主题"}</span>
        </button>
      </aside>
      <main className="work-area">
        <Tool />
      </main>
    </div>
  );
}
