import browser from '../shared/browser';
import {Message, WebsiteEvent} from '../shared/models';
import {addedMessage, calendarFileName, removedMessage} from './constants';
import {toast} from './toast';

browser.runtime.onMessage.addListener((
    message : Message,
    sender : browser.runtime.MessageSender,
    reply : Function,
) => {
  switch (message.flavor) {
    case 'requestEvents':
      reply(getEnrolledEvents());
      break;
    case 'requestEventPageDetails':
      reply(eventPageDetails());
      break;
    case 'displayConflicts':
      showConflicts(message.args[0]);
      break;
    case 'toast':
      toast(message.args[0]);
      break;
    case 'fileDownload':
      const url = window.URL.createObjectURL(new Blob([...message.args], {
        type: 'text/calendar',
      }));
      download(url);
      toast('Downloading .ics iCalendar file');
      break;
  }
});

export function eventPageDetails() : Message {
  const args : Array<WebsiteEvent> = [{
    title: (document.querySelector('h1.event-title') as HTMLHeadingElement)?.innerText.trim(),
    url: document.location.href,
    date: (document.querySelector('p.event-schedule') as HTMLParagraphElement)?.innerText.trim(),
    equipment: (document.querySelector('dd a') as HTMLAnchorElement)?.innerText.trim() || '',
  }];

  const alertBox = document.querySelector('div.alert-dismissable');
  const alertMessage = alertBox?.lastChild?.nodeValue;

  const flavor = (alertMessage === addedMessage) ? 'add-event' :
                 (alertMessage === removedMessage) ? 'remove-event':
                                                  'no-update';
  return {
    flavor,
    args,
  };
}

export function showConflicts(
    conflicts: Array<gapi.client.calendar.Events>,
) {
  const conflictBox = document.createElement('div');
  conflictBox.className = 'alert alert-info';

  if (!conflicts.length) {
    conflictBox.innerText = 'No Google Calendar Conflicts';
  } else {
    const header = document.createElement('h4');
    header.innerText = 'Calendar Conflicts: ';
    conflictBox.appendChild(header);

    conflicts.forEach((conflict) => {
      const paragraph = document.createElement('p');
      paragraph.innerText = conflict.summary;
      conflictBox.appendChild(paragraph);

      const bulletPoints = document.createElement('ul');
      paragraph.appendChild(bulletPoints);

      conflict.items.forEach((event) => {
        const listItem = document.createElement('li');
        listItem.innerText = event.summary;
        bulletPoints.appendChild(listItem);
      });
    });
  }

  const createEventBox = () => {
    const messageBox = document.createElement('div');
    messageBox.className = 'event-messages';
    document.querySelector('#content')?.appendChild(messageBox);
    return messageBox;
  };

  const messageBox = document.querySelector('div.event-messages') || createEventBox();
  messageBox.appendChild(conflictBox);
}

function download(
    url : string,
) {
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', calendarFileName);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => window.URL.revokeObjectURL(url), 10000);
}

export function getEnrolledEvents() : Array<WebsiteEvent> {
  const eventTable = document.querySelector('tbody');
  if (!eventTable) {
    return [];
  }
  return Array.prototype
      .map.call(eventTable.children, (row : HTMLTableRowElement) => row.children)
      .map((column : HTMLCollection) =>
        ({
          title: column[0]?.textContent || '',
          url: (column[0]?.children[0] as HTMLAnchorElement)?.href || '',
          date: column[1]?.textContent || '',
          equipment: column[2]?.textContent || '',
        }));
}
