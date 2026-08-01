// 精细导入：只加载 editor 核心 + json 语言，避免全量包带入 ts/html/css
// 等 ~8MB 无用语言（CSP 要求本地加载，体积直接影响安装包）
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor/esm/vs/language/json/monaco.contribution";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker.js?worker";
import { loader } from "@monaco-editor/react";

// 将 Monaco 改为本地打包加载（默认走 CDN 会被 CSP 阻断）。
// 只需 editor + json 两种 worker（本项目只用到 json/text 语言）。
self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === "json") {
      return new jsonWorker();
    }
    return new editorWorker();
  },
};

loader.config({ monaco });
