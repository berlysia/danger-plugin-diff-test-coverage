export type PluginOption = {
  title: string;
  coverageFilePath: string;
  idFunction: (diffFilename: string) => string;
};

export type OptionalPluginOption = Partial<PluginOption>;

const DEFAULT_ID_REGEXP = /\.(?:test|spec)(\.[jt]sx?)$/;
export function defaultIdFunction(diffFilename: string): string {
  const matched = diffFilename.match(DEFAULT_ID_REGEXP);
  if (matched) {
    return diffFilename.replace(DEFAULT_ID_REGEXP, "$1");
  }
  return diffFilename;
}

const defaultOption: PluginOption = {
  title: "coverage report for added / modified diffs",
  coverageFilePath: "coverage/coverage-final.json",
  idFunction: defaultIdFunction,
};

export function withDefaultOption(option: OptionalPluginOption): PluginOption {
  return { ...option, ...defaultOption };
}
