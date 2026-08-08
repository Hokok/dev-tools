import type { ComponentType } from "react";
import { Formatter } from "./json-formatter/Formatter";
import { JsonDiff } from "./json-diff/JsonDiff";
import { LogExtractor } from "./log-extractor/LogExtractor";
import { TextDiff } from "./text-diff/TextDiff";
import { JsonTable } from "./json-table/JsonTable";
import { JsonFieldExtract } from "./json-field-extract/JsonFieldExtract";
import { History } from "./history/History";
import { EncodeConvert } from "./encode-convert/EncodeConvert";
import { Timestamp } from "./timestamp/Timestamp";
import { Hash } from "./hash/Hash";
import { RegexTester } from "./regex-tester/RegexTester";
import { Jwt } from "./jwt/Jwt";
import { CurlRunner } from "./curl-runner/CurlRunner";

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
  { id: "json-field-extract", name: "字段提取", icon: "⌗", component: JsonFieldExtract },
  { id: "history", name: "历史记录", icon: "🕘", component: History },
  { id: "curl-runner", name: "Curl 执行", icon: "⇗", component: CurlRunner },
  { id: "encode-convert", name: "编码转换", icon: "⤺", component: EncodeConvert },
  { id: "timestamp", name: "时间戳", icon: "⏱", component: Timestamp },
  { id: "hash", name: "Hash 计算", icon: "#", component: Hash },
  { id: "regex-tester", name: "正则测试", icon: ".*", component: RegexTester },
  { id: "jwt", name: "JWT 解析", icon: "🔑", component: Jwt },
];
