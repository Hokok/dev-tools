import { create } from "zustand";

interface AppState {
  activeTool: string;
  setActiveTool: (id: string) => void;
  /// 日志提取出的 JSON，供跳转到格式化页使用
  extractedJson: string | null;
  setExtractedJson: (json: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTool: "json-formatter",
  setActiveTool: (id) => set({ activeTool: id }),
  extractedJson: null,
  setExtractedJson: (json) => set({ extractedJson: json }),
}));
