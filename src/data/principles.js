/**
 * Principles and Colors mapping based on master data (item.txt).
 */

export const COLORS = [
  { id: "AS", name: "青色", label: "星明かり (Astral)" },
  { id: "EL", name: "青緑色", label: "元素 (Elemental)" },
  { id: "LI", name: "赤色", label: "生命 (Life)" },
  { id: "SA", name: "金色", label: "砂・聖 (Sacred/Sand)" },
  { id: "ME", name: "紫色", label: "精神・鉄 (Mental/Metal)" },
];

export const COLOR_BY_ID = COLORS.reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {});
