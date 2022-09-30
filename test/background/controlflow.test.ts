import fetchMock from 'jest-fetch-mock';
import {detectEventPage} from '../../src/background/controlflow';

const fakeToken = 'qwertyuiop1234567890';
jest.mock('../../src/shared/browser', () => require('sinon-chrome/webextensions'));

fetchMock.enableMocks();
describe('Control Flow', () => {
  describe('Page action matching', () => {
    test('No update requests sent if user is not logged in', async () => {
      const tokenizeDates = jest.spyOn(require('../../src/background/dates'), 'tokenizeDates')
          .mockImplementation(() => expect(tokenizeDates).not.toHaveBeenCalled());
      const syncWithGoogleCalendar =
          jest.spyOn(require('../../src/background/google'), 'findCalendarConflicts')
              .mockImplementation(() => expect(syncWithGoogleCalendar).not.toHaveBeenCalled());
      jest.spyOn(require('../../src/background/login').default, 'isNotLoggedIn')
          .mockImplementation(() => true);

      const args = {
        frameId: 0,
        tabId: 1,
        url: 2,
      };

      // @ts-ignore
      await detectEventPage(args);
    });

    test('Homepage match calls syncWithGoogleCalendar', async () => {
      const syncWithGoogleCalendar =
          jest.spyOn(require('../../src/background/google'), 'syncWithGoogleCalendar')
              .mockImplementation(() => expect(syncWithGoogleCalendar).toHaveBeenCalled());
      jest.spyOn(require('../../src/background/login').default, 'isNotLoggedIn')
          .mockImplementation(() => false);

      const args = {
        frameId: 0,
        tabId: 1,
        url: 2,
      };

      // @ts-ignore
      await detectEventPage(args);
    });

    test('Event page match calls tokenizeDates and findCalendarConflict', async () => {
      const tokenizeDates = jest.spyOn(require('../../src/background/dates'), 'tokenizeDates')
          .mockImplementation(() => expect(tokenizeDates).toHaveBeenCalled());
      const syncWithGoogleCalendar =
          jest.spyOn(require('../../src/background/google'), 'findCalendarConflicts')
              .mockImplementation(() => expect(syncWithGoogleCalendar).toHaveBeenCalled());
      jest.spyOn(require('../../src/background/login').default, 'isNotLoggedIn')
          .mockImplementation(() => false);

      const args = {
        frameId: 0,
        tabId: 1,
        url: 2,
      };

      // @ts-ignore
      await detectEventPage(args);
    });

    test('No update requests sent if site is not an applicable website home/event page', async () => {
      const tokenizeDates = jest.spyOn(require('../../src/background/dates'), 'tokenizeDates')
          .mockImplementation(() => expect(tokenizeDates).not.toHaveBeenCalled());
      const syncWithGoogleCalendar =
          jest.spyOn(require('../../src/background/google'), 'findCalendarConflicts')
              .mockImplementation(() => expect(syncWithGoogleCalendar).not.toHaveBeenCalled());
      jest.spyOn(require('../../src/background/login').default, 'isNotLoggedIn')
          .mockImplementation(() => false);

      const args = {
        frameId: 0,
        tabId: 1,
        url: 2,
      };

      // @ts-ignore
      await detectEventPage(args);
    });

    test('No update requests sent if on an incompatible website', async () => {
      const tokenizeDates = jest.spyOn(require('../../src/background/dates'), 'tokenizeDates')
          .mockImplementation(() => expect(tokenizeDates).not.toHaveBeenCalled());
      const syncWithGoogleCalendar =
          jest.spyOn(require('../../src/background/google'), 'findCalendarConflicts')
              .mockImplementation(() => expect(syncWithGoogleCalendar).not.toHaveBeenCalled());
      jest.spyOn(require('../../src/background/login').default, 'isNotLoggedIn')
          .mockImplementation(() => false);

      const args = {
        frameId: 0,
        tabId: 1,
        url: 2,
      };

      // @ts-ignore
      await detectEventPage(args);
    });
  });

  describe('Event add / drop synchronization', () => {
    beforeEach(() => fetchMock.doMock());

    test('Event is added to Google Calendar when event is added in event portal', async () => {
      jest.spyOn(require('../../src/background/google'), 'findCalendarConflicts')
          .mockImplementation(async () => { });
      jest.spyOn(require('../../src/background/dates'), 'tokenizeDates')
          .mockImplementation(() => { });

      jest.spyOn(require('../../src/background/login').default, 'get')
          .mockImplementation(() => 'abcd1234');
      jest.spyOn(require('../../src/background/login').default, 'isNotLoggedIn')
          .mockImplementation(() => false);

      jest.spyOn(require('sinon-chrome/webextensions').identity, 'getRedirectURL')
          .mockImplementation(async () => 'http://url');
      jest.spyOn(require('sinon-chrome/webextensions').identity, 'launchWebAuthFlow')
          .mockImplementation(async () => `abcd123access_token=${fakeToken}&abc123`);


      jest.spyOn(require('sinon-chrome/webextensions').tabs, 'sendMessage')
          .mockImplementation( async () => ({
            flavor: 'add-event',
            args: [{
              title: 'event-title',
              date: 'date',
              url: 'events/1234',
              equipment: 'boat',
            }],
          }));
      require('../../src/shared/browser');

      const postEvent =
                jest.spyOn(require('../../src/background/google/internals'), 'postEvent')
                    .mockImplementation(() => expect(postEvent).toHaveBeenCalled());
      const deleteEvent =
                jest.spyOn(require('../../src/background/google/internals'), 'deleteEvent')
                    .mockImplementation(() => expect(deleteEvent).not.toHaveBeenCalled());

      fetchMock.mockResponse(JSON.stringify({
        items: [
          {
            id: 1,
            start: null,
          },
        ],
      }));

      const args = {
        frameId: 0,
        tabId: 1,
        url: 'event/123',
      };

      // @ts-ignore
      await detectEventPage(args);
    });

    test('Event is removed from Google Calendar when event is dropped in event portal', async () => {
      jest.spyOn(require('../../src/background/google'), 'findCalendarConflicts')
          .mockImplementation(async () => { });
      jest.spyOn(require('../../src/background/dates'), 'tokenizeDates')
          .mockImplementation(() => { });

      jest.spyOn(require('../../src/background/login').default, 'get')
          .mockImplementation(() => 'abcd1234');
      jest.spyOn(require('../../src/background/login').default, 'isNotLoggedIn')
          .mockImplementation(() => false);

      jest.spyOn(require('sinon-chrome/webextensions').identity, 'getRedirectURL')
          .mockImplementation(async () => 'http://url');
      jest.spyOn(require('sinon-chrome/webextensions').identity, 'launchWebAuthFlow')
          .mockImplementation(async () => `abcd123access_token=${fakeToken}&abc123`);


      jest.spyOn(require('sinon-chrome/webextensions').tabs, 'sendMessage')
          .mockImplementation( async () => ({
            flavor: 'remove-event',
            args: [{
              title: 'event-title',
              date: 'date',
              url: 'events/1234',
              equipment: 'boat',
            }],
          }));
      require('../../src/shared/browser');

      const postEvent =
                jest.spyOn(require('../../src/background/google/internals'), 'postEvent')
                    .mockImplementation(() => expect(postEvent).not.toHaveBeenCalled());
      const deleteEvent =
                jest.spyOn(require('../../src/background/google/internals'), 'deleteEvent')
                    .mockImplementation(() => expect(deleteEvent).toHaveBeenCalled());

      fetchMock.mockResponse(JSON.stringify({
        items: [
          {
            id: 1,
            start: null,
          },
        ],
      }));

      const args = {
        frameId: 0,
        tabId: 1,
        url: 'event/123',
      };

      // @ts-ignore
      await detectEventPage(args);
    });
  });
});
