jest.doMock('../../src/shared/browser', () => require('sinon-chrome/webextensions'));
jest.mock('../../src/background/controlflow', () => {
  return {
    googleId: {},
    updateMenus: jest.fn(),
  };
});

describe('Context Menu Background Script', () => {
  describe('Icons only show in correct environment', () => {
    beforeEach(()=>{
      jest.resetModules();
      const browser = require('sinon-chrome/webextensions');
      browser.contextMenus.create = jest.fn();
      browser.contextMenus.onClicked = ({addListener: jest.fn()});
      browser.contextMenus.removeAll = async () => {};
    });
    test('iCalendar icons show in Firefox', async () => {
      jest.spyOn(require('sinon-chrome/webextensions').runtime, 'getURL')
          .mockImplementationOnce( () => 'moz-extension://abcd123');
      const {iCalendarIcons} = require('../../src/background/index');

      const actual = iCalendarIcons;
      const expected = {
        icons: {
          16: 'icons/icalendar-icon-16.png',
          32: 'icons/icalendar-icon-32.png',
        },
      };
      expect(actual).toEqual(expected);
    });

    test('iCalendar icons do not show in other browsers', async () => {
      jest.spyOn(require('sinon-chrome/webextensions').runtime, 'getURL')
          .mockImplementationOnce( () => 'chrome-extension://abcd123');

      const {iCalendarIcons} = require('../../src/background/index');
      const actual = iCalendarIcons;
      const expected = { };
      expect(actual).toEqual(expected);
    });

    test('Google icons show in Firefox', async () => {
      jest.spyOn(require('sinon-chrome/webextensions').runtime, 'getURL')
          .mockImplementationOnce( () => 'moz-extension://abcd123');
      const {googleIcons} = require('../../src/background/index');

      const actual = googleIcons;
      const expected = {
        icons: {
          16: 'icons/google-icon-16.png',
          32: 'icons/google-icon-32.png',
        },
      };
      expect(actual).toEqual(expected);
    });

    test('Google icons do not show in other browsers', async () => {
      jest.spyOn(require('sinon-chrome/webextensions').runtime, 'getURL')
          .mockImplementationOnce( () => 'chrome-extension://abcd123');

      const {googleIcons} = require('../../src/background/index');
      const actual = googleIcons;
      const expected = { };
      expect(actual).toEqual(expected);
    });
  });
});
