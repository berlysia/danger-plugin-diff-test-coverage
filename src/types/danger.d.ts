export interface StructuredDiffBaseChange {
  type: "add" | "del" | "normal";
  add: true | undefined;
  del: true | undefined;
  normal: true | undefined;
  content: string;
}

export interface StructuredDiffAddChange extends StructuredDiffBaseChange {
  type: "add";
  add: true;
  del: undefined;
  normal: undefined;
  ln: number;
}

export interface StructuredDiffDelChange extends StructuredDiffBaseChange {
  type: "del";
  add: undefined;
  del: true;
  normal: undefined;
  ln: number;
}

export interface StructuredDiffNormalChange extends StructuredDiffBaseChange {
  type: "normal";
  add: undefined;
  del: undefined;
  normal: true;
  ln1: number;
  ln2: number;
}

export type StructuredDiffChange =
  | StructuredDiffAddChange
  | StructuredDiffDelChange
  | StructuredDiffNormalChange;

export interface StructuredDiffChunk {
  content: string;
  changes: StructuredDiffChange[];
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
}

export interface StructuredDiff {
  chunks: StructuredDiffChunk[];
}
