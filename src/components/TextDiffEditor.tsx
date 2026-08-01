import { DiffEditor } from "@monaco-editor/react";

interface TextDiffEditorProps {
  original: string;
  modified: string;
  height?: number | string;
  language?: string;
}

/** 基于 Monaco DiffEditor 的左右分栏比对视图 */
export function TextDiffEditor({
  original,
  modified,
  height = "100%",
  language = "json",
}: TextDiffEditorProps) {
  return (
    <DiffEditor
      height={height}
      language={language}
      theme="vs-dark"
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
