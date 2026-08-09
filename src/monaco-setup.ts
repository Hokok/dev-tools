// 完整导入 Monaco，包含所有语言、主题、tokenization 服务
// 精细导入（editor.api）会导致 JSON 语法着色丢失
import * as monaco from "monaco-editor";
// shell 基础语言（curl 脚本高亮），体积极小，仅 Monarch tokenizer，无需额外 worker
import "monaco-editor/esm/vs/languages/definitions/shell/register.js";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker.js?worker";
import { loader } from "@monaco-editor/react";

// 将 Monaco 改为本地打包加载（默认走 CDN 会被 CSP 阻断）。
// 只需 editor + json 两种 worker（本项目只用到 json/text/shell 语言）。
self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    console.log("[Monaco] getWorker:", { _workerId, label });
    if (label === "json") {
      return new jsonWorker();
    }
    return new editorWorker();
  },
};

loader.config({ monaco });
