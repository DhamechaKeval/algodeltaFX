import { apiGet, apiPost } from './api';

// ── Get all accounts ──────────────────────────────────────────────
// Response: { status: true, data: [...] }
export const getAccounts = () => apiGet('/users/broker/getbrokers');

// ── Add broker ────────────────────────────────────────────────────
// body: { fx_login, fx_password, nic_name, duration, auto_renew, is_host_based, fx_server | fx_host+fx_port }
export const addAccount = body => apiPost('/users/broker/addbroker', body);

// ── Delete broker ─────────────────────────────────────────────────
// body: { broker_id }
export const deleteAccount = broker_id =>
  apiPost('/users/broker/deletebroker', { broker_id });

// ── Toggle Trading flag ───────────────────────────────────────────
// body: { broker_id, broker_trading_flag: bool }
export const updateTradingFlag = (broker_id, broker_trading_flag) =>
  apiPost('/users/broker/updatebrokertradingflag', {
    broker_id,
    broker_trading_flag,
  });

// ── Toggle Auto Renew ─────────────────────────────────────────────
// body: { broker_id, auto_renew: bool }
export const updateAutoRenew = (broker_id, auto_renew) =>
  apiPost('/users/broker/updatebrokerautorenew', { broker_id, auto_renew });

// ── Set Day SL/TP ─────────────────────────────────────────────────
// body: { broker_id, is_sl_tp_set, day_sl, day_tp }
export const setSlTp = (broker_id, is_sl_tp_set, day_sl = 0, day_tp = 0) =>
  apiPost('/users/broker/setslandtp', {
    broker_id,
    is_sl_tp_set,
    day_sl,
    day_tp,
  });

// ── Refresh account data ──────────────────────────────────────────
// body: { broker_id }
export const refreshAccount = broker_id =>
  apiPost('/users/broker/refreshaccountdata', { broker_id });

// ── Get broker by id ──────────────────────────────────────────────
// body: { broker_id }
export const getBrokerById = broker_id =>
  apiPost('/users/broker/getbrokerbyid', { broker_id });
