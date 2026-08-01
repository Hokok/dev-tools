pub mod commands;
pub mod diff;
pub mod extract;
pub mod format;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // macOS 毛玻璃效果：HudWindow 为中性材质，深浅由前端半透明底色控制
            #[cfg(target_os = "macos")]
            {
                use window_vibrancy::{NSVisualEffectMaterial, apply_vibrancy};
                if let Some(win) = app.get_webview_window("main") {
                    apply_vibrancy(&win, NSVisualEffectMaterial::HudWindow, None, None)
                        .expect("apply vibrancy failed");
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::fmt_json,
            commands::min_json,
            commands::extract_json_cmd,
            commands::compare_json,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
