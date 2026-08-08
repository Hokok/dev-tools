import { useEffect, useMemo, useRef } from "react";
import type { editor } from "monaco-editor";
import type { OnMount } from "@monaco-editor/react";
import { JsonEditor } from "./JsonEditor";
import { annotatedJson, type FoldMarker } from "../utils/arrayMarkers";

let styleEl: HTMLStyleElement | null = null;
const countClasses = new Map<string, string>();

function countClass(marker: FoldMarker): string {
  const key = `${marker.kind}-${marker.count}`;
  const cached = countClasses.get(key);
  if (cached) return cached;
  if (!styleEl) {
    styleEl = document.createElement("style");
    document.head.appendChild(styleEl);
  }
  const cls = `jt-${marker.kind}-${marker.count}`;
  const label = marker.kind === "array" ? ` [${marker.count} 项]` : ` {${marker.count} 项}`;
  styleEl.sheet?.insertRule(
    `.monaco-editor .${cls}::after { content: "${label}"; color: var(--muted); }`,
  );
  countClasses.set(key, cls);
  return cls;
}

interface Props {
  value: unknown;
  /** 指定显示文本，不传时由 value 重新序列化生成 */
  displayText?: string;
}

/** 只读 JSON 展示：数组开头标注 [N 项]，对象标注 {N 项}，不修改 JSON 文本 */
export function AnnotatedJsonView({ value, displayText }: Props) {
  const { text, markers } = useMemo(() => {
    const { text, markers } = annotatedJson(value);
    return { text: displayText ?? text, markers };
  }, [value, displayText]);
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
      options: { afterContentClassName: countClass(m) },
    }));
    decIds.current = ed.deltaDecorations(decIds.current, decs);
  };

  const handleMount: OnMount = (ed) => {
    editorRef.current = ed;
    applyDecorations();
  };

  useEffect(applyDecorations, [markers]);

  return <JsonEditor value={text} readOnly onMount={handleMount} />;
}