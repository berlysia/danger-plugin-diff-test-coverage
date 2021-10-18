import path from "path";
import type { DangerDSLType } from "danger";
import type { StructuredDiff, StructuredDiffChange } from "./types/danger";
import type { CoverageStat } from "./coverage";
import {
  parseFileCoverage,
  readCoverage,
  relatedCoverage,
  toStringCoverageStat,
} from "./coverage";
import type { OptionalPluginOption } from "./option";
import { withDefaultOption } from "./option";
import type { Range } from "./range";

declare const danger: DangerDSLType;
declare function message(message: string): void;
declare function warn(message: string): void;
declare function fail(message: string): void;
declare function markdown(message: string): void;

function getNewLine(x: StructuredDiffChange): number {
  if (x.type === "normal") return x.ln2;
  if (x.type === "add") return x.ln;
  throw new Error("type 'del' does not have a new line");
}

function sortChangesByNewLine(
  a: StructuredDiffChange,
  b: StructuredDiffChange
): -1 | 0 | 1 {
  const aLn = getNewLine(a);
  const bLn = getNewLine(b);
  if (aLn > bLn) return 1;
  if (aLn < bLn) return -1;
  return 0;
}

function collectSequence(lines: number[]): Range[] {
  const minmap = new Map<number, number>();
  const maxmap = new Map<number, number>();
  for (let index = 0; index < lines.length; ++index) {
    const value = lines[index]!;
    const group = value - index;
    const min = Math.min(minmap.get(group) ?? value, value);
    minmap.set(group, min);
    const max = Math.max(maxmap.get(group) ?? value, value);
    maxmap.set(group, max);
  }
  return [...minmap.keys()].map((group) => {
    const min = minmap.get(group)!;
    const max = maxmap.get(group)!;

    return {
      start: min,
      end: min === max ? max : max + 1,
    };
  });
}

type DiffCoverageResult = {
  filename: string;
  diffCoverage: CoverageStat | null;
  fileCoverage: CoverageStat;
};

function isNonNullable<T>(x: T): x is NonNullable<T> {
  return x !== null;
}

export async function diffCoverageRaw(
  givenOption: OptionalPluginOption = {}
): Promise<DiffCoverageResult[]> {
  const option = withDefaultOption(givenOption);

  // these are absent if running on branch(not PR)
  const created_files = danger.git.created_files ?? [];
  const modified_files = danger.git.modified_files ?? [];

  const coverageRecord = await readCoverage(option);

  const createdFilesCoverage = created_files.map((filename) => {
    const perFileCoverage = coverageRecord[path.resolve(filename)];
    if (!perFileCoverage) return null;

    return {
      filename,
      diffCoverage: null,
      fileCoverage: parseFileCoverage(perFileCoverage),
    };
  });

  const modifiedFileDiffsCoverage = await Promise.all(
    modified_files.map(async (filename) => {
      const structuredDiff: StructuredDiff | null =
        await danger.git.structuredDiffForFile(filename);
      if (!structuredDiff) {
        return null;
      }

      const changesToBeCovered = structuredDiff.chunks
        .flatMap((c) => c.changes)
        .filter((x) => x.type !== "del")
        .sort(sortChangesByNewLine);

      const rangesToBeCovered = collectSequence(
        changesToBeCovered.map(getNewLine)
      );

      const perFileCoverage = coverageRecord[path.resolve(filename)];

      if (!perFileCoverage) {
        return null;
      }

      return {
        filename,
        diffCoverage: relatedCoverage(rangesToBeCovered, perFileCoverage),
        fileCoverage: parseFileCoverage(perFileCoverage),
      };
    })
  );

  return [
    ...createdFilesCoverage.filter(isNonNullable),
    ...modifiedFileDiffsCoverage.filter(isNonNullable),
  ];
}

export function buildMessage(
  results: DiffCoverageResult[],
  givenOption: OptionalPluginOption = {}
): string {
  const option = withDefaultOption(givenOption);

  const messages = results.map((x) => toStringCoverageStat(x!)).join("\n");

  if (messages.length === 0) {
    return `## ${option.title}\n\nNo coverages to be shown`;
  }
  return `## ${option.title}\n\n|File|% Stmts(Diff)|% Branch(Diff)|% Funcs(Diff)|% Stmts(File)|% Branch(File)|% Funcs(File)|\n|----|----|----|----|----|----|----|\n${messages}\n`;
}

export async function diffCoverage(givenOption: OptionalPluginOption = {}) {
  const result = await diffCoverageRaw(givenOption);
  const message = buildMessage(result);
  markdown(message);
}
