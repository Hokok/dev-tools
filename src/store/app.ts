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

function initialTheme(): Theme {
  return (localStorage.getItem(THEME_KEY) as Theme) || "dark";
}

export const useAppStore = create<AppState>((set) => ({
  activeTool: "json-formatter",
  setActiveTool: (id) => set({ activeTool: id }),
  extractedJson: null,
  setExtractedJson: (json) => set({ extractedJson: json }),
  theme: initialTheme(),
  toggleTheme: () =>
    set((s) => {
      const next: Theme = s.theme === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      return { theme: next };
    }),
}));
