import RetroEditor from "@/components/widgets/RetroEditor";
import { parseRetroQuery } from "@/lib/widgets/retro/parse-query";

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
  return (
    <main>
      <p className="eyebrow">README ASSET LAB / 001</p>
      <h1>
        Retro Window Studio <span>✳</span>
      </h1>
      <p className="intro">
        내 소개를 입력하고, 나만의 레트로 윈도우를 만들어보세요.
      </p>
      <RetroEditor initialConfig={parseRetroQuery(params)} />
    </main>
  );
}
