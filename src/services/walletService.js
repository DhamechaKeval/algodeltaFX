import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.algodeltafx.com/api/v1';
const getToken = async () => await AsyncStorage.getItem('token');

const safeFetch = async (url, options) => {
  const res = await fetch(url, options);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { status: false, data: [] };
  }
};

// ── Get user ledger ───────────────────────────────────────────────
// POST /users/getuserledger
export const getUserLedger = async (offset = 0, limit = 10) => {
  const token = await getToken();
  return safeFetch(`${BASE_URL}/users/getuserledger`, {
    method: 'POST',
    headers: {
      Authorization: token,
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      offset,
      limit,
      sort_by: 'create_time',
      order: 'DESC',
      filters: {},
    }),
  });
};

// ── Get INR equivalent ────────────────────────────────────────────
// POST /users/payment/getinr  body: { amount: number }
export const getInr = async amount => {
  const token = await getToken();
  return safeFetch(`${BASE_URL}/users/payment/getinr`, {
    method: 'POST',
    headers: {
      Authorization: token,
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount: Number(amount) }),
  });
};

// ── Make payment ──────────────────────────────────────────────────
// POST /users/payment/makepayment  body: { user_id, amount, country }
export const makePayment = async (user_id, amount, country) => {
  const token = await getToken();
  return safeFetch(`${BASE_URL}/users/payment/makepayment`, {
    method: 'POST',
    headers: {
      Authorization: token,
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: String(user_id),
      amount: String(amount),
      country,
    }),
  });
};
