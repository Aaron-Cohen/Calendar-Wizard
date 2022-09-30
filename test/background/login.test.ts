import {loginErrToast, loginKey, loginToast, logoutToast} from '../../src/background/constants';
import googleId from '../../src/background/login';
jest.mock('../../src/shared/browser', () => ( require('sinon-chrome/webextensions')));

describe('Persisted Storage Functions', () => {
  describe('Local storage core functions', () => {
    test('Set calls local storage set', async () => {
      const args = 'abcd124';
      const browser = require('sinon-chrome/webextensions');

      await require('../../src/background/login').default.set(args);

      expect(browser.storage.local.set.called).toBeTrue();
    });

    test('Get calls local storage get and destructures correctly', async () => {
      const args = 'abcd124';
      const browser = require('sinon-chrome/webextensions');
      browser.storage.local.get.resolves({
        [loginKey]: args,
      });

      const actual = await require('../../src/background/login').default.get();
      const expected = args;

      expect(browser.storage.local.get.called).toBeTrue();
      expect(actual).toEqual(expected);
    });

    test('Logout calls local storage to remove on loginKey', async () => {
      const browser = require('sinon-chrome/webextensions');
      browser.storage.local.remove.resolves('');
      jest.spyOn(require('../../src/background/controlflow'), 'updateMenus')
          .mockImplementation(async () => {});

      await require('../../src/background/login').default.logout();

      expect(browser.storage.local.remove.calledWith(loginKey)).toBeTrue();
    });
  });

  describe('Interface functions call operational functions', () => {
    test('Login function calls sync', async () => {
      const fakeTab = 123;
      const mock = jest.fn(async () => {});
      jest.spyOn(require('../../src/background/auth/internals'), 'getGoogleOAuthToken')
          .mockImplementation(async () => {});
      jest.spyOn(require('../../src/background/controlflow'), 'updateMenus')
          .mockImplementation(async () => {});
      jest.spyOn(require('../../src/background/controlflow'), 'requestEvents')
          .mockImplementation(async () => {});
      jest.spyOn(require('../../src/background/google'), 'syncWithGoogleCalendar')
          .mockImplementation(mock);

      await googleId.login(fakeTab);
      expect(mock).toHaveBeenCalled();
    });

    test('Login function updates menus', async () => {
      const fakeTab = 123;
      const mock = jest.fn(async () => {});
      jest.spyOn(require('../../src/background/auth/internals'), 'getGoogleOAuthToken')
          .mockImplementation(async () => {});
      jest.spyOn(require('../../src/background/controlflow'), 'updateMenus')
          .mockImplementation(mock);
      jest.spyOn(require('../../src/background/controlflow'), 'requestEvents')
          .mockImplementation(async () => {});
      jest.spyOn(require('../../src/background/google'), 'syncWithGoogleCalendar')
          .mockImplementation(async () => {});

      await googleId.login(fakeTab);
      expect(mock).toHaveBeenCalled();
    });

    test('Login function requests events', async () => {
      const fakeTab = 123;
      const mock = jest.fn(async () => {});
      jest.spyOn(require('../../src/background/auth/internals'), 'getGoogleOAuthToken')
          .mockImplementation(async () => {});
      jest.spyOn(require('../../src/background/controlflow'), 'updateMenus')
          .mockImplementation(async () => {});
      jest.spyOn(require('../../src/background/controlflow'), 'requestEvents')
          .mockImplementation(mock);
      jest.spyOn(require('../../src/background/google'), 'syncWithGoogleCalendar')
          .mockImplementation(async () => {});

      await googleId.login(fakeTab);
      expect(mock).toHaveBeenCalled();
    });

    test('Login function updates Google Calendar', async () => {
      const fakeTab = 123;
      const mock = jest.fn(async () => {});
      jest.spyOn(require('../../src/background/auth/internals'), 'getGoogleOAuthToken')
          .mockImplementation(async () => {});
      jest.spyOn(require('../../src/background/controlflow'), 'updateMenus')
          .mockImplementation(async () => {});
      jest.spyOn(require('../../src/background/controlflow'), 'requestEvents')
          .mockImplementation(async () => {});
      jest.spyOn(require('../../src/background/google'), 'syncWithGoogleCalendar')
          .mockImplementation(mock);

      await googleId.login(fakeTab);
      expect(mock).toHaveBeenCalled();
    });
  });

  describe('User Feedback Toasts', () => {
    test('Login sends correct toast if auth successful', async () => {
      const fakeTab = 123;
      const mock = jest.fn(async () => {});
      jest.spyOn(require('../../src/background/auth/internals'), 'getGoogleOAuthToken')
          .mockImplementation(async () => {});
      jest.spyOn(require('../../src/background/controlflow'), 'updateMenus')
          .mockImplementation(async () => {});
      jest.spyOn(require('../../src/background/controlflow'), 'requestEvents')
          .mockImplementation(async () => {});
      jest.spyOn(require('../../src/background/google'), 'syncWithGoogleCalendar')
          .mockImplementation(async () => {});
      jest.spyOn(require('sinon-chrome/webextensions').tabs, 'sendMessage')
          .mockImplementation(mock);
      require('../../src/shared/browser');

      await googleId.login(fakeTab);
      expect(mock).toHaveBeenCalledWith(
          fakeTab, {
            flavor: 'toast',
            args: [loginToast],
          },
      );
    });

    test('Login sends correct toast if auth not successful', async () => {
      const fakeTab = 123;
      const mock = jest.fn(async () => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(require('../../src/background/auth/internals'), 'getGoogleOAuthToken')
          .mockImplementation(async () => {
            throw new Error();
          });
      jest.spyOn(require('../../src/background/controlflow'), 'updateMenus')
          .mockImplementation(async () => {});
      jest.spyOn(require('../../src/background/controlflow'), 'requestEvents')
          .mockRejectedValue('Fake rejection');
      jest.spyOn(require('sinon-chrome/webextensions').tabs, 'sendMessage')
          .mockImplementation(mock);
      require('../../src/shared/browser');

      await googleId.login(fakeTab);
      expect(mock).toHaveBeenCalledWith(
          fakeTab, {
            flavor: 'toast',
            args: [loginErrToast],
          },
      );
    });

    test('Logout sends correct toast', async () => {
      const fakeTab = 123;
      const mock = jest.fn(async () => {});
      require('sinon-chrome/webextensions').storage.local.remove.resolves('');
      jest.spyOn(require('../../src/background/auth/internals'), 'getGoogleOAuthToken')
          .mockImplementation(async () => {});
      jest.spyOn(require('../../src/background/controlflow'), 'updateMenus')
          .mockImplementation(async () => {});
      jest.spyOn(require('../../src/background/controlflow'), 'requestEvents')
          .mockImplementation(async () => {});
      jest.spyOn(require('../../src/background/google'), 'syncWithGoogleCalendar')
          .mockImplementation(async () => {});
      jest.spyOn(require('sinon-chrome/webextensions').tabs, 'sendMessage')
          .mockImplementation(mock);

      await googleId.logout(fakeTab);
      expect(mock).toHaveBeenCalledWith(
          fakeTab, {
            flavor: 'toast',
            args: [logoutToast],
          },
      );
    });
  });
});
