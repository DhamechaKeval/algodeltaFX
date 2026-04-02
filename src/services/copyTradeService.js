import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.algodeltafx.com/api/v1';
const getToken = async () => await AsyncStorage.getItem('token');

const post = async (endpoint, body = {}) => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      authorization: token,
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

const get = async endpoint => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      authorization: token,
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { status: false, data: [] };
  }
};

// ── Groups ────────────────────────────────────────────────────────
export const getGroups = () => get('/users/group/getgroups');
export const addGroup = group_name =>
  post('/users/group/addgroup', { group_name });
export const updateGroup = (group_id, group_name) =>
  post('/users/group/updategroupdata', { group_id, group_name });
export const deleteGroup = group_id =>
  post('/users/group/deletegroup', { group_id });
export const getGroupById = group_id =>
  post('/users/group/getgroupbyid', { group_id });
export const getGroupBrokers = group_id =>
  post('/users/group/getgroupbrokers', { group_id });

// ── Brokers ───────────────────────────────────────────────────────
export const getBrokerNames = () =>
  post('/users/broker/getbrokernames', { only_my_brokers: true });

// ── Master ────────────────────────────────────────────────────────
export const connectMaster = (group_id, master_broker_id) =>
  post('/users/group/connectmaster', { group_id, master_broker_id });
export const disconnectMaster = group_id =>
  post('/users/group/disconnectmaster', { group_id });

// ── Trading flag ──────────────────────────────────────────────────
export const updateGroupTrading = (group_id, trading_flag) =>
  post('/users/group/updategrouptradingflag', { group_id, trading_flag });

// ── Orders ────────────────────────────────────────────────────────
export const getGroupPositions = group_id =>
  post('/users/group/getgroupbrokerspositions', { group_id });
export const getGroupPendingOrders = group_id =>
  post('/users/group/getgrouppendingorders', { group_id });
export const squareOffAll = group_id =>
  post('/users/group/squareoffall', { group_id });
export const cancelAll = group_id =>
  post('/users/group/cancelall', { group_id });

// ── Symbol + Place Order ──────────────────────────────────────────
export const searchSymbol = symbol => post('/symbols/searchsymbol', { symbol });
export const placeGroupOrder = body =>
  post('/users/group/placegrouporder', body);
export const addChildBroker = (group_id, broker_id) =>
  post('/users/group/addgroupbroker', { group_id, broker_id });
export const removeChildBroker = (group_id, broker_id) =>
  post('/users/group/removegroupbroker', { group_id, broker_id });
export const updateMultiplier = (group_id, broker_id, multiplier) =>
  post('/users/group/updatemultiplier', { group_id, broker_id, multiplier });
