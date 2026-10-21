"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultRetroConfig, textLimits } from "@/lib/widgets/retro/defaults";
import { parseRetroQuery } from "@/lib/widgets/retro/parse-query";
import { generateRetroSvg } from "@/lib/widgets/retro/render-svg";
import type { RetroConfig } from "@/lib/widgets/retro/types";
import { themes } from "@/lib/themes";
import { escapeXml } from "@/lib/svg-utils";

const widgetOrigin = "https://retro-readme-assets.vercel.app";

const fields = [
  ["title", "창 제목"],
  ["headline", "메인 문구"],
  ["cta", "버튼 문구"],
  ["name", "이름"],
  ["role", "역할 / 직무"],
  ["about", "소개"],
  ["email", "Email"],
  ["blog", "Blog"],
  ["linkedin", "LinkedIn"],
  ["language", "Language"],
  ["stack", "Stack"],
] as const;

export default function RetroEditor({
  initialConfig,
}: {
  initialConfig: RetroConfig;
}) {
  const [draft, setDraft] = useState(initialConfig);
  const [message, setMessage] = useState("");
  const [copyNotice, setCopyNotice] = useState<{
    target: "url" | "html";
    text: string;
    error: boolean;
  } | null>(null);
  useEffect(() => {
    if (!copyNotice) return;
    const timer = window.setTimeout(
      () => setCopyNotice(null),
      copyNotice.error ? 5000 : 3000,
    );
    return () => window.clearTimeout(timer);
  }, [copyNotice]);
  const config = useMemo(
    () => parseRetroQuery(new URLSearchParams(Object.entries(draft))),
    [draft],
  );
  const query = new URLSearchParams(Object.entries(config)).toString();
  const svg = useMemo(() => generateRetroSvg(config), [config]);
  const imageUrl = `${widgetOrigin}/api/widgets/retro?${query}`;
  const html = `<img src="${escapeXml(imageUrl)}" alt="My retro introduction" width="100%" />`;

  useEffect(() => {
    // Keep a shareable editor URL without navigating or restarting the preview.
    const timer = window.setTimeout(() => {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?${query}${window.location.hash}`,
      );
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  async function copy(value: string, label: string, target: "url" | "html") {
    try {
      await navigator.clipboard.writeText(value);
      setCopyNotice({ target, text: `${label} 복사 완료!`, error: false });
    } catch {
      setCopyNotice({
        target,
        text: "복사할 수 없어요. 텍스트를 직접 선택해 복사해 주세요.",
        error: true,
      });
    }
  }

  return (
    <div className="studio-workspace">
      <section className="card editor" aria-labelledby="settings-heading">
        <div className="preview-head">
          <h2 id="settings-heading">⚙ Widget Settings</h2>
          <span className="live-dot">LIVE</span>
        </div>
        <fieldset className="theme-field">
          <legend>컬러 테마</legend>
          <div className="theme-options">
            {(Object.keys(themes) as (keyof typeof themes)[]).map((theme) => (
              <button
                type="button"
                key={theme}
                className="theme-choice"
                aria-label={theme}
                aria-pressed={draft.theme === theme}
                title={theme}
                style={{ background: themes[theme].sky }}
                onClick={() => setDraft((prev) => ({ ...prev, theme }))}
              >
                <span>{draft.theme === theme ? "✓" : ""}</span>
              </button>
            ))}
          </div>
        </fieldset>
        {fields.map(([key, label]) => (
          <div className="editor-field" key={key}>
            <label htmlFor={`retro-${key}`}>
              {label}
              {["email", "blog", "linkedin", "language", "stack"].includes(
                key,
              ) && <span>선택</span>}
            </label>
            {key === "about" ? (
              <textarea
                id={`retro-${key}`}
                rows={5}
                maxLength={textLimits[key]}
                value={draft[key]}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, [key]: event.target.value }))
                }
              />
            ) : (
              <input
                id={`retro-${key}`}
                type="text"
                maxLength={textLimits[key]}
                value={draft[key]}
                placeholder={
                  ["email", "blog", "linkedin", "language", "stack"].includes(
                    key,
                  )
                    ? key === "language"
                      ? "예: Java · Kotlin"
                      : key === "stack"
                        ? "예: Spring Boot · PostgreSQL"
                        : "비워두면 표시하지 않아요"
                    : defaultRetroConfig[key]
                }
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, [key]: event.target.value }))
                }
              />
            )}
          </div>
        ))}
        <div className="editor-field">
          <label htmlFor="retro-animation">타이핑 애니메이션</label>
          <select
            id="retro-animation"
            value={draft.animation}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                animation: event.target.value as RetroConfig["animation"],
              }))
            }
          >
            <option value="typing">타이핑 · 삭제 반복</option>
            <option value="none">정적 이미지</option>
          </select>
        </div>
        <button
          type="button"
          className="button secondary reset-button"
          onClick={() => {
            setDraft({ ...defaultRetroConfig });
            setMessage("기본 설정으로 초기화했습니다.");
          }}
        >
          ↺ 기본값으로 초기화
        </button>
        <p className="hint">
          Info 항목은 모두 선택사항입니다. 모두 비우면 About Me가 넓어집니다.
          비어 있는 소개 항목은 기본값으로 표시합니다.
        </p>
      </section>
      <div className="studio-output">
        <section
          className="card preview-card"
          aria-labelledby="preview-heading"
        >
          <div className="preview-head">
            <h2 id="preview-heading">✦ Live Preview</h2>
            <span>{config.theme.toUpperCase()} / 1080 × 720</span>
          </div>
          <div className="stage" dangerouslySetInnerHTML={{ __html: svg }} />
          <div className="actions">
            <a
              className="button secondary"
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
            >
              SVG API 열기 ↗
            </a>
          </div>
          <p className="hint">
            입력 내용이 미리보기와 이미지 URL에 자동으로 반영됩니다. 현재 페이지
            주소를 저장하면 설정을 다시 열 수 있습니다.
          </p>
        </section>
        <section className="card embed-card" aria-labelledby="embed-heading">
          <h2 id="embed-heading">README에 가져가기</h2>
          <label htmlFor="image-url">이미지 URL</label>
          <textarea
            id="image-url"
            className="generated-code"
            readOnly
            rows={4}
            value={imageUrl}
          />
          <div className="actions copy-actions">
            {(
              [
                ["url", "URL 복사", imageUrl, "이미지 URL"],
                ["html", "README HTML 복사", html, "README HTML"],
              ] as const
            ).map(([target, buttonLabel, value, label]) => (
              <div className="copy-action" key={target}>
                <button
                  type="button"
                  className={`button${target === "html" ? " secondary" : ""}`}
                  onClick={() => copy(value, label, target)}
                >
                  {buttonLabel}
                </button>
                <div
                  className="copy-notice-region"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {copyNotice?.target === target && (
                    <span
                      className={`copy-notice${copyNotice.error ? " error" : ""}`}
                    >
                      {copyNotice.error ? "!" : "✓"} {copyNotice.text}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <details>
            <summary>README HTML 보기</summary>
            <pre>{html}</pre>
          </details>
          <p className="hint">
            쿼리 정보는 공개됩니다. 비밀값을 넣지 마세요. GitHub에서의
            애니메이션 재생은 별도 확인이 필요하며, 정적 이미지도 선택할 수
            있습니다.
          </p>
          <p className="copy-status" role="status">
            {message}
          </p>
        </section>
      </div>
    </div>
  );
}
