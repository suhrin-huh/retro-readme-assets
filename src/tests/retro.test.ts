import assert from "node:assert/strict";
import { test } from "node:test";
import { parseRetroQuery } from "../lib/widgets/retro/parse-query";
import { defaultRetroConfig, textLimits } from "../lib/widgets/retro/defaults";
import { generateRetroSvg } from "../lib/widgets/retro/render-svg";
import { cleanText, textWidth, wrapText } from "../lib/svg-utils";
import { GET } from "../app/api/widgets/retro/route";

test("missing/empty fields and invalid enums fall back consistently", () => {
  assert.deepEqual(parseRetroQuery(new URLSearchParams()), defaultRetroConfig);
  assert.deepEqual(
    parseRetroQuery(
      new URLSearchParams("title=&theme=__proto__&animation=bad"),
    ),
    defaultRetroConfig,
  );
});
test("limits count Unicode characters and strip invalid XML characters", () => {
  const params = new URLSearchParams();
  for (const key of Object.keys(textLimits))
    params.set(key, "한😀".repeat(300));
  const config = parseRetroQuery(params);
  for (const key of Object.keys(textLimits) as (keyof typeof textLimits)[])
    assert.equal(Array.from(config[key]).length, textLimits[key]);
  assert.equal(cleanText("A\u0000\ud800B"), "AB");
  assert.equal(
    parseRetroQuery(new URLSearchParams({ name: "A\u0000B" })).name,
    "AB",
  );
});
test("all themes and every optional Info combination render", () => {
  for (const theme of ["mint", "peach", "lavender", "night"]) {
    for (let bits = 0; bits < 32; bits++) {
      const params = new URLSearchParams({ theme, animation: "none" });
      ["email", "blog", "linkedin", "language", "stack"].forEach((key, i) => {
        if (bits & (1 << i)) params.set(key, `${key}-value`);
      });
      const svg = generateRetroSvg(parseRetroQuery(params));
      assert.equal(svg.includes("≡  Info"), bits !== 0);
      assert.ok(svg.includes(`width="${bits ? 465 : 948}" height="285"`));
      assert.ok(!svg.includes("GitHub"));
      assert.ok(!svg.includes("<animate"));
    }
  }
});
test("untrusted content is escaped in SVG text and metadata", () => {
  const svg = generateRetroSvg(
    parseRetroQuery(new URLSearchParams({ name: "<script>&\"' hello" })),
  );
  assert.ok(!svg.includes("<script>"));
  assert.ok(svg.includes("&lt;script&gt;&amp;&quot;&apos;"));
});
test("long Korean/English strings and explicit newlines fit the text area", () => {
  for (const value of [
    "가나다라마바사".repeat(40),
    "x".repeat(260),
    "first\nsecond\nthird",
  ]) {
    const lines = wrapText(value, 40, 6);
    assert.ok(lines.length <= 6);
    assert.ok(lines.every((line) => textWidth(line) <= 40));
  }
  assert.deepEqual(wrapText("first\nsecond", 40, 6), ["first", "second"]);
});
test("typing has repeatable animation; static mode removes animation", () => {
  const svg = generateRetroSvg({ ...defaultRetroConfig });
  assert.match(svg, /attributeName="x"/);
  assert.match(svg, /repeatCount="indefinite"/);
  assert.ok(
    !generateRetroSvg({ ...defaultRetroConfig, animation: "none" }).includes(
      "<animate",
    ),
  );
});
test("API returns SVG, safe headers and parsed query content", async () => {
  const response = GET(
    new Request(
      "http://localhost/api/widgets/retro?name=Minchae&animation=none",
    ),
  );
  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get("Content-Type"),
    "image/svg+xml; charset=utf-8",
  );
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  assert.match(response.headers.get("Cache-Control")!, /s-maxage=3600/);
  assert.match(await response.text(), /Minchae/);
});

test("cursor follows character boundaries across lines and backwards during deletion", async () => {
  const { createTypingTimeline } = await import("../lib/widgets/retro/typing");
  const { frames, glyphs } = createTypingTimeline(["AB", "한😀"]);
  assert.equal(glyphs.length, 4);
  assert.deepEqual(
    frames.map((frame) => frame.visible),
    [0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0],
  );
  assert.equal(frames[1].x, 97.25);
  assert.equal(frames[3].y, 530);
  assert.equal(frames[3].x, 107.5);
  assert.equal(frames[7].x, frames[2].x);
  assert.equal(frames[7].y, frames[2].y);
  assert.ok(
    frames.every((frame, i) => i === 0 || frame.time > frames[i - 1].time),
  );
  const combined = createTypingTimeline(["e\u0301👩‍💻"]);
  assert.equal(combined.glyphs.length, 2);
});
