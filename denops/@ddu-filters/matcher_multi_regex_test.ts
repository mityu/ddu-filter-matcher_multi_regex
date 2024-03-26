import {
  removeBackslashBeforeSpace,
  splitUserInput,
} from "./matcher_multi_regex.ts";
import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";

Deno.test("splitUserInput", async (t) => {
  await t.step("splits input by space(s)", () => {
    assertEquals(splitUserInput(String.raw`a b`), ["a", "b"]);
    assertEquals(splitUserInput(String.raw`a  b`), ["a", "b"]);
  });

  await t.step("does not split input when space is escaped", async (t) => {
    const cases = [
      String.raw`a\ b`,
      String.raw`a\\\ b`,
      String.raw`a\\\\\ b`,
      String.raw`\ b`,
      String.raw`\\\ b`,
      String.raw`\\\\\ b`,
    ];
    for (const i in cases) {
      const c = cases[i];
      await t.step(c, () => {
        assertEquals(splitUserInput(c), [c]);
      });
    }
  });

  await t.step(
    "splits input when even count of backslashes are before spaces",
    () => {
      assertEquals(splitUserInput(String.raw`a\\ b`), ["a\\\\", "b"]);
      assertEquals(splitUserInput(String.raw`\\ b`), ["\\\\", "b"]);
    },
  );
});

Deno.test("removeBackslashBeforeSpace", async (t) => {
  const cases = [
    [String.raw`a\ b`, String.raw`a b`],
    [String.raw`\ b`, String.raw` b`],
    [String.raw`a\ `, String.raw`a `],
    [String.raw`a\\ b`, String.raw`a\ b`],
    [String.raw`a\\\ b`, String.raw`a\\ b`],
    [String.raw`a\ b\\ c`, String.raw`a b\ c`],
    [String.raw`a\b\\c`, String.raw`a\b\\c`],
    [String.raw`a\\`, String.raw`a\\`],
  ];
  for (const i in cases) {
    const c = cases[i];
    await t.step(c[0], () => {
      assertEquals(removeBackslashBeforeSpace(c[0]), c[1]);
    });
  }
});
