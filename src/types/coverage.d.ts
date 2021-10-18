// https://github.com/gotwarlost/istanbul/blob/master/coverage.json.mdd

export type CoverageJsonShape = Record<string, CoverageShape>;

export type CoverageShape = {
  type: string;
  s: Record<`${number}`, number>;
  statementMap: Record<`${number}`, LocationShape>;
  b: Record<`${number}`, number[]>;
  branchMap: Record<`${number}`, BranchShape>;
  f: Record<`${number}`, number>;
  fnMap: Record<`${number}`, FunctionMapShape>;
};

export type FunctionMapShape = {
  name: string;
  line: number;
  loc: LocationShape;
  skip?: boolean;
};

export type LocationShape = {
  start: PositionShape;
  end: PositionShape;
};

export type PositionShape = {
  line: number;
  column: number;
};

export type BranchShape = {
  loc: LocationShape;
  // eslint-disable-next-line @typescript-eslint/ban-types -- distinguishable string type
  type: "cond-expr" | ({} & string);
  location?: LocationShape[];
};
