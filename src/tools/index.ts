import type { ComponentType } from "react";
import { Formatter } from "./json-formatter/Formatter";
import { JsonDiff } from "./json-diff/JsonDiff";
import { LogExtractor } from "./log-extractor/LogExtractor";
import { TextDiff } from "./text-diff/TextDiff";
import { JsonTable } from "./json-table/JsonTable";

export interface ToolDef {
  id: string;
  name: string;
  icon: string;
  component: ComponentType;
}

/// 工具注册表：新增工具只需在此追加一项
export const TOOLS: ToolDef[] = [
  { id: "json-formatter", name: "JSON 格式化", icon: "{}", component: Formatter },
  { id: "json-diff", name: "JSON 比对", icon: "⇄", component: JsonDiff },
  { id: "log-extractor", name: "日志提取", icon: "⧉", component: LogExtractor },
  { id: "text-diff", name: "文本比对", icon: "‖", component: TextDiff },
  { id: "json-table", name: "表格导出", icon: "▦", component: JsonTable },
];

export function getTool(id: string): ToolDef | undefined {
  return TOOLS.find((t) => t.id === id);
}
