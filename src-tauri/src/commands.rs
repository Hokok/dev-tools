use crate::diff::{DiffNode, diff_json};
use crate::extract::{JsonMatch, extract_json};
use crate::format::{ParseError, format_json, minify_json};
use serde_json::Value;

/// 格式化 JSON 文本（缩进美化）
#[tauri::command]
pub async fn fmt_json(input: String, indent: usize) -> Result<String, ParseError> {
    // 钳制缩进上限，避免异常值导致 OOM
    let indent = indent.clamp(2, 8);
    format_json(&input, indent)
}

/// 压缩 JSON 为单行
#[tauri::command]
pub async fn min_json(input: String) -> Result<String, ParseError> {
    minify_json(&input)
}

/// 从日志文本中提取 JSON 片段
#[tauri::command]
pub async fn extract_json_cmd(input: String) -> Vec<JsonMatch> {
    extract_json(&input)
}

/// 结构化比对两个 JSON 文本
#[tauri::command]
pub async fn compare_json(left: String, right: String) -> Result<DiffNode, ParseError> {
    let parse = |input: &str| -> Result<Value, ParseError> {
        serde_json::from_str(input).map_err(|e| ParseError {
            message: e.to_string(),
            line: e.line() as usize,
            column: e.column() as usize,
        })
    };
    let l = parse(&left)?;
    let r = parse(&right)?;
    Ok(diff_json(&l, &r))
}
