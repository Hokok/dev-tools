import { create } from "zustand";
import { TOOLS } from "../tools";

const SETTINGS_KEY = "devbox-tool-config";

interface ToolSettingsState {
  /// 启用的工具 id，按侧边栏显示顺序排列；未出现的即隐藏
  order: string[];
  setEnabled: (id: string, enabled: boolean) => void;
  move: (id: string, dir: -1 | 1) => void;
  reset: () => void;
}

/// 防御性清理持久化顺序：过滤未知 id、去重，并补入缺失的新工具
function sanitize(raw: unknown): string[] {
  const list: string[] = [];
  if (Array.isArray(raw)) {
    for (const id of raw) {
      if (typeof id === "string" && TOOLS.some((t) => t.id === id) && !list.includes(id)) {
        list.push(id);
      }
    }
  }
  for (const t of TOOLS) if (!list.includes(t.id)) list.push(t.id);
  return list;
}

function defaultOrder(): string[] {
  return TOOLS.map((t) => t.id);
}

function readOrder(): string[] {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultOrder();
    return sanitize((JSON.parse(raw) as { order?: unknown }).order);
  } catch {
    // 存储不可用/数据损坏时回落默认全量
    return defaultOrder();
  }
}

function saveOrder(order: string[]) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ order }));
  } catch {
    // 存储不可用时忽略，内存态配置仍生效
  }
}

export const useSettingsStore = create<ToolSettingsState>((set) => ({
  order: readOrder(),

  setEnabled: (id, enabled) =>
    set((s) => {
      const order = enabled
        ? s.order.includes(id)
          ? s.order
          : [...s.order, id]
        : s.order.filter((x) => x !== id);
      saveOrder(order);
      return { order };
    }),

  move: (id, dir) =>
    set((s) => {
      const i = s.order.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= s.order.length) return s;
      const order = [...s.order];
      // 上下界已校验，i/j 必然有效
      const a = order[i]!;
      const b = order[j]!;
      order[i] = b;
      order[j] = a;
      saveOrder(order);
      return { order };
    }),

  reset: () => {
    const order = defaultOrder();
    saveOrder(order);
    set({ order });
  },
}));
