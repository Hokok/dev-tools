pub mod commands;
pub mod diff;
pub mod extract;
pub mod format;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::fmt_json,
            commands::min_json,
            commands::extract_json_cmd,
            commands::compare_json,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
