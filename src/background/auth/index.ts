import {getGoogleOAuthToken} from './internals';

const googleHeaders = {
  Authorization: '',
};

/*
 * Wrapper function for auth calls that regenerates
 * auth token as it could expire in between requests.
 */
export async function authenticatedFetch<T>(
    fetch : (n: Record<string, string>) => Promise<T>,
) : Promise<T> {
  try {
    return await fetch(googleHeaders);
  } catch (e) {
    googleHeaders.Authorization = await getGoogleOAuthToken();
    return await fetch(googleHeaders);
  }
}
