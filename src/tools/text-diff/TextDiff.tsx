import { useCallback, useRef, useState } from "react";
import { JsonEditor } from "../../components/JsonEditor";
import { TextDiffEditor } from "../../components/TextDiffEditor";
import { useApplyHistory, useHistoryStore } from "../../store/history";
import { ToolHistory } from "../../components/ToolHistory";
import { useFileDrop } from "../../hooks/useFileDrop";
import "../tool.css";

export function TextDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [showDiff, setShowDiff] = useState(false);
  const leftFileRef = useRef<HTMLInputElement>(null);
  const rightFileRef = useRef<HTMLInputElement>(null);
  const addHistory = useHistoryStore((s) => s.addHistory);

  // 历史「加载」回填输入
  useApplyHistory("text-diff", ({ left, right }) => {
    if (left !== undefined) setLeft(left);
    if (right !== undefined) setRight(right);
  });

  const compare = () => {
    setShowDiff(true);
    addHistory({
      toolId: "text-diff",
      toolName: "文本比对",
      action: "比对",
      payload: { left, right },
    });
  };

  const loadLeft = useCallback(async (file: File) => {
    setLeft(await file.text());
  }, []);
  const loadRight = useCallback(async (file: File) => {
    setRight(await file.text());
  }, []);

  const leftDrop = useFileDrop({ onFile: loadLeft });
  const rightDrop = useFileDrop({ onFile: loadRight });

  return (
    <div className="tool-page">
      <div className="toolbar">
        <button className="btn btn-primary" data-hotkey="run" onClick={compare}>
          比对
        </button>
        <span className="spacer" />
        <button className="btn" onClick={() => leftFileRef.current?.click()}>打开左值文件</button>
        <button className="btn" onClick={() => rightFileRef.current?.click()}>打开右值文件</button>
        <input
          ref={leftFileRef}
          type="file"
          hidden
          onChange={(e) => e.target.files?.[0] && e.target.files[0].text().then(setLeft)}
        />
        <input
          ref={rightFileRef}
          type="file"
          hidden
          onChange={(e) => e.target.files?.[0] && e.target.files[0].text().then(setRight)}
        />
        <ToolHistory toolId="text-diff" />
      </div>
      <div className="split-view">
        <div className="pane">
          <div className="pane-title">左值</div>
          <div className="drop-zone" {...leftDrop.bindDrop}>
            <JsonEditor value={left} onChange={setLeft} language="text" />
          </div>
        </div>
        <div className="pane">
          <div className="pane-title">右值</div>
          <div className="drop-zone" {...rightDrop.bindDrop}>
            <JsonEditor value={right} onChange={setRight} language="text" />
          </div>
        </div>
      </div>
      <div className="pane" style={{ flex: 2 }}>
        <div className="pane-title">diff</div>
        {showDiff ? (
          <TextDiffEditor original={left} modified={right} language="text" />
        ) : (
          <div className="hint">点击「比对」查看结果</div>
        )}
      </div>
    </div>
  );
}
