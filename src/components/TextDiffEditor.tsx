import { DiffEditor } from "@monaco-editor/react";
import { useAppStore } from "../store/app";

interface TextDiffEditorProps {
  original: string;
  modified: string;
  height?: number | string;
  language?: string;
}

/** 基于 Monaco DiffEditor 的左右分栏比对视图，主题跟随全局设置 */
export function TextDiffEditor({
  original,
  modified,
  height = "100%",
  language = "json",
}: TextDiffEditorProps) {
  const theme = useAppStore((s) => s.theme);

  return (
    <DiffEditor
      height={height}
      language={language}
      theme={theme === "dark" ? "vs-dark" : "light"}
      original={original}
      modified={modified}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        scrollBeyondLastLine: false,
        wordWrap: "on",
        readOnly: true,
        renderSideBySide: true,
        renderOverviewRuler: true,
      }}
    />
  );
}
