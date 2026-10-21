import { defaultRetroConfig, textLimits } from "./defaults";
import type { RetroConfig } from "./types";
import { cleanText } from "../../svg-utils";
export function parseRetroQuery(params: URLSearchParams): RetroConfig {
  const config = { ...defaultRetroConfig };
  for (const key of Object.keys(textLimits) as (keyof typeof textLimits)[]) {
    const raw = params.get(key);
    const value = cleanText((raw ?? "").slice(0, textLimits[key] * 2));
    config[key] = Array.from(value || defaultRetroConfig[key])
      .slice(0, textLimits[key])
      .join("");
  }
  const theme = params.get("theme");
  if (
    theme === "mint" ||
    theme === "peach" ||
    theme === "lavender" ||
    theme === "night"
  )
    config.theme = theme;
  config.animation = params.get("animation") === "none" ? "none" : "typing";
  return config;
}
