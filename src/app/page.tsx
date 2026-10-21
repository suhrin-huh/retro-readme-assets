/* eslint-disable @next/next/no-img-element -- SVG API preview intentionally matches README image loading. */
import Link from "next/link";
export default function Home() {
  return (
    <main>
      <p className="eyebrow">SMALL WINDOWS, BIG PERSONALITY</p>
      <h1>
        README에 나다운
        <br />
        작은 창을 열어보세요.
      </h1>
      <p className="intro">
        내 소개를 담은 레트로 윈도우. URL 하나로 GitHub 프로필에 더하세요.
      </p>
      <article className="card catalog">
        <div>
          <span className="badge">001 / AVAILABLE</span>
          <h2>Retro Window</h2>
          <p>
            네 가지 테마, 나의 소개, 선택형 연락처.
            <br />
            가벼운 SVG 이미지로 전하는 첫인사.
          </p>
          <Link className="button" href="/widgets/retro">
            위젯 살펴보기 →
          </Link>
        </div>
        {/* SVG is deliberately loaded as an image, matching README usage. */}
        <img
          src="/api/widgets/retro?animation=none"
          width="1080"
          height="720"
          alt="민트 테마의 Retro Window 소개 위젯"
        />
      </article>
    </main>
  );
}
