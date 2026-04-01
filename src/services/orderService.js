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

// ── Group order history (all records) ─────────────────────────────
export const getGroupOrderHistory = (filters = {}) =>
  postJson('/users/orderhistory/getgrouporderhistory', {
    offset: 0,
    limit: 1000,
    sort_by: 'create_time',
    order: 'DESC',
    filters,
  });

// ── Orders inside a group ─────────────────────────────────────────
export const getUserOrders = group_order_id =>
  postJson('/users/orderhistory/getuserorders', { group_order_id });

// ── Individual order history (all records) ────────────────────────
export const getIndividualOrderHistory = (filters = {}) =>
  postJson('/users/orderhistory/getindividualorderhistory', {
    offset: 0,
    limit: 1000,
    sort_by: 'create_time',
    order: 'DESC',
    filters,
  });

// ── Order details ─────────────────────────────────────────────────
export const getOrdersHistory = (filters = {}) =>
  postJson('/users/orderhistory/getordershistory', {
    offset: 0,
    limit: 1000,
    sort_by: 'create_time',
    order: 'DESC',
    filters,
  });
