import browser from '../../shared/browser';
import {ParsedEvent} from '../../shared/models';
import {vEvent} from './vevent';

export function createIcsCalendar(
    events : Array<ParsedEvent>,
    tab : browser.tabs.Tab,
) {
  if (!events.length) {
    return;
  }

  const file = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//COHEN//NONSGML Calendar Wizard//EN\r\n',
  ].join('\r\n')
      .concat(events.map(createVevent).join('\r\n'))
      .concat('\r\nEND:VCALENDAR');

  browser.tabs.sendMessage(tab.id!, {
    flavor: 'fileDownload',
    args: [file],
  });
}

function createVevent(
    event : ParsedEvent,
) : string {
  const today = new Date();
  return [
    'BEGIN:VEVENT',
    `UID:${event.url}`,
    `DTSTAMP:${vEvent(today)}`,
    `DTSTART:${vEvent(event.date.start)}`,
    `DTEND:${vEvent(event.date.end)}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.equipment}`,
    `DESCRIPTION:${event.url}`,
    'END:VEVENT',
  ].join('\r\n');
}
