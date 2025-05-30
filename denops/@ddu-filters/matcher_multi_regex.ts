import {
  DduItem,
  ItemHighlight,
  SourceOptions,
} from "jsr:@shougo/ddu-vim@~10.0.0/types";
import { BaseFilter } from "jsr:@shougo/ddu-vim@~10.0.0/filter";
import type { Denops } from "jsr:@denops/std@~7.5.0";

type Params = {
  highlightMatched: string;
  highlightGreedy: boolean;
};

export function splitUserInput(input: string): string[] {
  const sep = /(?<!(?<=(?:^|[^\\])(?:\\\\)*)\\)\s/;
  return input.split(sep).filter((v) => v.length != 0);
}

export function removeBackslashBeforeSpace(input: string): string {
  return input.replace(/\\(?=\s)/g, "");
}

function strlen(s: string): number {
  return (new TextEncoder()).encode(s).length;
}

export class Filter extends BaseFilter<Params> {
  override filter(args: {
    denops: Denops;
    sourceOptions: SourceOptions;
    filterParams: Params;
    input: string;
    items: DduItem[];
  }): Promise<DduItem[]> {
    const matchers = splitUserInput(args.input).map((v) =>
      removeBackslashBeforeSpace(v)
    );
    if (matchers.length == 0) {
      return Promise.resolve(args.items);
    }

    const buildRegexes = () => {
      const ignoreCase = args.sourceOptions.ignoreCase &&
        !(args.sourceOptions.smartCase && /[A-Z]/.test(args.input));
      const flags = ignoreCase ? "i" : "";
      try {
        return matchers.map((v) => new RegExp(v, flags));
      } catch (_) {
        // Ignore
      }
    };
    const regexps = buildRegexes();
    if (!regexps) {
      return Promise.resolve(args.items);
    }

    const items = regexps.reduce(
      (items, re) => items.filter(({ matcherKey }) => re.test(matcherKey)),
      args.items,
    );

    if (args.filterParams.highlightMatched === "") {
      return Promise.resolve(items);
    }

    // Calculate matched position below.
    const pushHighlightInfo = (
      item: { highlights: ItemHighlight[]; matcherKey: string },
      match: RegExpExecArray,
    ) => {
      item.highlights.push({
        name: "matched",
        hl_group: args.filterParams.highlightMatched,
        col: strlen(item.matcherKey.slice(0, match.index)) + 1,
        width: strlen(match[0]),
      });
    };

    const hlitems = regexps.reduce(
      (items, re) => {
        if (args.filterParams.highlightGreedy) {
          items.map((item) => {
            const r = new RegExp(re, re.flags + "g");
            let prevMatchIndex = -1;
            for (;;) { // Search for all the matches.
              const match = r.exec(item.matcherKey);
              if (!match || match.index === prevMatchIndex) {
                break;
              }
              pushHighlightInfo(item, match);
              prevMatchIndex = match.index;
            }
          });
        } else {
          items.map((item) => {
            pushHighlightInfo(item, re.exec(item.matcherKey)!);
          });
        }
        return items;
      },
      items.map((item) => {
        return { ...item, highlights: item.highlights ?? [] };
      }),
    );
    return Promise.resolve(hlitems);
  }

  override params(): Params {
    return {
      highlightMatched: "",
      highlightGreedy: false,
    };
  }
}
