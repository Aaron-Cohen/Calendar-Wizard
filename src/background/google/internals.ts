import {ParsedEvent} from '../../shared/models';
import {authenticatedFetch} from '../auth';
import {computedCalendarName, timeZone} from '../constants';

export async function createNewGoogleCalendar() : Promise<string> {
  return authenticatedFetch((headers) =>
    fetch('https://www.googleapis.com/calendar/v3/calendars', {
      method: 'POST',
      body: JSON.stringify({
        summary: computedCalendarName,
        timeZone,
      }),
      headers,
    })
        .then((response) => response.json())
        .then((result : gapi.client.calendar.Calendar) => result.id));
}

export function newCalendarEvent(
    event : ParsedEvent,
) : string {
  return JSON.stringify({
    summary: event.title,
    location: event.equipment,
    description: event.url,
    start: {
      dateTime: event.date.start,
      timeZone,
    },
    end: {
      dateTime: event.date.end,
      timeZone,
    },
  });
}

export async function computeIfAbsentCalendarId(
    calendars : gapi.client.calendar.CalendarList,
) : Promise<string> {
  const calendar = calendars
      .items
      .find((calendar) => calendar.summary === computedCalendarName);

  return calendar ? calendar.id : createNewGoogleCalendar();
}

export async function addNewEvents(
    events : Array<ParsedEvent>,
    currentEvents : Array<gapi.client.calendar.Event>,
    calendarId : string,
) {
  const urls = currentEvents.map((event) => event.description);
  const eventSet = new Set(urls);
  const requests = events
      .filter((event) => !eventSet.has(event.url))
      .map((event) => postEvent(event, calendarId));

  Promise.allSettled(requests);
}

export async function postEvent(
    event : ParsedEvent,
    calendarId: string,
) {
  return authenticatedFetch((headers) =>
    fetch(`https://www.googleapis.com/calendar/v3/calendars/${
      calendarId}/events`, {
      method: 'POST',
      body: newCalendarEvent(event),
      headers,
    }));
}

export async function deleteEvent(
    eventId: string,
    calendarId: string,
) {
  return authenticatedFetch((headers) =>
    fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`, {
      method: 'DELETE',
      headers,
    }));
}

export async function removeDroppedEvents(
    events : Array<ParsedEvent>,
    currentEvents : Array<gapi.client.calendar.Event>,
    calendarId : string,
) {
  const urls = events.map((event) => event.url);
  const eventSet = new Set(urls);
  const today = new Date();

  const droppedEvents = currentEvents
      .filter((event) => !event.start.dateTime || new Date(event.start.dateTime) > today)
      .filter((event) => !eventSet.has(event.description))
      .map((event) => deleteEvent(event.id, calendarId));

  Promise.allSettled(droppedEvents);
}
