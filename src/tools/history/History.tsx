import { useCallback } from "react";
import { useHistoryStore, type HistoryItem } from "../../store/history";
import "../tool.css";

function fmtTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function History() {
  const items = useHistoryStore((s) => s.items);
  const loadFromHistory = useHistoryStore((s) => s.loadFromHistory);
  const removeItem = useHistoryStore((s) => s.removeItem);
  const clearHistory = useHistoryStore((s) => s.clearHistory);

  const copyInput = useCallback(async (item: HistoryItem) => {
    const first = Object.values(item.payload)[0] ?? "";
    try {
      await navigator.clipboard.writeText(first);
    } catch {
      // 剪贴板不可用时忽略
    }
  }, []);

  return (
    <div className="tool-page">
      <div className="toolbar">
        <button onClick={clearHistory} disabled={items.length === 0}>
          清空历史
        </button>
        <span className="hint">共 {items.length} 条（最多 30 条）</span>
        <span className="hint">点击「加载」可回到对应工具并还原当时的输入</span>
      </div>
      {items.length === 0 ? (
        <div className="hint">暂无历史记录。执行工具操作后会自动记录输入内容。</div>
      ) : (
        <div className="match-list">
          {items.map((item) => (
            <div key={item.id} className="match-item">
              <div className="match-actions">
                <span className="badge">{item.toolName}</span>
                <span className="hint">{item.action}</span>
                <span className="hint">{fmtTime(item.timestamp)}</span>
                <span className="spacer" />
                <button onClick={() => loadFromHistory(item)}>加载</button>
                <button onClick={() => copyInput(item)}>复制输入</button>
                <button onClick={() => removeItem(item.id)}>删除</button>
              </div>
              <div className="match-preview" title={Object.values(item.payload)[0] ?? ""}>
                {item.preview}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
