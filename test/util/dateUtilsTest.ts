import { compareDate, toDate } from "../../src/util/dateUtils";

describe("dateUtils", (): void => {
  describe("toDate", (): void => {
    test("should convert sqlite time string to a date", (): void => {
      expect(toDate("2019-08-31 12:01:02").getTime()).toBe(
        Date.UTC(2019, 7, 31, 12, 1, 2)
      ); // month is 0-based
    });
  });

  describe.each`
    a                                 | b                                 | expected
    ${new Date(2019, 8, 20, 0, 0, 0)} | ${new Date(2019, 8, 21, 0, 0, 0)} | ${-1}
    ${new Date(2019, 8, 20, 0, 0, 0)} | ${new Date(2019, 8, 20, 0, 0, 0)} | ${0}
    ${new Date(2019, 8, 21, 0, 0, 0)} | ${new Date(2019, 8, 20, 0, 0, 0)} | ${1}
  `("compareDate", ({ a, b, expected }): void => {
    test(`returns ${expected}`, (): void => {
      expect(compareDate(a, b)).toBe(expected);
    });
  });
});
