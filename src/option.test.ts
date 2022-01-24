import { defaultIdFunction } from "./option";

describe("defaultIdFunction", () => {
  it("test.js", () =>
    expect(defaultIdFunction("src/hoge.test.js")).toBe("src/hoge.js"));
  it("spec.js", () =>
    expect(defaultIdFunction("src/hoge.spec.js")).toBe("src/hoge.js"));
  it("test.jsx", () =>
    expect(defaultIdFunction("src/hoge.test.jsx")).toBe("src/hoge.jsx"));
  it("spec.jsx", () =>
    expect(defaultIdFunction("src/hoge.spec.jsx")).toBe("src/hoge.jsx"));
  it("test.ts", () =>
    expect(defaultIdFunction("src/hoge.test.ts")).toBe("src/hoge.ts"));
  it("spec.ts", () =>
    expect(defaultIdFunction("src/hoge.spec.ts")).toBe("src/hoge.ts"));
  it("test.tsx", () =>
    expect(defaultIdFunction("src/hoge.test.tsx")).toBe("src/hoge.tsx"));
  it("spec.tsx", () =>
    expect(defaultIdFunction("src/hoge.spec.tsx")).toBe("src/hoge.tsx"));
  it(".ts", () => expect(defaultIdFunction("src/hoge.ts")).toBe("src/hoge.ts"));
});
