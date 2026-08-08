export interface FoldMarker {
  /// 开括号所在行（1-based）
  line: number;
  count: number;
  kind: "array" | "object";
}

interface WalkResult {
  text: string;
  endLine: number;
}

function walk(v: unknown, depth: number, startLine: number, markers: FoldMarker[]): WalkResult {
  const pad = "  ".repeat(depth);
  const padIn = "  ".repeat(depth + 1);
  if (Array.isArray(v)) {
    if (v.length === 0) return { text: "[]", endLine: startLine };
    const parts: string[] = ["["];
    let line = startLine;
    markers.push({ line, count: v.length, kind: "array" });
    for (let i = 0; i < v.length; i++) {
      const r = walk(v[i], depth + 1, line + 1, markers);
      parts.push(`${padIn}${r.text}${i < v.length - 1 ? "," : ""}`);
      line = r.endLine;
    }
    parts.push(`${pad}]`);
    return { text: parts.join("\n"), endLine: line + 1 };
  }
  if (v !== null && typeof v === "object") {
    const obj = v as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length === 0) return { text: "{}", endLine: startLine };
    const parts: string[] = ["{"];
    let line = startLine;
    markers.push({ line, count: keys.length, kind: "object" });
    keys.forEach((k, i) => {
      const r = walk(obj[k], depth + 1, line + 1, markers);
      parts.push(`${padIn}${JSON.stringify(k)}: ${r.text}${i < keys.length - 1 ? "," : ""}`);
      line = r.endLine;
    });
    parts.push(`${pad}}`);
    return { text: parts.join("\n"), endLine: line + 1 };
  }
  return { text: JSON.stringify(v), endLine: startLine };
}

/// 生成与 JSON.stringify(v, null, 2) 完全一致的文本，并返回每个非空数组/对象
/// 开括号所在行及元素个数（供 Monaco decoration 标注，文本不被改动）
export function annotatedJson(value: unknown): { text: string; markers: FoldMarker[] } {
  const markers: FoldMarker[] = [];
  const text = walk(value, 0, 1, markers).text;
  return { text, markers };
}
