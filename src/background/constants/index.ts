/**
 * The name of the calendar in Google Calendar for events
 */
export const computedCalendarName = 'Active Enrollments';

/**
 * Timezone from tz database that Madison, WI corresponds to
 */
export const timeZone = 'America/Chicago';

/**
 * Allows for 22 to be interpretted as 2022
 */
export const yearOffset = 2000;

/**
 * Domains to operate on
 */
export const applicableWebsites = [
  'https://members.hoofers.org/',
  'https://members.hoofermountaineering.org/',
  'https://events.hooferouting.org/',
  'https://events.hooferscuba.org/',
  'https://events.hoofersns.org/',
  'https://lessons.hoofersailing.org/',
];

/**
 * ClientId of application in Google Console
 */
export const googleClientId = '1012858377895-7ndl9jlbqs3mesbsf0l0eg7b3qats39o.apps.googleusercontent.com';

/**
 * Mapping of Online month abbreviations to 0-indexed integers
 */
export const monthMapping = new Map<string | undefined, number>([
  ['Jan', 0],
  ['Feb', 1],
  ['Mar', 2],
  ['Apr', 3],
  ['May', 4],
  ['Jun', 5],
  ['Jul', 6],
  ['Aug', 7],
  ['Sep', 8],
  ['Oct', 9],
  ['Nov', 10],
  ['Dec', 11],
]);

/**
 * Key for where in browser's local storage the google ID is stored
 */
export const loginKey = 'googleId';

/**
 * Toast messages for when user logs in or out
 */
export const loginToast = 'Login Successful';
export const loginErrToast = 'Login Failed';
export const logoutToast = 'Logout Successful';
