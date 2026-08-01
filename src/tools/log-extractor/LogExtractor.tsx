import { useCallback, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { JsonEditor } from "../../components/JsonEditor";
import type { JsonMatch } from "../../types";
import { useAppStore } from "../../store/app";
import "../tool.css";

export function LogExtractor() {
  const [input, setInput] = useState("");
  const [matches, setMatches] = useState<JsonMatch[]>([]);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const setExtractedJson = useAppStore((s) => s.setExtractedJson);
  const fileRef = useRef<HTMLInputElement>(null);

  const extract = useCallback(async () => {
    if (!input.trim()) return;
    const result = await invoke<JsonMatch[]>("extract_json_cmd", { input });
    setMatches(result);
  }, [input]);

  const jumpToFormatter = useCallback(
    (value: unknown) => {
      setExtractedJson(JSON.stringify(value, null, 2));
      setActiveTool("json-formatter");
    },
    [setActiveTool, setExtractedJson],
  );

  const copy = useCallback(async (value: unknown) => {
    await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
  }, []);

  return (
    <div className="tool-page">
      <div className="toolbar">
        <button onClick={extract}>提取 JSON</button>
        <span className="hint">支持转义 JSON（如 {"{\"a\":1}"}）、跨行、日志前缀</span>
        <span className="spacer" />
        <button onClick={() => fileRef.current?.click()}>打开日志文件</button>
        <input
          ref={fileRef}
          type="file"
          hidden
          onChange={(e) => e.target.files?.[0] && e.target.files[0].text().then(setInput)}
        />
      </div>
      <div className="split-view">
        <div className="pane">
          <div className="pane-title">日志输入</div>
          <JsonEditor value={input} onChange={setInput} language="text" />
        </div>
        <div className="pane">
          <div className="pane-title">提取结果（{matches.length}）</div>
          {matches.length === 0 ? (
            <div className="hint">点击「提取 JSON」后在此列出命中项</div>
          ) : (
            <div className="match-list">
              {matches.map((m, i) => (
                <div key={i} className="match-item">
                  <div className="match-actions">
                    <span className="hint">[{m.start}..{m.end}]</span>
                    <button onClick={() => jumpToFormatter(m.value)}>格式化</button>
                    <button onClick={() => copy(m.value)}>复制</button>
                  </div>
                  <div className="match-preview">{JSON.stringify(m.value, null, 2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
