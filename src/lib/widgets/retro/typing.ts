import { textWidth } from "../../svg-utils";

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const advance = 10.25;
const typeDelay = 0.075;
const eraseDelay = 0.038;
export function createTypingTimeline(lines: string[]) {
  const glyphs: { text: string; x: number; y: number; width: number }[] = [];
  lines.forEach((line, row) => {
    let x = 87;
    for (const { segment } of segmenter.segment(line)) {
      const width = textWidth(segment) * advance;
      glyphs.push({ text: segment, x, y: 524 + row * 23, width });
      x += width;
    }
  });
  const count = glyphs.length;
  const holdEnd = count * typeDelay + 1.5;
  const eraseEnd = holdEnd + count * eraseDelay;
  const duration = eraseEnd + 0.65;
  const position = (visible: number) => {
    const last = glyphs[visible - 1];
    return last
      ? { x: last.x + last.width, y: last.y - 17 }
      : { x: 87, y: 507 };
  };
  const frames = [{ time: 0, visible: 0, ...position(0) }];
  for (let visible = 1; visible <= count; visible++) {
    frames.push({ time: visible * typeDelay, visible, ...position(visible) });
  }
  frames.push({ time: holdEnd, visible: count, ...position(count) });
  for (let visible = count - 1; visible >= 0; visible--) {
    frames.push({
      time: holdEnd + (count - visible) * eraseDelay,
      visible,
      ...position(visible),
    });
  }
  frames.push({ time: duration, visible: 0, ...position(0) });
  return { glyphs, frames, duration, holdEnd, typeDelay, eraseDelay };
}
