import { create } from "zustand";

export type Theme = "dark" | "light";

/** 侧边栏「最近使用」置顶的数量上限 */
const RECENT_LIMIT = 3;

/** 非工具的容器 id（如设置页），不参与最近使用记录 */
const NON_TOOL_IDS = new Set(["settings"]);

interface AppState {
  activeTool: string;
  setActiveTool: (id: string) => void;
  /// 最近使用的工具 id，按使用时间倒序，供侧边栏置顶
  recentToolIds: string[];
  /// 日志提取出的 JSON，供跳转到格式化页使用
  extractedJson: string | null;
  setExtractedJson: (json: string) => void;
  theme: Theme;
  toggleTheme: () => void;
  /** 切换工具时的输入草稿，避免切换丢失未保存内容 */
  drafts: Record<string, unknown>;
  setDraft: (toolId: string, data: unknown) => void;
}

const THEME_KEY = "devbox-theme";
const RECENT_KEY = "devbox-recent-tools";

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

/** 读取持久化最近使用，过滤非法 id 并去重 */
function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as unknown;
    if (!Array.isArray(list)) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const id of list) {
      if (typeof id !== "string" || NON_TOOL_IDS.has(id) || seen.has(id)) continue;
      seen.add(id);
      out.push(id);
      if (out.length >= RECENT_LIMIT) break;
    }
    return out;
  } catch {
    // 存储不可用/数据损坏时回落为空
    return [];
  }
}

function saveRecent(ids: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(ids));
  } catch {
    // 存储不可用时忽略，内存态仍生效
  }
}

/** 模块加载时即同步根节点主题，早于首帧 paint，避免主题闪烁（FOUC） */
const initial = readTheme();
document.documentElement.dataset.theme = initial;

export const useAppStore = create<AppState>((set) => ({
  activeTool: "json-formatter",
  recentToolIds: readRecent(),
  setActiveTool: (id) => {
    // 先读当前 state 计算最近使用，持久化副作用放在 updater 之外（zustand 约定 updater 需纯函数）
    const s = useAppStore.getState();
    const recentToolIds = NON_TOOL_IDS.has(id)
      ? s.recentToolIds
      : [id, ...s.recentToolIds.filter((x) => x !== id)].slice(0, RECENT_LIMIT);
    if (recentToolIds !== s.recentToolIds) saveRecent(recentToolIds);
    set({ activeTool: id, recentToolIds });
  },
  extractedJson: null,
  setExtractedJson: (json) => set({ extractedJson: json }),
  theme: initial,
  toggleTheme: () => {
    // 持久化副作用放在 updater 之外，与 setActiveTool 保持一致
    const next: Theme = useAppStore.getState().theme === "dark" ? "light" : "dark";
    saveTheme(next);
    set({ theme: next });
  },
  drafts: {},
  setDraft: (toolId, data) => set((s) => ({ drafts: { ...s.drafts, [toolId]: data } })),
}));
