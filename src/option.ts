import type { DeepPartial } from "utility-types";

export type PluginOption = {
  title: string;
  coverageFilePath: string;
};

export type OptionalPluginOption = DeepPartial<PluginOption>;

const defaultOption: PluginOption = {
  title: "coverage report for added / modified diffs",
  coverageFilePath: "coverage/coverage-final.json",
};

export function withDefaultOption(option: OptionalPluginOption): PluginOption {
  return { ...option, ...defaultOption };
}
