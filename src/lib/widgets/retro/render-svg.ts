import { themes } from "../../themes";
import {
  escapeXml as esc,
  wrapText as wrap,
  fitText,
  textWidth,
} from "../../svg-utils";
import type { RetroConfig } from "./types";
const contactFields = [
  ["Email", "email"],
  ["Blog", "blog"],
  ["LinkedIn", "linkedin"],
] as const;

export function generateRetroSvg(config: RetroConfig): string {
  const val = (key: keyof RetroConfig) => config[key];
  const t = themes[config.theme],
    W = 1080,
    H = 720;
  const text = (
    x: number,
    y: number,
    s: string,
    size = 18,
    color = "#18343b",
    extra = "",
  ) =>
    `<text x="${x}" y="${y}" fill="${color}" font-family="monospace" font-size="${size}" ${extra}>${esc(s)}</text>`;
  const win = (x: number, y: number, w: number, h: number, title: string) =>
    `<rect x="${x + 5}" y="${y + 5}" width="${w}" height="${h}" fill="#517e7a" opacity=".26"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#fafffd" stroke="#18343b" stroke-width="3"/><rect x="${x + 1.5}" y="${y + 1.5}" width="${w - 3}" height="38" fill="${t.a}"/><line x1="${x}" y1="${y + 40}" x2="${x + w}" y2="${y + 40}" stroke="#18343b" stroke-width="3"/>${text(x + 17, y + 27, title, 19)}`;
  const headlineLines = wrap(val("headline"), 28, 2);
  const activeContacts = contactFields.filter(([, k]) => val(k).trim());
  const hasContact = activeContacts.length > 0;
  const aboutLines = wrap(val("about"), hasContact ? 40 : 85, 6);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><title>${esc(config.title)} — ${esc(config.name)}</title><desc>Retro introduction widget</desc><rect width="${W}" height="${H}" rx="8" fill="${t.sky}"/><rect x="3" y="3" width="1074" height="714" rx="6" fill="none" stroke="#18343b" stroke-width="5"/><rect x="5" y="5" width="1070" height="57" fill="${t.b}" stroke="#18343b" stroke-width="3"/>${text(23, 42, fitText(val("title"), 50), 28, "#18343b", 'font-weight="bold"')}`;
  (
    [
      ["−", 927],
      ["□", 978],
      ["×", 1029],
    ] as const
  ).forEach(([s, x]) => {
    svg += `<rect x="${x}" y="16" width="36" height="35" fill="#fafffd" stroke="#18343b" stroke-width="3"/>${text(x + 10, 41, s, 25)}`;
  });
  svg += `<circle cx="845" cy="382" r="70" fill="#fff8db"/><path d="M0 470 L165 370 292 449 454 320 625 455 767 380 940 465 1080 355 V720 H0Z" fill="#90c8c3" opacity=".8"/>`;
  [
    [58, 150],
    [839, 151],
    [495, 348],
  ].forEach(
    ([x, y]) =>
      (svg += `<g fill="white" opacity=".92"><rect x="${x}" y="${y + 15}" width="180" height="30"/><rect x="${x + 25}" y="${y}" width="95" height="50"/><rect x="${x + 85}" y="${y - 16}" width="58" height="58"/></g>`),
  );
  svg += win(200, 113, 680, 225, "○  ○  ○");
  headlineLines.forEach(
    (line, i) =>
      (svg += text(
        540,
        205 + i * 42,
        line,
        34,
        "#18343b",
        'font-weight="bold" text-anchor="middle"',
      )),
  );
  svg += `<rect x="315" y="257" width="450" height="49" fill="${t.b}" stroke="#18343b" stroke-width="3"/>${text(540, 289, val("cta"), Math.min(22, 420 / Math.max(1, textWidth(val("cta"))) / 0.62), "#18343b", 'text-anchor="middle"')}`;
  svg += win(65, 385, hasContact ? 465 : 948, 285, "✿  About Me");
  svg += text(
    87,
    457,
    fitText(val("name"), hasContact ? 27 : 58),
    25,
    "#18343b",
    'font-weight="bold"',
  );
  svg += text(
    87,
    486,
    fitText(val("role"), hasContact ? 36 : 76),
    19,
    t.accent,
  );
  // SVG animation: type → pause → erase backwards → pause → repeat.
  const lineWeights = aboutLines.map((line) =>
    Math.max(1, Array.from(line).length),
  );
  const totalWeight = lineWeights.reduce((a, b) => a + b, 0) || 1;
  const typeTime = totalWeight * 0.075,
    holdTime = 1.5,
    eraseTime = totalWeight * 0.038,
    resetTime = 0.65;
  const cycle = typeTime + holdTime + eraseTime + resetTime;
  let previous = 0;
  aboutLines.forEach((line, i) => {
    const weight = lineWeights[i];
    const writeStart = (previous / totalWeight) * typeTime;
    const writeEnd = ((previous + weight) / totalWeight) * typeTime;
    const eraseStart =
      typeTime +
      holdTime +
      ((totalWeight - previous - weight) / totalWeight) * eraseTime;
    const eraseEnd =
      typeTime +
      holdTime +
      ((totalWeight - previous) / totalWeight) * eraseTime;
    previous += weight;
    const maskId = `typeMask${i}`,
      y = 524 + 23 * i;
    if (config.animation === "none") {
      svg += text(87, y, line, 17);
      return;
    }
    const times = [
      0,
      writeStart,
      writeEnd,
      typeTime + holdTime,
      eraseStart,
      eraseEnd,
      cycle,
    ].map((v) => Math.min(1, v / cycle).toFixed(6));
    svg += `<mask id="${maskId}" maskUnits="userSpaceOnUse" x="86" y="${y - 21}" width="920" height="25"><rect x="87" y="${y - 21}" width="0" height="25" fill="white"><animate attributeName="width" values="0;0;${Math.ceil(textWidth(line) * 10.25)};${Math.ceil(textWidth(line) * 10.25)};${Math.ceil(textWidth(line) * 10.25)};0;0" keyTimes="${times.join(";")}" dur="${cycle.toFixed(3)}s" repeatCount="indefinite" calcMode="linear"/></rect></mask>`;
    svg += `<g mask="url(#${maskId})">${text(87, y, line, 17)}</g>`;
  });
  if (config.animation === "typing")
    svg += `<rect x="87" y="${Math.min(524 + 23 * aboutLines.length, 650) - 17}" width="9" height="18" fill="${t.accent}"><animate attributeName="opacity" values="1;0;1" dur="0.75s" repeatCount="indefinite"/></rect>`;
  if (hasContact) {
    svg += win(558, 385, 455, 285, "✉  Contact");
    activeContacts.forEach(([lab, k], i) => {
      const y = 458 + i * 70;
      svg += `<rect x="577" y="${y - 27}" width="414" height="60" rx="4" fill="${t.b}" stroke="#9dc3bc"/>${text(588, y + 2, lab, 16, "#18343b", 'font-weight="bold"')}${text(588, y + 24, fitText(val(k).trim(), 30), 16)}`;
    });
  }
  svg += "</svg>";
  return svg;
}
