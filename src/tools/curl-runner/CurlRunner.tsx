import { useCallback, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { JsonEditor } from "../../components/JsonEditor";
import { useApplyHistory, useHistoryStore } from "../../store/history";
import { ToolHistory } from "../../components/ToolHistory";
import type { HttpResult } from "../../types";
import "../tool.css";

/** 状态码徽章样式 */
function statusClass(status: number): string {
  if (status >= 200 && status < 300) return "badge-added";
  if (status >= 400 && status < 500) return "badge-modified";
  if (status >= 500) return "badge-removed";
  return "";
}

export function CurlRunner() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<HttpResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const addHistory = useHistoryStore((s) => s.addHistory);

  // 历史「加载」回填
  useApplyHistory("curl-runner", ({ input }) => setInput(input ?? ""));

  const run = useCallback(async () => {
    if (!input.trim()) return;
    setRunError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await invoke<HttpResult>("run_curl_script_cmd", { script: input });
      setResult(res);
      addHistory({
        toolId: "curl-runner",
        toolName: "Curl 执行",
        action: "执行 curl 脚本",
        payload: { input },
      });
    } catch (e) {
      setRunError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [input, addHistory]);

  // 响应体：尝试 JSON 解析 → 格式化高亮；失败原样文本
  const view = useMemo(() => {
    if (!result) return null;
    try {
      return { pretty: JSON.stringify(JSON.parse(result.body), null, 2), raw: false };
    } catch {
      return { pretty: result.body, raw: true };
    }
  }, [result]);

  return (
    <div className="tool-page">
      <div className="toolbar">
        <button className="btn btn-primary" data-hotkey="run" onClick={run} disabled={!input.trim() || loading}>
          {loading ? "执行中…" : "执行"}
        </button>
        <span className="hint">粘贴 curl 脚本 → 执行（系统 curl 直发，支持全部语法）</span>
        <span className="hint" title="请求由本机 curl 发出，不校验 TLS 证书需脚本自加 -k">
          ⚠️ 由系统 curl 执行
        </span>
        <span className="spacer" />
        <button className="btn" onClick={() => setInput("")}>清空</button>
        <ToolHistory toolId="curl-runner" />
      </div>
      {runError && <div className="error-box">执行失败: {runError}</div>}

      <div className="pane" style={{ flex: 2 }}>
        <div className="pane-title">curl 脚本</div>
        <JsonEditor value={input} onChange={setInput} language="text" />
      </div>

      {result && view && (
        <div className="split-view" style={{ flex: 2 }}>
          <div className="pane">
            <div className="pane-title">
              <span className={`badge ${statusClass(result.status)}`}>
                {result.status} {result.status_text}
              </span>
              <span className="hint"> {result.duration_ms} ms</span>
            </div>
            <div className="resp-headers">
              {result.headers.map(([k, v], i) => (
                <div key={i} className="kv-item">
                  <span className="kv-key">{k}</span>
                  <span className="kv-value">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pane">
            <div className="pane-title">响应体{view.raw ? "" : "（JSON 已格式化）"}</div>
            <JsonEditor value={view.pretty} readOnly language={view.raw ? "text" : "json"} />
          </div>
        </div>
      )}
    </div>
  );
}
