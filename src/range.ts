export type Range = {
  start: number;
  end: number;
};

export function isWithIn(x: Range, v: number): boolean {
  return x.start <= v && v < x.end;
}

export function isIntersected(a: Range, b: Range): boolean {
  return isWithIn(a, b.start) || isWithIn(b, a.start);
}
