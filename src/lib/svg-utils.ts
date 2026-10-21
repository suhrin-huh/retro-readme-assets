export function cleanText(value: string): string {
  return Array.from(value)
    .filter((char) => {
      const n = char.codePointAt(0)!;
      return (
        n === 9 ||
        n === 10 ||
        n === 13 ||
        (n >= 32 && n <= 0xd7ff) ||
        (n >= 0xe000 && n <= 0xfffd) ||
        (n >= 0x10000 && n <= 0x10ffff)
      );
    })
    .join("")
    .replace(/\r\n?/g, "\n")
    .trim();
}
export function escapeXml(value: string): string {
  return cleanText(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[char]!,
  );
}
export function textWidth(value: string): number {
  return Array.from(value).reduce(
    (sum, char) => sum + (char.codePointAt(0)! > 255 ? 2 : 1),
    0,
  );
}
export function fitText(value: string, width: number): string {
  if (textWidth(value) <= width) return value;
  let result = "";
  for (const char of value) {
    if (textWidth(result + char) > width - 2) break;
    result += char;
  }
  return result + "…";
}
export function wrapText(
  value: string,
  width: number,
  maxLines: number,
): string[] {
  const lines: string[] = [];
  for (const paragraph of cleanText(value).split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (line && textWidth(line + " " + word) > width) {
        lines.push(line);
        line = "";
      }
      for (const char of (line ? " " : "") + word) {
        if (textWidth(line + char) > width) {
          lines.push(line);
          line = "";
        }
        line += char;
      }
    }
    lines.push(line);
  }
  const visible = lines.slice(0, maxLines);
  if (lines.length > maxLines)
    visible[maxLines - 1] = fitText(visible[maxLines - 1] + "…", width - 1);
  return visible;
}
