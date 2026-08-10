import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor/esm/vs/editor/contrib/folding/browser/folding.js";
import "monaco-editor/esm/vs/languages/definitions/shell/register.js";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker.js?worker";
import { loader } from "@monaco-editor/react";

// 绕过 monaco.contribution → register.js → import('./jsonMode.js') 的动态加载链。
// jsonMode.js 的 WorkerManager 在 Tauri WKWebView tauri:// 协议下创建 worker 失败，
// 导致整个 setupMode 中断，tokenizer 也无法注册。
// 此处直接注册 JSON 语言 + 独立 Monarch tokenizer（纯主线程，无外部依赖），
// 再由 MonacoEnvironment.getWorker 提供 json worker 用于 LSP 功能（格式化等）。

// Standalone JSON Monarch tokenizer — no jsonc-parser dependency.
// tokenization.js 的 createTokenizationSupport 依赖 jsonc-parser 的 createScanner，
// 该深层相对路径在 Vite bundle 时无法正确解析导致 tokenizer 被 tree-shaken。
// 状态机区分 key / value 字符串，分别着色。
const JSON_TOKENIZER: monaco.languages.IMonarchLanguage = {
  tokenizer: {
    root: [
      [/\/\*/, "comment", "@commentBlock"],
      [/\/\/.*$/, "comment"],
      [/"(?:[^"\\]|\\.)*"\s*:/, "string.key"],
      [/"(?:[^"\\]|\\.)*"/, "string.value"],
      [/-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/, "number"],
      [/\b(true|false|null)\b/, "keyword"],
      [/[{}[\]:,]/, "delimiter"],
    ],
    commentBlock: [
      [/[^/*]+/, "comment"],
      [/\*\//, "comment", "@pop"],
      [/[/*]/, "comment"],
    ],
  },
};

monaco.languages.register({
  id: "json",
  extensions: [".json", ".bowerrc", ".jshintrc", ".jscsrc", ".eslintrc", ".babelrc", ".har"],
  aliases: ["JSON", "json"],
  mimetypes: ["application/json"],
});
monaco.languages.setMonarchTokensProvider("json", JSON_TOKENIZER);
monaco.languages.setLanguageConfiguration("json", {
  wordPattern: /(-?\d*\.\d\w*)|([^\[\{\]\}\:\"\,\s]+)/g,
  comments: { lineComment: "//", blockComment: ["/*", "*/"] },
  brackets: [["{", "}"], ["[", "]"]],
  autoClosingPairs: [
    { open: "{", close: "}", notIn: ["string"] },
    { open: "[", close: "]", notIn: ["string"] },
    { open: '"', close: '"', notIn: ["string"] },
  ],
});

self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === "json") {
      return new jsonWorker();
    }
    return new editorWorker();
  },
};

// 自定义主题：JSON key 用青蓝色，value 保持基主题的暖橙色
monaco.editor.defineTheme("devbox-dark", {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "string.key", foreground: "9cdcfe" },
  ],
  colors: {},
});
monaco.editor.defineTheme("devbox-light", {
  base: "vs",
  inherit: true,
  rules: [
    { token: "string.key", foreground: "0451a5" },
  ],
  colors: {},
});

loader.config({ monaco });