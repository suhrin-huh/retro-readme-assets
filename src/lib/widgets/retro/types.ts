export type RetroTheme = "mint" | "peach" | "lavender" | "night";
export interface RetroConfig {
  title: string;
  headline: string;
  cta: string;
  name: string;
  role: string;
  about: string;
  theme: RetroTheme;
  email: string;
  blog: string;
  linkedin: string;
  animation: "typing" | "none";
}
