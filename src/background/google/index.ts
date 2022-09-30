import {computeIfAbsentCalendarId, addNewEvents, removeDroppedEvents, postEvent, deleteEvent} from './internals';
import {authenticatedFetch} from '../auth';
import {Duration, ParsedEvent} from '../../shared/models';
import {computedCalendarName} from '../constants';
import googleId from '../login';

export async function syncWithGoogleCalendar(
    events : Array<ParsedEvent>,
) {
  if (!events.length) {
    return;
  }

  const calendarId = await authenticatedFetch((headers) =>
    fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      method: 'GET',
      headers,
    })
        .then((response) => response.json())
        .then(computeIfAbsentCalendarId));

  const currentEvents = await authenticatedFetch((headers) => fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
    method: 'GET',
    headers,
  })
      .then((response) => response.json())
      .then((result : gapi.client.calendar.Events) => result.items)) || [];

  addNewEvents(events, currentEvents, calendarId);
  removeDroppedEvents(events, currentEvents, calendarId);
}

export async function updateSingleEvent(
    flavor: string,
    event: ParsedEvent,
) {
  if (flavor === 'no-update') {
    return;
  }

  const calendarId = await authenticatedFetch((headers) =>
    fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      method: 'GET',
      headers,
    })
        .then((response) => response.json())
        .then(computeIfAbsentCalendarId));

  if (flavor === 'add-event') {
    postEvent(event, calendarId);
  } else if (flavor === 'remove-event') {
    const requests = await authenticatedFetch((headers) => fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?q=${
      event.url
    }`, {
      method: 'GET',
      headers,
    })
        .then((response) => response.json())
        .then((result : gapi.client.calendar.CalendarList) => result.items)
        .then((events) => events.map((event) => deleteEvent(event.id, calendarId))));

    Promise.allSettled(requests);
  }
}

export async function findCalendarConflicts(
    interval: Duration,
    url: string,
) : Promise<Array<gapi.client.calendar.Events>> {
  if (await googleId.isNotLoggedIn()) {
    return [];
  }

  const calendarList = await authenticatedFetch((headers) =>
    fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      method: 'GET',
      headers,
    })
        .then((response) => response.json())
        .then((result : gapi.client.calendar.CalendarList) =>
          result.items.map((item) => item.id)));

  const promises : Array<Promise<gapi.client.calendar.Events>> =
    calendarList.map((calendarId) =>
      authenticatedFetch((headers) =>
        fetch(`https://www.googleapis.com/calendar/v3/calendars/${
          encodeURIComponent(calendarId)}/events?singleEvents=${
          true}\&maxResults=${
          2500
        }\&timeMin=${ // Constrains to events that end after the event starts
          interval.start.toISOString()
        }\&timeMax=${ // Constrains to events that begin before the event ends
          interval.end.toISOString()
        }`, {
          method: 'GET',
          headers,
        }).then((response) => response.json()),
      ),
    );

  const potentialConflicts : Array<gapi.client.calendar.Events> =
    await Promise.allSettled(promises)
        .then((promises) =>
          promises.filter((x):
            x is PromiseFulfilledResult<any> => x.status === 'fulfilled'))
        .then((promises) => promises.map((promise) => promise.value));
  /**
   * Google API only allows one to filter on lower bound of end time, but this
   * includes events that start after the event is complete. This must be
   * manually filtered. Additionally, the event in question re: conflicts
   * should not conflict with itself.
   */
  return potentialConflicts
      .map((conflict) => ({
        ...conflict,
        items: conflict.items
            .filter((event) =>
              conflict.summary !== computedCalendarName ||
                event.description !== url,
            )
            .filter((event) =>
              // @ts-ignore - GAPI ensures either date or dateTime will exist
              new Date(event.start.dateTime || event.start.date) < interval.end,
            ),
      }))
      .filter((conflict) => conflict.items.length);
}
