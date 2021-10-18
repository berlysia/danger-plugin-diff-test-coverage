var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) =>
      x.done
        ? resolve(x.value)
        : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import path from "path";
import {
  parseFileCoverage,
  readCoverage,
  relatedCoverage,
  toStringCoverageStat,
} from "./coverage";
import { withDefaultOption } from "./option";
function getNewLine(x) {
  if (x.type === "normal") return x.ln2;
  if (x.type === "add") return x.ln;
  throw new Error("type 'del' does not have a new line");
}
function sortChangesByNewLine(a, b) {
  const aLn = getNewLine(a);
  const bLn = getNewLine(b);
  if (aLn > bLn) return 1;
  if (aLn < bLn) return -1;
  return 0;
}
function collectSequence(lines) {
  var _a, _b;
  const minmap = new Map();
  const maxmap = new Map();
  for (let index = 0; index < lines.length; ++index) {
    const value = lines[index];
    const group = value - index;
    const min = Math.min((_a = minmap.get(group)) != null ? _a : value, value);
    minmap.set(group, min);
    const max = Math.max((_b = maxmap.get(group)) != null ? _b : value, value);
    maxmap.set(group, max);
  }
  return [...minmap.keys()].map((group) => {
    const min = minmap.get(group);
    const max = maxmap.get(group);
    return {
      start: min,
      end: min === max ? max : max + 1,
    };
  });
}
export function diffCoverage() {
  return __async(this, arguments, function* (givenOption = {}) {
    const option = withDefaultOption(givenOption);
    const { created_files, modified_files } = danger.git;
    const coverageRecord = yield readCoverage(option);
    const createdFilesCoverage = created_files.map((filename) => {
      const perFileCoverage = coverageRecord[path.resolve(filename)];
      if (!perFileCoverage) return null;
      return {
        filename,
        diffCoverage: null,
        fileCoverage: parseFileCoverage(perFileCoverage),
      };
    });
    const modifiedFileDiffsCoverage = yield Promise.all(
      modified_files.map((filename) =>
        __async(this, null, function* () {
          const structuredDiff = yield danger.git.structuredDiffForFile(
            filename
          );
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
      )
    );
    const messages = [...createdFilesCoverage, ...modifiedFileDiffsCoverage]
      .filter(Boolean)
      .map((x) => toStringCoverageStat(x))
      .join("\n");
    markdown(`## ${option.title}

|File|% Stmts|% Branch|% Funcs|% Stmts(F)|% Branch(F)|% Funcs(F)|
|----|----|----|----|----|----|----|
${messages}
`);
  });
}
