import type { RetroConfig } from "./types";
export const textLimits = {
  title: 34,
  headline: 48,
  cta: 28,
  name: 36,
  role: 42,
  about: 260,
  email: 72,
  blog: 72,
  linkedin: 72,
  language: 72,
  stack: 72,
} as const;
export const defaultRetroConfig: Readonly<RetroConfig> = {
  title: "CONNECT.EXE",
  headline: "Want to build together?",
  cta: "Let's connect!",
  name: "Suhrin Huh",
  role: "Backend Developer",
  about:
    "I enjoy building reliable backend services and finding thoughtful solutions to real problems. Always learning, always building.",
  theme: "mint",
  email: "",
  blog: "",
  linkedin: "",
  language: "",
  stack: "",
  animation: "typing",
};
