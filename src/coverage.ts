import { readFile } from "fs/promises";
import type { PluginOption } from "./option";
import type { Range } from "./range";
import { isIntersected } from "./range";
import type {
  BranchShape,
  CoverageJsonShape,
  CoverageShape,
  FunctionMapShape,
  LocationShape,
} from "./types/coverage";

export async function readCoverage(
  option: PluginOption
): Promise<CoverageJsonShape> {
  const coverageFile = await readFile(option.coverageFilePath, "utf-8");
  const coverageRecord = JSON.parse(coverageFile);
  return coverageRecord;
}

function countLeastOne(array: number[]) {
  let result = 0;
  for (const x of array) {
    if (x > 0) result++;
  }
  return result;
}

function calcRate(count: number, total: number) {
  if (total === 0) return 1;
  return count / total;
}

type Coverage = {
  count: number;
  total: number;
  rate: number;
};

type CoverageStat = {
  statements: Coverage;
  functions: Coverage;
  branches: Coverage;
};

export function parseFileCoverage(coverage: CoverageShape): CoverageStat {
  const statements = Object.values(coverage.s);
  const statementsCount = countLeastOne(statements);
  const statementsTotal = statements.length;

  const functions = Object.values(coverage.f);
  const functionsCount = countLeastOne(functions);
  const functionsTotal = functions.length;

  const branches = Object.values(coverage.b).flat();
  const branchesCount = countLeastOne(branches);
  const branchesTotal = branches.length;

  return {
    statements: {
      count: statementsCount,
      total: statementsTotal,
      rate: calcRate(statementsCount, statementsTotal),
    },
    functions: {
      count: functionsCount,
      total: functionsTotal,
      rate: calcRate(functionsCount, functionsTotal),
    },
    branches: {
      count: branchesCount,
      total: branchesTotal,
      rate: calcRate(branchesCount, branchesTotal),
    },
  };
}

function convertToRangeFromLocation(loc: LocationShape): Range {
  return {
    start: loc.start.line,
    end: loc.end.line,
  };
}

export function relatedStatementsCoverage(
  ranges: Range[],
  coverage: CoverageShape
) {
  const related = (
    Object.entries(coverage.statementMap) as [`${number}`, LocationShape][]
  )
    .filter(([_id, loc]) => {
      const locRange = convertToRangeFromLocation(loc);
      return ranges.some((range) => isIntersected(range, locRange));
    })
    .map(([id]) => coverage.s[id]!);

  const total = related.length;
  const count = countLeastOne(related);

  return {
    total,
    count,
    rate: calcRate(count, total),
  };
}

export function relatedFunctionsCoverage(
  ranges: Range[],
  coverage: CoverageShape
) {
  const related = (
    Object.entries(coverage.fnMap) as [`${number}`, FunctionMapShape][]
  )
    .filter(([_id, fn]) => {
      const locRange = convertToRangeFromLocation(fn.loc);
      return ranges.some((range) => isIntersected(range, locRange));
    })
    .map(([id]) => coverage.f[id]!);

  const total = related.length;
  const count = countLeastOne(related);

  return {
    total,
    count,
    rate: calcRate(count, total),
  };
}

export function relatedBranchesCoverage(
  ranges: Range[],
  coverage: CoverageShape
) {
  const related = (
    Object.entries(coverage.branchMap) as [`${number}`, BranchShape][]
  )
    .filter(([_id, branch]) => {
      const locRanges = branch.location.map(convertToRangeFromLocation);
      return ranges.some((range) =>
        locRanges.some((locRange) => isIntersected(range, locRange))
      );
    })
    .map(([id]) => coverage.f[id]!);

  const total = related.length;
  const count = countLeastOne(related);

  return {
    total,
    count,
    rate: calcRate(count, total),
  };
}

export function relatedCoverage(
  ranges: Range[],
  coverage: CoverageShape
): CoverageStat {
  return {
    statements: relatedStatementsCoverage(ranges, coverage),
    functions: relatedFunctionsCoverage(ranges, coverage),
    branches: relatedBranchesCoverage(ranges, coverage),
  };
}

function toPercent(x: number) {
  return (x * 100).toFixed(1);
}

function toStringCoverage(x: Coverage): string {
  return `${toPercent(x.rate)} (${x.count} / ${x.total})`;
}

export function toStringCoverageStat(x: {
  filename: string;
  fileCoverage: CoverageStat;
  diffCoverage: CoverageStat | null;
}): string {
  return `|${x.filename}|${
    x.diffCoverage ? toStringCoverage(x.diffCoverage.statements) : "----"
  }|${x.diffCoverage ? toStringCoverage(x.diffCoverage.functions) : "----"}|${
    x.diffCoverage ? toStringCoverage(x.diffCoverage.branches) : "----"
  }|${toStringCoverage(x.fileCoverage.statements)}|${toStringCoverage(
    x.fileCoverage.functions
  )}|${toStringCoverage(x.fileCoverage.branches)}|`;
}
