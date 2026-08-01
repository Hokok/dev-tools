import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { JsonEditor } from "../../components/JsonEditor";
import { useAppStore } from "../../store/app";
import type { ParseError } from "../../types";
import "../tool.css";

export function Formatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState<ParseError | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const extractedJson = useAppStore((s) => s.extractedJson);

  // 从日志提取页跳转过来时，自动载入并格式化
  useEffect(() => {
    if (extractedJson) {
      setInput(extractedJson);
      invoke<string>("fmt_json", { input: extractedJson, indent }).then(setOutput).catch(setError);
    }
  }, [extractedJson, indent]);

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
      } catch (e) {
        setError(e as ParseError);
      }
    },
    [input, indent],
  );

  const loadFile = useCallback(async (file: File) => {
    setInput(await file.text());
  }, []);

  return (
    <div className="tool-page">
      <div className="toolbar">
        <button onClick={() => run("format")}>格式化</button>
        <button onClick={() => run("minify")}>压缩</button>
        <label>
          缩进
          <select value={indent} onChange={(e) => setIndent(Number(e.target.value))}>
            <option value={2}>2</option>
            <option value={4}>4</option>
          </select>
        </label>
        <span className="spacer" />
        <button onClick={() => fileRef.current?.click()}>打开文件</button>
        <input
          ref={fileRef}
          type="file"
          hidden
          onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
        />
      </div>
      {error && (
        <div className="error-box">
          解析失败: {error.message}（第 {error.line} 行，第 {error.column} 列）
        </div>
      )}
      <div className="split-view">
        <div className="pane">
          <div className="pane-title">输入</div>
          <JsonEditor value={input} onChange={setInput} />
        </div>
        <div className="pane">
          <div className="pane-title">输出</div>
          <JsonEditor value={output} readOnly />
        </div>
      </div>
    </div>
  );
}
