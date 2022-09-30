import {ParsedEvent} from '../shared/models';
import browser from '../shared/browser';
import {applicableWebsites} from './constants';
import {createIcsCalendar} from './icalendar';
import googleId from './login';
import {detectEventPage, updateMenus, requestEvents} from './controlflow';

const isFirefox = browser.runtime
    .getURL('')
    .startsWith('moz-extension://');

// Only Firefox API supports submenu icons
export const googleIcons = isFirefox ? {
  icons: {
    '16': 'icons/google-icon-16.png',
    '32': 'icons/google-icon-32.png',
  },
}: {};

export const iCalendarIcons = isFirefox ? {
  icons: {
    '16': 'icons/icalendar-icon-16.png',
    '32': 'icons/icalendar-icon-32.png',
  },
} : {};

browser.contextMenus.removeAll().then(() => {
  browser.contextMenus.create({
    id: 'google-signin',
    title: 'Sign in with Google',
    contexts: ['all'],
    documentUrlPatterns: applicableWebsites,
    ...googleIcons,
  });

  browser.contextMenus.create({
    id: 'download-ics',
    title: 'Download .ics iCalendar File',
    contexts: ['all'],
    documentUrlPatterns: applicableWebsites,
    ...iCalendarIcons,
  });

  browser.contextMenus.create({
    id: 'google-signout',
    title: 'Sign out of Google',
    contexts: ['all'],
    documentUrlPatterns: applicableWebsites,
    visible: false,
    ...googleIcons,
  });

  updateMenus();
});

const url = applicableWebsites.map((site) => ({urlPrefix: site}));
browser.contextMenus.onClicked.addListener(handleClick);
browser.webNavigation.onCompleted.addListener(detectEventPage, {url});

function handleClick(
    info : browser.contextMenus.OnClickData,
    tab: browser.tabs.Tab,
) {
  switch (info.menuItemId) {
    case 'download-ics':
      requestEvents(tab.id!)
          .then((events: Array<ParsedEvent>) =>
            createIcsCalendar(events, tab));
      break;
    case 'google-signin':
      googleId.login(tab.id!);
      break;
    case 'google-signout':
      googleId.logout(tab.id!);
      break;
  }
};
