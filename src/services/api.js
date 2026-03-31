import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.algodeltafx.com/api/v1';
const ORIGIN = 'https://www.algodeltafx.com';

// ── Navigation ref (set from App.jsx) ────────────────────────────
let _navigatorRef = null;
export const setNavigatorRef = ref => {
  _navigatorRef = ref;
};

// ── Auto logout on 401 ────────────────────────────────────────────
const handleUnauthorized = async () => {
  await AsyncStorage.removeItem('token');
  if (_navigatorRef?.isReady()) {
    _navigatorRef.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  }
};

// ── Build headers ─────────────────────────────────────────────────
const buildHeaders = async (requiresAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
    Accept: '*/*',
    Origin: ORIGIN,
    Referer: `${ORIGIN}/`,
  };
  if (requiresAuth) {
    const token = await AsyncStorage.getItem('token');
    if (token) headers.Authorization = token;
  }
  return headers;
};

// ── Base fetch with error handling ────────────────────────────────
const baseFetch = async (endpoint, options) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    // Token expired or unauthorized
    if (response.status === 401) {
      await handleUnauthorized();
      throw new Error('Session expired. Please login again.');
    }

    const data = await response.json();

    // Some APIs return status:false with a token error message
    if (
      data?.status === false &&
      (data?.message?.toLowerCase().includes('token') ||
        data?.message?.toLowerCase().includes('unauthorized') ||
        data?.message?.toLowerCase().includes('expired'))
    ) {
      await handleUnauthorized();
      throw new Error('Session expired. Please login again.');
    }

    return data;
  } catch (err) {
    // Re-throw so hooks can handle it
    throw err;
  }
};

// ── GET ───────────────────────────────────────────────────────────
export const apiGet = async endpoint => {
  const headers = await buildHeaders();
  return baseFetch(endpoint, { method: 'GET', headers });
};

// ── POST ──────────────────────────────────────────────────────────
export const apiPost = async (endpoint, body, requiresAuth = true) => {
  const headers = await buildHeaders(requiresAuth);
  return baseFetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
};

// ── PUT ───────────────────────────────────────────────────────────
export const apiPut = async (endpoint, body) => {
  const headers = await buildHeaders();
  return baseFetch(endpoint, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
};

// ── DELETE ────────────────────────────────────────────────────────
export const apiDelete = async endpoint => {
  const headers = await buildHeaders();
  return baseFetch(endpoint, { method: 'DELETE', headers });
};
