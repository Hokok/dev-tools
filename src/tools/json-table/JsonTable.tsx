import { useCallback, useRef, useState } from "react";
import { JsonEditor } from "../../components/JsonEditor";
import "../tool.css";

/** 递归扁平化对象，嵌套 key 用 `.` 连接，返回表头列 */
function flatten(obj: unknown, prefix = "", out: Record<string, string> = {}): Record<string, string> {
  if (obj === null) {
    out[prefix] = "";
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out));
    return out;
  }
  if (typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v !== null && typeof v === "object") {
        flatten(v, key, out);
      } else {
        out[key] = String(v);
      }
    }
    return out;
  }
  out[prefix] = String(obj);
  return out;
}

/** 数组 → 行对象数组（统一所有行的列） */
export function toRows(data: unknown): Record<string, string>[] {
  const arr = Array.isArray(data) ? data : [data];
  const rows = arr.map((item) => flatten(item));
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  return rows.map((r) => {
    const row: Record<string, string> = {};
    for (const h of headers) row[h] = r[h] ?? "";
    return row;
  });
}

export function toCsv(rows: Record<string, string>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (s: string) => {
    // 防止 CSV 公式注入：以 = + - @ 开头的单元格前缀单引号
    let v = /^[=+\-@]/.test(s) ? `'${s}` : s;
    if (/[",\n]/.test(v)) v = `"${v.replace(/"/g, '""')}"`;
    return v;
  };
  const lines = [headers.map(escape).join(",")];
  for (const r of rows) {
    lines.push(headers.map((h) => escape(r[h] ?? "")).join(","));
  }
  return lines.join("\n");
}

export function toJsonl(rows: Record<string, string>[]): string {
  return rows.map((r) => JSON.stringify(r)).join("\n");
}

export function JsonTable() {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<Record<string, string>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parse = useCallback(() => {
    setError(null);
    try {
      const data = JSON.parse(input);
      setRows(toRows(data));
    } catch (e) {
      setError((e as Error).message);
      setRows(null);
    }
  }, [input]);

  const download = useCallback((content: string, name: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="tool-page">
      <div className="toolbar">
        <button onClick={parse}>转表格</button>
        {rows && (
          <>
            <button onClick={() => download(toCsv(rows), "export.csv", "text/csv")}>导出 CSV</button>
            <button onClick={() => download(toJsonl(rows), "export.jsonl", "application/x-ndjson")}>
              导出 JSONL
            </button>
            <span className="hint">{rows.length} 行</span>
          </>
        )}
        <span className="spacer" />
        <button onClick={() => fileRef.current?.click()}>打开文件</button>
        <input
          ref={fileRef}
          type="file"
          hidden
          onChange={(e) => e.target.files?.[0] && e.target.files[0].text().then(setInput)}
        />
      </div>
      {error && <div className="error-box">解析失败: {error}</div>}
      <div className="split-view">
        <div className="pane">
          <div className="pane-title">JSON 输入（对象或数组）</div>
          <JsonEditor value={input} onChange={setInput} />
        </div>
        <div className="pane">
          <div className="pane-title">表格预览</div>
          {rows ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    {Object.keys(rows[0] ?? {}).map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 200).map((r, i) => (
                    <tr key={i}>
                      {Object.values(r).map((v, j) => (
                        <td key={j}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="hint">点击「转表格」查看预览</div>
          )}
        </div>
      </div>
    </div>
  );
}
