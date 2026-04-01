import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.algodeltafx.com/api/v1';
const getToken = async () => await AsyncStorage.getItem('token');

const postJson = async (endpoint, body = {}) => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: token,
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { status: false, data: [] };
  }
};

const PAGE_BODY = (offset = 0, limit = 10) => ({
  offset,
  limit,
  sort_by: 'create_time',
  order: 'DESC',
  filters: {},
});

// ── Group order history ───────────────────────────────────────────
export const getGroupOrderHistory = (offset, limit) =>
  postJson(
    '/users/orderhistory/getgrouporderhistory',
    PAGE_BODY(offset, limit),
  );

// ── Orders inside a group ─────────────────────────────────────────
export const getUserOrders = group_order_id =>
  postJson('/users/orderhistory/getuserorders', { group_order_id });

// ── Individual order history ──────────────────────────────────────
export const getIndividualOrderHistory = (offset, limit) =>
  postJson(
    '/users/orderhistory/getindividualorderhistory',
    PAGE_BODY(offset, limit),
  );

// ── Order details ─────────────────────────────────────────────────
export const getOrdersHistory = (offset, limit) =>
  postJson('/users/orderhistory/getordershistory', PAGE_BODY(offset, limit));
