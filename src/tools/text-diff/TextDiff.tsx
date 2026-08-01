import { useRef, useState } from "react";
import { JsonEditor } from "../../components/JsonEditor";
import { TextDiffEditor } from "../../components/TextDiffEditor";
import "../tool.css";

export function TextDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [showDiff, setShowDiff] = useState(false);
  const leftFileRef = useRef<HTMLInputElement>(null);
  const rightFileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="tool-page">
      <div className="toolbar">
        <button onClick={() => setShowDiff(true)}>比对</button>
        <span className="spacer" />
        <button onClick={() => leftFileRef.current?.click()}>打开左值文件</button>
        <button onClick={() => rightFileRef.current?.click()}>打开右值文件</button>
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
      </div>
      <div className="split-view">
        <div className="pane">
          <div className="pane-title">左值</div>
          <JsonEditor value={left} onChange={setLeft} language="text" />
        </div>
        <div className="pane">
          <div className="pane-title">右值</div>
          <JsonEditor value={right} onChange={setRight} language="text" />
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
