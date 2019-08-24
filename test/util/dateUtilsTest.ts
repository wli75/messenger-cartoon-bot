import { compareTimeString } from "../../src/util/dateUtils";

describe.each`
  a                        | b                        | expected
  ${"2019-08-20 00:00:00"} | ${"2019-08-21 00:00:00"} | ${-1}
  ${"2019-08-20 00:00:00"} | ${"2019-08-20 00:00:00"} | ${0}
  ${"2019-08-21 00:00:00"} | ${"2019-08-20 00:00:00"} | ${1}
`("compareTimeString", ({ a, b, expected }): void => {
  test(`returns ${expected}`, (): void => {
    expect(compareTimeString(a, b)).toBe(expected);
  });
});
