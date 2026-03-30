import {apiPost} from './api';

const DOMAIN = 'https://www.algodeltafx.com';

/**
 * Login
 * Returns: { status: true, token: '...' }
 */
export const login = (email, password) =>
  apiPost(
    '/auth/userlogin',
    {domain: DOMAIN, email, password},
    false, // no auth token needed for login
  );