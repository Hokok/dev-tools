// 精细导入：只加载 editor 核心 + json 语言，避免全量包带入 ts/html/css
// 等 ~8MB 无用语言（CSP 要求本地加载，体积直接影响安装包）
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
// editor.api 不含折叠 contrib，需显式引入以恢复折叠/折叠省略号
import "monaco-editor/esm/vs/editor/contrib/folding/browser/folding.js";
import "monaco-editor/esm/vs/language/json/monaco.contribution";
// shell 基础语言（curl 脚本高亮），体积极小，仅 Monarch tokenizer，无需额外 worker
import "monaco-editor/esm/vs/languages/definitions/shell/register.js";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker.js?worker";
import { loader } from "@monaco-editor/react";

// 将 Monaco 改为本地打包加载（默认走 CDN 会被 CSP 阻断）。
// 只需 editor + json 两种 worker（本项目只用到 json/text/shell 语言，shell 无需 worker）。
self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === "json") {
      return new jsonWorker();
    }
    return new editorWorker();
  },
};

loader.config({ monaco });
