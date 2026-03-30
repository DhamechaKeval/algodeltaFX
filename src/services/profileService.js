import {apiGet, apiPut} from './api';

/**
 * Get user profile
 * Returns: { status: true, data: {...} }
 */
export const getProfile = () =>
  apiGet('/users/getuserprofile');

/**
 * Get countries list
 * Returns: { status: true, data: [...] }
 */
export const getCountries = () =>
  apiGet('/users/getcountries');

/**
 * Update profile
 */
export const updateProfile = (body) =>
  apiPut('/users/updateuserprofile', body);