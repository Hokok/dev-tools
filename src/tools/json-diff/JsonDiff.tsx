import { useCallback, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { JsonEditor } from "../../components/JsonEditor";
import { TextDiffEditor } from "../../components/TextDiffEditor";
import type { DiffNode, ParseError } from "../../types";
import "../tool.css";

/** 深度优先展开 diff 树，返回扁平化变更节点列表。
 * 跳过根节点本身（path 恒为 `$`，无展示意义），只收集其子节点中的变更。
 */
function flattenChanges(node: DiffNode, out: DiffNode[] = []): DiffNode[] {
  if (node.change !== "modified" || node.children.length === 0) {
    out.push(node);
  }
  for (const c of node.children) {
    flattenChanges(c, out);
  }
  return out;
}

export function JsonDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [changes, setChanges] = useState<DiffNode[]>([]);
  const [leftPretty, setLeftPretty] = useState("");
  const [rightPretty, setRightPretty] = useState("");
  const [error, setError] = useState<ParseError | null>(null);

  const compare = useCallback(async () => {
    if (!left.trim() || !right.trim()) return;
    setError(null);
    try {
      const node = await invoke<DiffNode>("compare_json", { left, right });
      // 用 Rust 的格式化把两边标准化为 pretty JSON，交给 Monaco diff
      const [lp, rp] = await Promise.all([
        invoke<string>("fmt_json", { input: left, indent: 2 }),
        invoke<string>("fmt_json", { input: right, indent: 2 }),
      ]);
      setLeftPretty(lp);
      setRightPretty(rp);
      // 收集根节点下的所有变更（跳过根自身，其 path 恒为 `$`）
      setChanges(node.children.flatMap((c) => flattenChanges(c)));
    } catch (e) {
      setError(e as ParseError);
    }
  }, [left, right]);

  return (
    <div className="tool-page">
      <div className="toolbar">
        <button onClick={compare}>比对</button>
      </div>
      {error && (
        <div className="error-box">
          解析失败: {error.message}（第 {error.line} 行，第 {error.column} 列）
        </div>
      )}
      <div className="split-view">
        <div className="pane">
          <div className="pane-title">左值</div>
          <JsonEditor value={left} onChange={setLeft} />
        </div>
        <div className="pane">
          <div className="pane-title">右值</div>
          <JsonEditor value={right} onChange={setRight} />
        </div>
      </div>
      <div className="split-view" style={{ flex: 2 }}>
        <div className="pane">
          <div className="pane-title">diff 视图（标准化后）</div>
          {leftPretty || rightPretty ? (
            <TextDiffEditor original={leftPretty} modified={rightPretty} />
          ) : (
            <div className="hint">点击「比对」查看结果</div>
          )}
        </div>
        <div className="pane">
          <div className="pane-title">变更路径（{changes.length}）</div>
          {changes.length === 0 ? (
            <div className="hint">完全一致</div>
          ) : (
            <div className="path-list">
              {changes.map((c, i) => (
                <div key={i} className="path-item">
                  <span className={`badge badge-${c.change}`}>{c.change}</span>
                  <span className="path-text">{c.path}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
