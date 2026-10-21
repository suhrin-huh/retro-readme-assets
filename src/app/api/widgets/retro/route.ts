import { generateRetroSvg } from "@/lib/widgets/retro/render-svg";
import { parseRetroQuery } from "@/lib/widgets/retro/parse-query";
export function GET(request: Request) {
  return new Response(
    generateRetroSvg(parseRetroQuery(new URL(request.url).searchParams)),
    {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
