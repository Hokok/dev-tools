import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { JsonEditor } from "../../components/JsonEditor";
import { JsonOutput } from "../../components/JsonOutput";
import { useAppStore } from "../../store/app";
import { useApplyHistory, useHistoryStore } from "../../store/history";
import { useFileDrop } from "../../hooks/useFileDrop";
import { ToolHistory } from "../../components/ToolHistory";
import type { ParseError } from "../../types";
import { isParseError } from "../../types";
import "../tool.css";

/** invoke reject 可能是字符串或 Error，统一提取消息 */
function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/** unknown → ParseError 或带 1:1 的通用错误 */
function toParseError(e: unknown): ParseError {
  if (isParseError(e)) return e;
  return { message: errMsg(e), line: 1, column: 1 };
}

export function Formatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState<ParseError | null>(null);
  const [autoRun, setAutoRun] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const extractedJson = useAppStore((s) => s.extractedJson);
  const setExtractedJson = useAppStore((s) => s.setExtractedJson);
  const addHistory = useHistoryStore((s) => s.addHistory);

  // 历史「加载」回填输入
  useApplyHistory("json-formatter", ({ input }) => setInput(input ?? ""));

  // 从日志提取页跳转过来时，载入一次并格式化，随后立即消费掉，
  // 避免切换缩进时 effect 用陈旧的 extractedJson 覆盖用户已编辑内容
  useEffect(() => {
    if (extractedJson) {
      setInput(extractedJson);
      invoke<string>("fmt_json", { input: extractedJson, indent })
        .then(setOutput)
        .catch((e) => setError(toParseError(e)));
      setExtractedJson("");
    }
  }, [extractedJson, indent, setExtractedJson]);

  const run = useCallback(
    async (mode: "format" | "minify") => {
      if (!input.trim()) return;
      setError(null);
      try {
        const result =
          mode === "format"
            ? await invoke<string>("fmt_json", { input, indent })
            : await invoke<string>("min_json", { input });
        setOutput(result);
        addHistory({
          toolId: "json-formatter",
          toolName: "JSON 格式化",
          action: mode === "format" ? "格式化" : "压缩",
          payload: { input },
        });
      } catch (e) {
        setError(toParseError(e));
      }
    },
    [input, indent],
  );

  // 粘贴后自动格式化（debounce 600ms，autoRun 关闭时跳过）
  useEffect(() => {
    if (!autoRun || !input.trim()) return;
    const t = setTimeout(() => {
      invoke<string>("fmt_json", { input, indent })
        .then(setOutput)
        .catch((e) => setError(toParseError(e)));
    }, 600);
    return () => clearTimeout(t);
  }, [input, indent, autoRun]);

  const loadFile = useCallback(async (file: File) => {
    setInput(await file.text());
  }, []);

  const { bindDrop, isDragging } = useFileDrop({ onFile: loadFile, accept: [".json", ".txt"] });

  const copyResult = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch (e) {
      setError({ message: `复制失败: ${errMsg(e)}`, line: 1, column: 1 });
    }
  }, [output]);

  return (
    <div className="tool-page">
      <div className="toolbar">
        <button className="btn btn-primary" data-hotkey="run" onClick={() => run("format")}>
          格式化
        </button>
        <button className="btn" onClick={() => run("minify")}>压缩</button>
        <label>
          缩进
          <select value={indent} onChange={(e) => setIndent(Number(e.target.value))}>
            <option value={2}>2</option>
            <option value={4}>4</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={autoRun} onChange={(e) => setAutoRun(e.target.checked)} />
          自动格式化
        </label>
        <button className="btn" data-hotkey="copy" onClick={copyResult} disabled={!output}>
          复制结果
        </button>
        <span className="spacer" />
        <button className="btn" onClick={() => fileRef.current?.click()}>打开文件</button>
        <input
          ref={fileRef}
          type="file"
          hidden
          onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
        />
        <ToolHistory toolId="json-formatter" />
      </div>
      {isDragging && <div className="drop-hint">松开以载入文件</div>}
      {error && (
        <div className="error-box">
          解析失败: {error.message}（第 {error.line} 行，第 {error.column} 列）
        </div>
      )}
      <div className="split-view">
        <div className="pane">
          <div className="pane-title">输入</div>
          <div className="drop-zone" {...bindDrop}>
            <JsonEditor value={input} onChange={setInput} error={error} />
          </div>
        </div>
        <div className="pane">
          <div className="pane-title">输出</div>
          <JsonOutput value={output} />
        </div>
      </div>
    </div>
  );
}