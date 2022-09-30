import 'jest-extended';
import * as constants from '../../src/content/constants';

describe('Background Constants', () => {
  test('computedCalendarName is of type string', () => {
    expect(constants.calendarFileName).toBeString();
  });

  test('timeZone is of type string', () => {
    expect(constants.toastMessageDuration).toBeNumber();
  });
});
