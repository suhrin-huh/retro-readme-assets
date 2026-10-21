import type { RetroTheme } from "./widgets/retro/types";
export const themes = {
  mint: { sky: "#b8dfe9", a: "#b9e6df", b: "#d8f5ed", accent: "#399b91" },
  peach: { sky: "#f9dcd6", a: "#f8d2c8", b: "#ffebe5", accent: "#d77972" },
  lavender: { sky: "#dcd8f4", a: "#dad3f7", b: "#f1eefe", accent: "#8275c3" },
  night: { sky: "#274757", a: "#76b6b5", b: "#bde4da", accent: "#478b95" },
} satisfies Record<
  RetroTheme,
  { sky: string; a: string; b: string; accent: string }
>;
