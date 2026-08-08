import { useEffect, useMemo, useRef } from "react";
import type { editor } from "monaco-editor";
import type { OnMount } from "@monaco-editor/react";
import { JsonEditor } from "./JsonEditor";
import { annotatedJson } from "../utils/arrayMarkers";

// 动态生成每类数量的行尾标注 class：.jt-arr-N::after { content: " [N 项]" }
let styleEl: HTMLStyleElement | null = null;
const countClasses = new Map<number, string>();

function countClass(count: number): string {
  const cached = countClasses.get(count);
  if (cached) return cached;
  if (!styleEl) {
    styleEl = document.createElement("style");
    document.head.appendChild(styleEl);
  }
  const cls = `jt-arr-${count}`;
  styleEl.sheet?.insertRule(
    `.monaco-editor .${cls}::after { content: " [${count} 项]"; color: var(--muted); }`,
  );
  countClasses.set(count, cls);
  return cls;
}

interface Props {
  value: unknown;
}

/** 只读 JSON 展示：与 JSON 格式化页一致（Monaco），数组开括号行尾用
 *  decoration 标注元素数量，不修改 JSON 文本本身 */
export function AnnotatedJsonView({ value }: Props) {
  const { text, markers } = useMemo(() => annotatedJson(value), [value]);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decIds = useRef<string[]>([]);

  const applyDecorations = () => {
    const ed = editorRef.current;
    if (!ed) return;
    const decs = markers.map((m) => ({
      range: {
        startLineNumber: m.line,
        startColumn: 1,
        endLineNumber: m.line,
        endColumn: 1,
      },
      options: { afterContentClassName: countClass(m.count) },
    }));
    decIds.current = ed.deltaDecorations(decIds.current, decs);
  };

  const handleMount: OnMount = (ed) => {
    editorRef.current = ed;
    applyDecorations();
  };

  // 切换命中等导致 markers 变化时重新应用标注
  useEffect(applyDecorations, [markers]);

  return <JsonEditor value={text} readOnly onMount={handleMount} />;
}
