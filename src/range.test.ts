import { isWithIn, isIntersected } from "./range";

describe("isWithIn", () => {
  it("must be true", () => {
    expect(isWithIn({ start: 0, end: 1 }, 0)).toBe(true);
    expect(isWithIn({ start: 0, end: 2 }, 1)).toBe(true);
  });
  it("must be false", () => {
    expect(isWithIn({ start: 0, end: 1 }, -1)).toBe(false);
    expect(isWithIn({ start: 0, end: 1 }, 1)).toBe(false);
    expect(isWithIn({ start: 0, end: 1 }, 2)).toBe(false);
  });
});

describe("isIntersected", () => {
  it("must be true", () => {
    expect(isIntersected({ start: 0, end: 1 }, { start: 0, end: 2 })).toBe(
      true
    );
    expect(isIntersected({ start: 0, end: 3 }, { start: 2, end: 4 })).toBe(
      true
    );
    expect(isIntersected({ start: 1, end: 3 }, { start: 0, end: 4 })).toBe(
      true
    );
    expect(isIntersected({ start: 0, end: 3 }, { start: 1, end: 2 })).toBe(
      true
    );
    expect(isIntersected({ start: 1, end: 2 }, { start: 0, end: 3 })).toBe(
      true
    );
  });

  it("must be false", () => {
    expect(isIntersected({ start: 0, end: 1 }, { start: 1, end: 2 })).toBe(
      false
    );
    expect(isIntersected({ start: 1, end: 2 }, { start: 0, end: 1 })).toBe(
      false
    );
    expect(isIntersected({ start: 0, end: 1 }, { start: 2, end: 3 })).toBe(
      false
    );
  });
});
