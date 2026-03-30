import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.algodeltafx.com/api/v1';
const ORIGIN   = 'https://www.algodeltafx.com';

// ── Build headers ─────────────────────────────────────────────────
const buildHeaders = async (requiresAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
    Accept:         '*/*',
    Origin:         ORIGIN,
    Referer:        `${ORIGIN}/`,
  };
  if (requiresAuth) {
    const token = await AsyncStorage.getItem('token');
    if (token) headers.Authorization = token;
  }
  return headers;
};

// ── GET ───────────────────────────────────────────────────────────
export const apiGet = async (endpoint) => {
  const headers  = await buildHeaders();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers,
  });
  const data = await response.json();
  return data;
};

// ── POST ──────────────────────────────────────────────────────────
export const apiPost = async (endpoint, body, requiresAuth = true) => {
  const headers  = await buildHeaders(requiresAuth);
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method:  'POST',
    headers,
    body:    JSON.stringify(body),
  });
  const data = await response.json();
  return data;
};

// ── PUT ───────────────────────────────────────────────────────────
export const apiPut = async (endpoint, body) => {
  const headers  = await buildHeaders();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method:  'PUT',
    headers,
    body:    JSON.stringify(body),
  });
  const data = await response.json();
  return data;
};

// ── DELETE ────────────────────────────────────────────────────────
export const apiDelete = async (endpoint) => {
  const headers  = await buildHeaders();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers,
  });
  const data = await response.json();
  return data;
};