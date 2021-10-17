import type { DangerDSLType, GitDSL } from "danger";
import type { DeepPartial, Mutable } from "utility-types";
import { diffCoverage } from "./index";

jest.mock("./coverage", () => {
  const orig = jest.requireActual("./coverage");
  return {
    ...orig,
    readCoverage: () => Promise.resolve({}),
  };
});

declare let global: {
  message: jest.Mock;
  warn: jest.Mock;
  fail: jest.Mock;
  markdown: jest.Mock;
  danger: DeepPartial<Mutable<DangerDSLType>>;
};

beforeEach(() => {
  global.danger = {} as unknown as DangerDSLType;
  global.danger.git = {
    modified_files: [],
    created_files: [],
    structuredDiffForFile(filename: string) {
      return Promise.reject(new Error("not implemented"));
    },
  } as unknown as GitDSL;
  /* eslint-disable jest/prefer-spy-on -- 実体がないのでspyOnできない */
  global.message = jest.fn();
  global.warn = jest.fn();
  // global.fail = jest.fn();
  global.markdown = jest.fn();
  /* eslint-enable jest/prefer-spy-on -- 変更完了 */
});

test("run", async () => {
  await diffCoverage();
});
