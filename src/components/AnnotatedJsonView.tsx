import { useCallback, useEffect, useMemo, useRef } from "react";
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
  const cls = `jfc-${marker.kind}-${marker.count}`;
  const label = ` ... ${marker.count}`;
  if (!styleEl.sheet) {
    console.warn("countClass: styleEl.sheet is null, cannot inject CSS");
    countClasses.set(key, cls);
    return cls;
  }
  styleEl.sheet.insertRule(
    `.monaco-editor .${cls}::after { content: "${label}"; opacity: 0.7; margin-left: 4px; }`,
  );
  countClasses.set(key, cls);
  return cls;
}

interface Props {
  value: unknown;
  /** 不传时由 value 重新序列化生成 */
  displayText?: string;
}

/**
 * 只读 JSON 展示。
 * 折叠的数组/对象在括号所在行右侧标注 `... N`（N 为元素个数），
 * 展开后标注自动隐藏。不修改 JSON 文本。
 */
export function AnnotatedJsonView({ value, displayText }: Props) {
  const { text, markers } = useMemo(() => {
    const { text, markers } = annotatedJson(value);
    return { text: displayText ?? text, markers };
  }, [value, displayText]);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decIds = useRef<string[]>([]);
  const markersRef = useRef(markers);
  markersRef.current = markers;

  const updateDecorations = useCallback(() => {
    const ed = editorRef.current;
    if (!ed) return;

    const visible = ed.getVisibleRanges();
    const decs: editor.IModelDeltaDecoration[] = [];
    for (const m of markersRef.current) {
      const nextLine = m.line + 1;
      const nextVisible = visible.some(
        (r) => r.startLineNumber <= nextLine && nextLine <= r.endLineNumber,
      );
      if (nextVisible) continue;
      decs.push({
        range: {
          startLineNumber: m.line,
          startColumn: 1,
          endLineNumber: m.line,
          endColumn: 2,
        },
        options: { afterContentClassName: countClass(m) },
      });
    }
    decIds.current = ed.deltaDecorations(decIds.current, decs);
  }, []);

  const handleMount: OnMount = useCallback(
    (ed) => {
      editorRef.current = ed;

      updateDecorations();
      const disposable = ed.onDidChangeHiddenAreas(() => {
        // ponytail: setTimeout to let Monaco update visible ranges after fold
        setTimeout(() => updateDecorations(), 0);
      });
      ed.onDidDispose(() => disposable.dispose());
    },
    [updateDecorations],
  );

  useEffect(() => {
    updateDecorations();
  }, [markers, updateDecorations]);

  return <JsonEditor value={text} readOnly onMount={handleMount} />;
}