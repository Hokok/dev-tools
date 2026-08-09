import { useEffect, useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useAppStore } from "../store/app";
import type { ParseError } from "../types";

export const editorOptions: editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  fontSize: 13,
  scrollBeyondLastLine: false,
  wordWrap: "on",
  renderWhitespace: "none",
  lineNumbersMinChars: 3,
  // 容器尺寸变化（如分栏拖拽）时自动重算布局，否则高亮/可见区域会错位
  automaticLayout: true,
};

interface JsonEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: number | string;
  onMount?: OnMount;
  language?: string;
  /** 解析错误：非空时自动定位光标到出错行列 */
  error?: ParseError | null;
}

/** 统一封装的 Monaco 编辑器（默认 JSON），主题跟随全局设置 */
export function JsonEditor({
  value,
  onChange,
  readOnly,
  height = "100%",
  onMount,
  language = "json",
  error,
}: JsonEditorProps) {
  const theme = useAppStore((s) => s.theme);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleMount: OnMount = (ed, monaco) => {
    editorRef.current = ed;
    onMount?.(ed, monaco);
  };

  // 解析错误时定位光标到出错行列
  useEffect(() => {
    const ed = editorRef.current;
    if (!ed || !error) return;
    const line = Math.max(1, error.line);
    const col = Math.max(1, error.column);
    ed.revealPositionInCenter({ lineNumber: line, column: col }, 0);
    ed.setPosition({ lineNumber: line, column: col });
    ed.focus();
  }, [error]);

  return (
    <Editor
      height={height}
      language={language}
      theme={theme === "dark" ? "vs-dark" : "light"}
      value={value}
      onChange={(v) => onChange?.(v ?? "")}
      onMount={handleMount}
      options={{
        ...editorOptions,
        readOnly: readOnly ?? false,
        // 关闭 Monaco 自带的文件拖放，避免拦截应用级拖拽
        dropIntoEditor: { enabled: false },
      }}
    />
  );
}
