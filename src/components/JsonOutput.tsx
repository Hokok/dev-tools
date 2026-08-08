import { useMemo } from "react";
import { JsonEditor } from "./JsonEditor";
import { AnnotatedJsonView } from "./AnnotatedJsonView";

/** 格式化 JSON 文本输出面板：解析为对象后带折叠计数标注，保持原始文本显示 */
export function JsonOutput({ value }: { value: string }) {
  const parsed = useMemo(() => {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }, [value]);
  if (parsed === null) return <JsonEditor value={value} readOnly />;
  return <AnnotatedJsonView value={parsed} displayText={value} />;
}