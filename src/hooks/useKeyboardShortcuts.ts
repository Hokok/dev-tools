import { useEffect } from "react";
import { TOOLS } from "../tools";
import { useAppStore } from "../store/app";
import { useSettingsStore } from "../store/settings";

function isMod(e: KeyboardEvent): boolean {
  return e.metaKey || e.ctrlKey;
}

/**
 * 全局快捷键：
 * - Cmd/Ctrl+1..N：切换工具（对应 TOOLS 注册表顺序，最多 9 个）
 * - Cmd/Ctrl+Enter：触发主执行按钮（[data-hotkey="run"]）
 * - Cmd/Ctrl+Shift+C：触发复制按钮（[data-hotkey="copy"]）
 *
 * 用 DOM 查询 + click() 派发，各工具页无需额外注册。
 */
export function useKeyboardShortcuts(): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isMod(e) || e.repeat) return;

      if (e.key >= "1" && e.key <= "9") {
        const idx = Number(e.key) - 1;
        // 快捷键按配置后的可见顺序映射
        const ordered = useSettingsStore
          .getState()
          .order.map((id) => TOOLS.find((t) => t.id === id))
          .filter((t): t is NonNullable<typeof t> => Boolean(t));
        const tool = ordered[idx];
        if (tool) {
          useAppStore.getState().setActiveTool(tool.id);
          e.preventDefault();
        }
        return;
      }

      if (e.key === "Enter") {
        const el = document.querySelector<HTMLElement>('[data-hotkey="run"]');
        if (el && !el.hasAttribute("disabled")) {
          el.click();
          e.preventDefault();
        }
        return;
      }

      if (e.key.toUpperCase() === "C" && e.shiftKey) {
        const el = document.querySelector<HTMLElement>('[data-hotkey="copy"]');
        if (el && !el.hasAttribute("disabled")) {
          el.click();
          e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
