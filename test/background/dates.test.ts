import * as parsers from '../../src/background/dates/internals';
import {tokenizeDates} from '../../src/background/dates';

describe('Date Functions', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date());
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('isNotIntegral Function', () => {
    test('Accept non integral strings', () => {
      const actual = parsers.isNotIntegral('Jan 13');
      expect(actual).toBeTrue();
    });

    test('Reject integral strings', () => {
      const actual = parsers.isNotIntegral('13');
      expect(actual).toBeFalse();
    });

    test('Reject integer input', () => {
      const actual = parsers.isNotIntegral(13);
      expect(actual).toBeFalse();
    });
  });

  describe('Date Tokenizer Functions', () => {
    const currentYear = new Date().getFullYear();
    const actual = tokenizeDates('Mon 1/13 5:30 pm - 8:30 pm');

    const expected = {
      start: new Date(currentYear, 1 - 1, 13, 5 + 12, 30),
      end: new Date(currentYear, 1 - 1, 13, 8 + 12, 30),
    };
    expect(actual).toEqual(expected);


    test('Tokenize multi day event date strings for the current year', () => {
      const currentYear = new Date().getFullYear();
      const actual = tokenizeDates('Sat 9/24 9:30 pm - Sun 9/25 12:30 am');

      const expected = {
        start: new Date(currentYear, 9 - 1, 24, 9 + 12, 30),
        end: new Date(currentYear, 9 - 1, 25, 0 + 12, 30),
      };
      expect(actual).toEqual(expected);
    });

    test('Tokenize single day event date strings for a non current year', () => {
      const actual = tokenizeDates('Fri 1/13/23 9:00 am - 10:00 am');

      const expected = {
        start: new Date(2023, 1 - 1, 13, 9, 0),
        end: new Date(2023, 1 - 1, 13, 10, 0),
      };
      expect(actual).toEqual(expected);
    });

    test('Tokenize event date strings for across-year dates or multi day dates for a non current year', () => {
      const actual = tokenizeDates('Fri 12/30/22 9:00 am - Fri 1/13/23 9:00 am');

      const expected = {
        start: new Date(2022, 12 - 1, 30, 9, 0),
        end: new Date(2023, 1 - 1, 13, 9, 0),
      };
      expect(actual).toEqual(expected);
    });

    test('Tokenize event page dates for single day events', () => {
      const actual = tokenizeDates('Friday, Jan 13, 2023 (9:00 am - 10:00 am)');

      const expected = {
        start: new Date(2023, 1 - 1, 13, 9, 0),
        end: new Date(2023, 1 - 1, 13, 10, 0),
      };
      expect(actual).toEqual(expected);
    });

    test('Tokenize event page dates for multi day events', () => {
      const actual = tokenizeDates('Wednesday, Jan 4, 2023 - 9:00 am through Friday, Jan 13, 2023 - 9:00 am');

      const expected = {
        start: new Date(2023, 1 - 1, 4, 9, 0),
        end: new Date(2023, 1 - 1, 13, 9, 0),
      };
      expect(actual).toEqual(expected);
    });
  });
});
