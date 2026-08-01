import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useAppStore } from "../store/app";

export const editorOptions: editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  fontSize: 13,
  scrollBeyondLastLine: false,
  wordWrap: "on",
  renderWhitespace: "none",
  lineNumbersMinChars: 3,
};

interface JsonEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: number | string;
  onMount?: OnMount;
  language?: string;
}

/** 统一封装的 Monaco 编辑器（默认 JSON），主题跟随全局设置 */
export function JsonEditor({
  value,
  onChange,
  readOnly,
  height = "100%",
  onMount,
  language = "json",
}: JsonEditorProps) {
  const theme = useAppStore((s) => s.theme);

  return (
    <Editor
      height={height}
      language={language}
      theme={theme === "dark" ? "vs-dark" : "light"}
      value={value}
      onChange={(v) => onChange?.(v ?? "")}
      onMount={onMount}
      options={{
        ...editorOptions,
        readOnly: readOnly ?? false,
        // 关闭 Monaco 自带的文件拖放，避免拦截应用级拖拽
        dropIntoEditor: { enabled: false },
      }}
    />
  );
}
