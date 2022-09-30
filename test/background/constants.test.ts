import * as constants from '../../src/background/constants';
describe('Background Constants', () => {
  test('computedCalendarName is of type string', () => {
    expect(constants.computedCalendarName).toBeString();
  });

  test('timeZone is of type string', () => {
    expect(constants.timeZone).toBeString;
  });

  test('yearOffset is of type number', () => {
    expect(constants.yearOffset).toBeNumber;
  });

  test('applicableWebsites is of type arrayS', () => {
    expect(constants.applicableWebsites).toBeArray();
  });

  test('googleClientId is of type string', () => {
    expect(constants.googleClientId).toBeString();
  });

  test('monthMapping is of type object', () => {
    expect(constants.monthMapping).toBeInstanceOf(Map);
  });

  test('loginKey is of type string', () => {
    expect(constants.loginKey).toBeString();
  });

  test('Toast messages are of type string', () => {
    expect(constants.loginToast).toBeString();
    expect(constants.loginErrToast).toBeString();
    expect(constants.logoutToast).toBeString();
  });
});
