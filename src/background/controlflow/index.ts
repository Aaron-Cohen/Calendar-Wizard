import {findCalendarConflicts, syncWithGoogleCalendar, updateSingleEvent} from '../google';
import browser from '../../shared/browser';
import {applicableWebsites} from '../constants';
import {tokenizeDates} from '../dates';
import {Message, ParsedEvent, WebsiteEvent} from '../../shared/models';
import googleId from '../login';

export async function detectEventPage(
    details: browser.webNavigation._OnCompletedDetails,
) {
  if (details.frameId) {
    return;
  };
 [
   {
     test: await googleId.isNotLoggedIn(),
     execute: async () => {},
   },
   {
     test: applicableWebsites.includes(details.url),
     execute: async () =>
       requestEvents(details.tabId)
           .then(syncWithGoogleCalendar),
   },
   {
     test: /^.*event\/[0-9]*$/.test(details.url),
     execute: async () => eventPageUpdate(details),
   },
   {
     test: true,
     execute: async () => {},
   },
 ]
     .find((action) => action.test)
     ?.execute()!;
}

export function updateMenus() {
  googleId.get()
      .then((persistedExists: string) => {
        const visible = persistedExists != undefined;
        browser.contextMenus.update('google-signin', {
          visible: !visible,
        });
        browser.contextMenus.update('google-signout', {
          visible: visible,
        });
      });
}

export async function requestEventPageDetails(
    tabId: number,
) : Promise<Message> {
  return browser.tabs.sendMessage(tabId, {
    flavor: 'requestEventPageDetails',
    args: [],
  });
}

export async function requestEvents(
    tabId: number,
) : Promise<Array<ParsedEvent>> {
  return browser.tabs.sendMessage(tabId, {
    flavor: 'requestEvents',
    args: [],
  }).then((events :Array<WebsiteEvent>) =>
    events.map((event) => ({...event, date: tokenizeDates(event.date)})));
}

async function eventPageUpdate(
    details: browser.webNavigation._OnCompletedDetails,
) {
  const pageDetails = await requestEventPageDetails(details.tabId);
  const event : WebsiteEvent = pageDetails.args[0];
  const parsedEvent = {...event, date: tokenizeDates(event.date)};
  findCalendarConflicts(parsedEvent.date, details.url)
      .then((conflicts) => dispatchConflicts(conflicts, details.tabId));

  updateSingleEvent(pageDetails.flavor, parsedEvent);
}

function dispatchConflicts(
    conflicts : Array<gapi.client.calendar.Events>,
    tabId : number,
) {
  return browser.tabs.sendMessage(tabId, {
    flavor: 'displayConflicts',
    args: [conflicts],
  });
}
