import { create } from "zustand";

export type Theme = "dark" | "light";

interface AppState {
  activeTool: string;
  setActiveTool: (id: string) => void;
  /// 日志提取出的 JSON，供跳转到格式化页使用
  extractedJson: string | null;
  setExtractedJson: (json: string) => void;
  theme: Theme;
  toggleTheme: () => void;
}

const THEME_KEY = "devbox-theme";

/** 读取持久化主题，非法值/异常一律回落 dark，避免存储不可用导致白屏 */
function readTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function saveTheme(t: Theme) {
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {
    // 存储不可用时忽略，内存态主题仍生效
  }
}

// 模块加载时即同步根节点主题，早于首帧 paint，避免主题闪烁（FOUC）
const initial = readTheme();
document.documentElement.dataset.theme = initial;

export const useAppStore = create<AppState>((set) => ({
  activeTool: "json-formatter",
  setActiveTool: (id) => set({ activeTool: id }),
  extractedJson: null,
  setExtractedJson: (json) => set({ extractedJson: json }),
  theme: initial,
  toggleTheme: () =>
    set((s) => {
      const next: Theme = s.theme === "dark" ? "light" : "dark";
      saveTheme(next);
      return { theme: next };
    }),
}));
