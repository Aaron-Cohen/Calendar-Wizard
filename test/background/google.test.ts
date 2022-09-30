import fetchMock from 'jest-fetch-mock';
import {computedCalendarName, timeZone} from '../../src/background/constants';
import {createNewGoogleCalendar, newCalendarEvent, computeIfAbsentCalendarId, addNewEvents, removeDroppedEvents} from '../../src/background/google/internals';
import {findCalendarConflicts} from '../../src/background/google';
const headers = {Authorization: ''};

jest.mock('../../src/shared/browser', () => require('sinon-chrome/webextensions'));

fetchMock.enableMocks();
describe('Google Calendar', () => {
  beforeEach(() => fetchMock.doMock());
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date());
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('Calendar Generation', () => {
    test('Valid request for createNewGoogleCalendar', () => {
      const id = 123;
      const expectedId = 123;
      const request = fetchMock.mockResponse(JSON.stringify({
        id,
      }));
      const actualId = createNewGoogleCalendar();
      const expectedArgs = [
        'https://www.googleapis.com/calendar/v3/calendars',
        {
          body: JSON.stringify({
            summary: computedCalendarName,
            timeZone: 'America/Chicago',
          }),
          headers,
          method: 'POST',
        },
      ];
      expect(request).toHaveBeenCalledWith(...expectedArgs);
      expect(actualId).resolves.toBe(expectedId);
    });

    test('Calendar event mapped succesfully', () => {
      const title = 'title';
      const url = 'http://url';
      const equipment = 'boat';
      const start = new Date(2022, 0, 13, 9, 30);
      const end = new Date(2022, 0, 13, 12, 30);
      const event = {
        title,
        url,
        date: {
          start,
          end,
        },
        equipment,
      };
      const actual = newCalendarEvent(event);
      const expected = JSON.stringify({
        summary: title,
        location: equipment,
        description: url,
        start: {
          dateTime: start,
          timeZone,
        },
        end: {
          dateTime: end,
          timeZone,
        },
      });
      expect(JSON.parse(actual)).toEqual(JSON.parse(expected));
    });

    test('Match found in computeIfAbsentCalendarId', () => {
      const id = 123;
      const fetch = fetchMock.mockResponse(JSON.stringify({id}));
      const input = {items: ['aaron', 'cohen', computedCalendarName, 'etc'].map((summary, id) => ({summary, id}))};

      // @ts-ignore
      const actual = computeIfAbsentCalendarId(input);
      const expected = input.items.findIndex((item) => item.summary === computedCalendarName);
      expect(fetch).not.toHaveBeenCalled();
      expect(actual).resolves.toBe(expected);
    });

    test('New id generated if match not found in computeIfAbsentCalendarId', () => {
      const id = 123;
      const fetch = fetchMock.mockResponse(JSON.stringify({id}));
      const input = {items: ['aaron', 'cohen', 'etc'].map((summary, id) => ({summary, id}))};

      // @ts-ignore
      const actual = computeIfAbsentCalendarId(input);
      const expected = id;
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(actual).resolves.toBe(expected);
    });
  });

  describe('Calendar Updating / Cleaning', () => {
    test('Only events that are not already on the Google Calendar have creation requests dispatched', () => {
      const calendarId = '123';
      const eventTemplate = {
        title: 'title',
        date: {
          start: new Date(2000, 0, 13),
          end: new Date(2022, 9, 22),
        },
        equipment: 'boat',
      };
      const eventIds = [111, 666, 333, 777, 555, 888];
      const events = eventIds
          .map((entry) => entry.toString())
          .map((url) => ({...eventTemplate, url}));

      const currentEventIds = [111, 222, 333, 444, 555];
      const currentEvents = currentEventIds
          .map((entry) => entry.toString())
          .map((description) => ({description}));


      const mock = fetchMock.mockResponse('{}');
      const endpoint = 'https://www.googleapis.com/calendar/v3/calendars/123/events';
      const requestTemplate = (url : string) => ({
        body: JSON.stringify({
          summary: eventTemplate.title,
          location: eventTemplate.equipment,
          description: url,
          start: {
            dateTime: eventTemplate.date.start.toISOString(),
            timeZone,
          },
          end: {
            dateTime: eventTemplate.date.end.toISOString(),
            timeZone,
          },
        }),
        headers,
        method: 'POST',
      });

      // @ts-ignore
      addNewEvents(events, currentEvents, calendarId);
      const newEventIds = eventIds
          .filter((event) => !currentEventIds.includes(event));

      expect(mock).toHaveBeenCalledTimes(newEventIds.length);
      newEventIds.forEach((id, index) =>
        expect(mock).toHaveBeenNthCalledWith(index + 1,
            endpoint, requestTemplate(id.toString())));
    });

    test('Future events that are on Google Calendar but not computed Calendar are deleted', () => {
      const today = new Date();
      const calendarId = '123';
      const idToRemove = 555;
      const events = [
        '111',
        '222',
        '333',
        '444',
      ].map((url) => ({url}));
      const currentEvents = [
        { // Kept because id in events
          description: '111',
          start: {
            dateTime: new Date(today.getUTCFullYear() + 1, 1).toISOString(),
          },
          id: idToRemove - 2,
        },
        { // Kept because start date occured in the past
          description: '000',
          start: {
            dateTime: new Date(today.getFullYear() - 1, 1).toISOString(),
          },
          id: idToRemove - 1,
        },
        { // Removed because event is in future and id not in events
          description: '555',
          start: {
            dateTime: new Date(today.getFullYear() + 1, 1).toISOString(),
          },
          id: idToRemove,
        },
      ];

      const mock = fetchMock.mockResponse('{}');
      const endpoint = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${idToRemove}`;

      // @ts-ignore
      removeDroppedEvents(events, currentEvents, calendarId);

      expect(mock).toHaveBeenCalledOnce();
      expect(mock).toHaveBeenCalledWith(endpoint, {
        headers,
        method: 'DELETE',
      });
    });
  });

  describe('Find Scheduling Conflicts', () => {
    test('Returns empty array if not logged in', async () => {
      jest.spyOn(require('../../src/background/auth/internals'), 'getGoogleOAuthToken')
          .mockImplementation(jest.fn());
      jest.spyOn(require('../../src/background/login').default, 'isNotLoggedIn')
          .mockImplementation(() => true);
      jest.spyOn(require('../../src/background/login').default, 'logout')
          .mockImplementation(() => {});
      const expected : Array<gapi.client.calendar.Events>= [];

      // @ts-ignore
      const actual = await findCalendarConflicts();
      expect(actual).toEqual(expected);
    });

    test('If logged in gets auth token', async () => {
      const getGoogleOAuthToken = jest.spyOn(require('../../src/background/auth/internals'), 'getGoogleOAuthToken')
          .mockImplementation(() => expect(getGoogleOAuthToken).toHaveBeenCalled());
      jest.spyOn(require('../../src/background/login').default, 'isNotLoggedIn')
          .mockImplementation(() => false);
      jest.spyOn(require('../../src/background/login').default, 'logout')
          .mockImplementation(() => {});
      fetchMock.mockResponse(JSON.stringify({
        items: [],
      }));

      // @ts-ignore
      await findCalendarConflicts();
    });

    test('Filters out events that overlap with provided interval including itself', async () => {
      const url = 'abcd123';
      jest.spyOn(require('../../src/background/auth/internals'), 'getGoogleOAuthToken')
          .mockImplementation(() => {});
      jest.spyOn(require('../../src/background/login').default, 'isNotLoggedIn')
          .mockImplementation(() => false);
      jest.spyOn(require('../../src/background/login').default, 'logout')
          .mockImplementation(() => {});
      const calendarList = {
        items: [
          {
            id: 1,
          },
          {
            id: 2,
          },
          {
            id: 3,
          },
          {
            id: 4,
          },
        ],
      };
      const calendars = [
        {
          summary: 'Calendar1',
          items: [
            { // Remove - starts after endtime
              description: url,
              start: {
                dateTime: new Date(2022, 1, 2, 11),
              },
            },
            { // Keep - not in generated calendar and overlaps
              description: url,
              start: {
                dateTime: new Date(2022, 1, 2, 9),
              },
            },
          ],
        },
        {
          summary: computedCalendarName,
          items: [
            { // Remove - in generated calendar and description matches url
              description: url,
              start: {
                dateTime: new Date(2022, 1, 2, 9),
              },
            },
            { // Keep - overlaps in time an description does not match
              description: 'some other description',
              start: {
                dateTime: new Date(2022, 1, 2, 9),
              },
            },
          ],
        },
        {
          summary: 'Calendar3',
          items: [
            { // Keep
              description: url,
              start: {
                date: new Date(2022, 1, 2, 9),
              },
            },
            { // Remove
              description: url,
              start: {
                date: new Date(2022, 1, 2, 11),
              },
            },
          ],
        },
        {
          summary: 'Calendar3',
          items: [
            { // Remove
              description: url,
              start: {
                date: new Date(2022, 1, 2, 12),
              },
            },
            { // Remove
              description: url,
              start: {
                date: new Date(2022, 1, 2, 12),
              },
            },
          ],
        },
      ];

      const expected : Array<any> = [
        {
          summary: 'Calendar1',
          items: [
            {
              description: url,
              start: {
                dateTime: new Date(2022, 1, 2, 9).toISOString(),
              },
            },
          ],
        },
        {
          summary: computedCalendarName,
          items: [
            {
              description: 'some other description',
              start: {
                dateTime: new Date(2022, 1, 2, 9).toISOString(),
              },
            },
          ],
        },
        {
          summary: 'Calendar3',
          items: [
            {
              description: url,
              start: {
                date: new Date(2022, 1, 2, 9).toISOString(),
              },
            },
          ],
        },
      ];

      fetchMock
          .mockResponseOnce(JSON.stringify(calendarList))
          .mockResponseOnce(JSON.stringify(calendars[0]))
          .mockResponseOnce(JSON.stringify(calendars[1]))
          .mockResponseOnce(JSON.stringify(calendars[2]))
          .mockResponseOnce(JSON.stringify(calendars[3]));

      const actual = await findCalendarConflicts( {
        start: new Date(2022, 1, 2, 3),
        end: new Date(2022, 1, 2, 10),
      }, url);

      expect(actual).toEqual(expected);
    });
  });
});
