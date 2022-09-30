import browser from '../../shared/browser';
import {requestEvents} from '../controlflow';
import {updateMenus} from '../controlflow';
import {loginErrToast, loginKey, loginToast, logoutToast} from '../constants';
import {syncWithGoogleCalendar} from '../google';

export default {
  set,
  get,
  login,
  logout,
  isNotLoggedIn,
};

async function set(
    googleId : string,
) {
  await browser.storage.local
      .set({
        [loginKey]: googleId,
      });
}

async function get() : Promise<string> {
  return browser.storage.local
      .get(loginKey)
      .then((persisted: any) => persisted[loginKey]);
}

async function login(
    tabId: number,
) {
  let toastMessage;
  try {
    await requestEvents(tabId).then(syncWithGoogleCalendar);
    toastMessage = loginToast;
  } catch (e) {
    toastMessage = loginErrToast;
    return;
  } finally {
    browser.tabs.sendMessage(tabId, {
      flavor: 'toast',
      args: [toastMessage],
    });
  }

  updateMenus();
}

async function logout(
    tabId : number,
) {
  await browser.storage.local.remove(loginKey);
  updateMenus();
  browser.tabs.sendMessage(tabId, {
    flavor: 'toast',
    args: [logoutToast],
  });
}

async function isNotLoggedIn() : Promise<boolean> {
  return !await get();
}
