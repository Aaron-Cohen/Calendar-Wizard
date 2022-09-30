import fetchMock from 'jest-fetch-mock';

const fakeToken = 'qwertyuiop1234567890';
jest.mock('../../src/shared/browser', () => require('sinon-chrome/webextensions'));

fetchMock.enableMocks();
describe('Auth Token Generation and Reuse', () => {
  describe('Auth Token and Identity ID Generation', () => {
    beforeEach(() => {
      jest.resetModules();
      fetchMock.doMock();
    });

    test('Google auth retrieved if initial call is rejected', async () => {
      const mock = jest.spyOn(require('../../src/background/auth/internals'), 'getGoogleOAuthToken')
          .mockImplementation(() => {});

      const {authenticatedFetch} = require('../../src/background/auth');
      await authenticatedFetch(jest.fn()
          .mockRejectedValueOnce('Fake rejection')
          .mockResolvedValueOnce(''));

      expect(mock).toHaveBeenCalled();
    });

    test('Google id persisted if initial call is rejected', async () => {
      const set = jest.fn();
      const id = 'abcd1234';
      fetchMock.doMock();
      fetchMock.mockResponse(JSON.stringify({id}));

      jest.spyOn(require('sinon-chrome/webextensions').identity, 'getRedirectURL')
          .mockImplementation(async () => 'http://url');
      jest.spyOn(require('sinon-chrome/webextensions').identity, 'launchWebAuthFlow')
          .mockImplementation(async () => `abcd123access_token=${fakeToken}&abc123`);
      require('../../src/shared/browser');

      jest.spyOn(require('../../src/background/login').default, 'set')
          .mockImplementation(set);
      jest.spyOn(require('../../src/background/login').default, 'get')
          .mockImplementation(() => false);

      const {authenticatedFetch} = require('../../src/background/auth');
      await authenticatedFetch(jest.fn()
          .mockRejectedValueOnce('Fake rejection')
          .mockResolvedValueOnce(''));

      expect(set).toHaveBeenCalledWith(id);
    });

    test('Google auth not regenerated if initial call is successful', async () => {
      const mock = jest.spyOn(require('../../src/background/auth/internals'), 'getGoogleOAuthToken')
          .mockImplementation(() => expect(mock).not.toHaveBeenCalled());

      const {authenticatedFetch} = require('../../src/background/auth');
      await authenticatedFetch(jest.fn()
          .mockResolvedValue(''));

      expect(mock).not.toHaveBeenCalled();
    });

    test('Callback function is called once if it is successful', async () => {
      const {authenticatedFetch} = require('../../src/background/auth');
      const mock = jest.fn().mockResolvedValue('');
      await authenticatedFetch(mock);

      expect(mock).toHaveBeenNthCalledWith(1, {Authorization: ''});
    });

    test('Callback function is called again with token if it initially fails', async () => {
      jest.spyOn(require('../../src/background/controlflow'), 'requestEvents')
          .mockImplementation(async () => []);
      jest.spyOn(require('../../src/background/auth/internals'), 'getGoogleOAuthToken')
          .mockImplementation(() => fakeToken);

      const {authenticatedFetch} = require('../../src/background/auth');
      const mock = jest.fn()
          .mockRejectedValueOnce('Fake rejection')
          .mockImplementation();
      await authenticatedFetch(mock);

      expect(mock).toHaveBeenNthCalledWith(2, {Authorization: fakeToken});
    });
  });
});
