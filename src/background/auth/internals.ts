import browser from '../../shared/browser';
import {googleClientId} from '../constants';
import googleId from '../login';

/*
 * Gets auth token and numeric key for account selected. This
 * prevents user from needing to select account on each operation
 *
 * This will throw an error if the user denies the Google oauth authorization.
 *
 * As long as permission is granted, launchWebAuthFlow will complete
 * silently. If the user revokes auth permissions in their Google user
 * console, launchWebAuthFlow will reappear with the auth prompt.
 */

export async function getGoogleOAuthToken() : Promise<string> {
  const clientId = encodeURIComponent(googleClientId);
  const redirectUri = encodeURIComponent(browser.identity.getRedirectURL());
  const scope = encodeURIComponent('openid https://www.googleapis.com/auth/calendar');

  const loginHint = await googleId.get();
  const AUTH_URL = `https://accounts.google.com/o/oauth2/auth\?client_id=${clientId
  }\&response_type=token\&redirect_uri=${redirectUri
  }${loginHint ? `\&login_hint=${loginHint}` : ''
  }\&scope=${scope
  }`;

  const token = await browser.identity.launchWebAuthFlow({
    interactive: true,
    url: AUTH_URL,
  })
      .then((response : string) => response.match(/.*access_token=([^&]*).*/))
      .then((matches: Array<string>) => matches[1])
      .catch(() => false);

  if (!token) throw new Error('login failure');

  // Storing Google user id locally prevents user from needing to select
  // the desired Google account every time an auth request is made
  await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`)
      .then((response) => response.json())
      .then((result) => googleId.set(result.id));

  return `Bearer ${token}`;
}
