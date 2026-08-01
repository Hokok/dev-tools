import { TOOLS, getTool } from "./tools";
import { useAppStore } from "./store/app";
import "./App.css";

export default function App() {
  const activeTool = useAppStore((s) => s.activeTool);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const Tool = getTool(activeTool)?.component ?? TOOLS[0].component;

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
      </aside>
      <main className="work-area">
        <Tool />
      </main>
    </div>
  );
}
