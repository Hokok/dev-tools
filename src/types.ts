/// 与 Rust 端 ParseError 对应的类型
export interface ParseError {
  message: string;
  line: number;
  column: number;
}

/// 与 Rust 端 JsonMatch 对应的类型
export interface JsonMatch {
  start: number;
  end: number;
  raw: string;
  value: unknown;
}

/// 与 Rust 端 DiffNode 对应的类型
export interface DiffNode {
  path: string;
  change: "added" | "removed" | "modified";
  left: unknown | null;
  right: unknown | null;
  children: DiffNode[];
}
