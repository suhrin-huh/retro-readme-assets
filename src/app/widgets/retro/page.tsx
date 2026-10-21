import Link from "next/link";
import { parseRetroQuery } from "@/lib/widgets/retro/parse-query";
import { generateRetroSvg } from "@/lib/widgets/retro/render-svg";
import { escapeXml } from "@/lib/svg-utils";
export default async function RetroPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (value !== undefined)
      params.set(key, Array.isArray(value) ? value[0] : value);
  }
  const config = parseRetroQuery(params);
  const normalized = new URLSearchParams(Object.entries(config));
  const imageUrl = `/api/widgets/retro?${normalized}`;
  const staticParams = new URLSearchParams(normalized);
  staticParams.set("animation", "none");
  const svg = generateRetroSvg(config);
  return (
    <main>
      <p className="eyebrow">README ASSET LAB / 001</p>
      <h1>
        Retro Window Studio <span>✳</span>
      </h1>
      <p className="intro">
        API와 동일한 SVG 생성 함수로 보여주는 미리보기입니다.
      </p>
      <div className="card">
        <div className="preview-head">
          <h2>✦ Live Preview</h2>
          <span>{config.theme.toUpperCase()} / 1080 × 720</span>
        </div>
        <div className="stage" dangerouslySetInnerHTML={{ __html: svg }} />
        <div className="actions">
          <a
            className="button"
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
          >
            SVG API 열기 ↗
          </a>
          <a
            className="button secondary"
            href={`/api/widgets/retro?${staticParams}`}
            target="_blank"
            rel="noreferrer"
          >
            정적 이미지 확인
          </a>
        </div>
        <p className="hint">
          현재 Phase 1–2: URL 쿼리로 설정할 수 있습니다. 편집 폼과 복사 기능은
          다음 단계에서 추가합니다.
        </p>
      </div>
      <section className="card">
        <h2>내 소개로 바꾸기</h2>
        <p>
          이 페이지 또는 API 주소에 쿼리를 추가하세요. 비어 있는 연락처는
          숨겨집니다.
        </p>
        <code>
          /api/widgets/retro?name=Minchae&amp;theme=peach&amp;animation=none
        </code>
        <div className="actions">
          {(["mint", "peach", "lavender", "night"] as const).map((theme) => {
            const next = new URLSearchParams(normalized);
            next.set("theme", theme);
            return (
              <Link
                className="theme"
                key={theme}
                href={`?${next}`}
                aria-current={config.theme === theme ? "page" : undefined}
              >
                {theme}
              </Link>
            );
          })}
        </div>
        <p className="hint">
          title · headline · cta · name · role · about · theme · email · blog ·
          linkedin · animation
        </p>
        <h2>README HTML 예시</h2>
        <pre>{`<img src="https://YOUR_DOMAIN${escapeXml(imageUrl)}" alt="My retro introduction" width="100%" />`}</pre>
        <p className="hint">
          YOUR_DOMAIN을 배포 도메인으로 바꿔주세요. 모든 쿼리는 공개되므로
          비밀값을 넣지 마세요. GitHub에서의 애니메이션 재생은 별도 검증이
          필요합니다.
        </p>
      </section>
    </main>
  );
}
