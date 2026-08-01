import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

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

/** 统一封装的 Monaco 编辑器（默认 JSON） */
export function JsonEditor({
  value,
  onChange,
  readOnly,
  height = "100%",
  onMount,
  language = "json",
}: JsonEditorProps) {
  return (
    <Editor
      height={height}
      language={language}
      theme="vs-dark"
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
