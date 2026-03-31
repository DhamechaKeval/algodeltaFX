import { apiGet, apiPost } from './api';

export const getAccounts = () => apiGet('/users/broker/getbrokers');
export const addAccount = body => apiPost('/users/broker/addbroker', body);
export const deleteAccount = broker_id =>
  apiPost('/users/broker/deletebroker', { broker_id });
export const updateTradingFlag = (broker_id, broker_trading_flag) =>
  apiPost('/users/broker/updatebrokertradingflag', {
    broker_id,
    broker_trading_flag,
  });
export const updateAutoRenew = (broker_id, auto_renew) =>
  apiPost('/users/broker/updatebrokerautorenew', { broker_id, auto_renew });
export const setSlTp = (broker_id, is_sl_tp_set, day_sl = 0, day_tp = 0) =>
  apiPost('/users/broker/setslandtp', {
    broker_id,
    is_sl_tp_set,
    day_sl,
    day_tp,
  });
export const refreshAccount = broker_id =>
  apiPost('/users/broker/refreshaccountdata', { broker_id });
export const getBrokerById = broker_id =>
  apiPost('/users/broker/getbrokerbyid', { broker_id });
export const reconnectBroker = (broker_id, fx_password, is_host_based) =>
  apiPost('/users/broker/reconnectbroker', {
    broker_id,
    fx_password,
    is_host_based,
  });
export const extendBroker = (broker_id, duration) =>
  apiPost('/users/broker/extendbroker', { broker_id, duration });
export const updateCallbackUrl = (broker_id, broker_callback_url) =>
  apiPost('/users/broker/updatebrokercallbackurl', {
    broker_id,
    broker_callback_url,
  });

// ── Account Detail ────────────────────────────────────────────
// body: { broker_id }
export const getPositions = broker_id =>
  apiPost('/users/broker/getpositions', { broker_id });
export const getPendingOrders = broker_id =>
  apiPost('/users/broker/getpendingorders', { broker_id });
export const squareOffAll = broker_id =>
  apiPost('/users/broker/squareoffall', { broker_id });

// ── Place Order ───────────────────────────────────────────────
// body: { symbol, type: 0=BUY/1=SELL, volume, broker_id, sl?, tp? }
export const placeOrder = body => apiPost('/users/broker/placeorder', body);

// ── Symbol Search ─────────────────────────────────────────────
// body: { symbol: "BTC" }
export const searchSymbol = symbol =>
  apiPost('/symbols/searchsymbol', { symbol });
export const getBrokerSymbols = broker_id =>
  apiPost('/users/symbols/getbrokersymbols', { broker_id });

// ── Modify order (edit SL/TP) ─────────────────────────────────────
// body: { ticket_id, sl, tp, price, broker_id }
export const modifyOrder = body => apiPost('/users/broker/modifyorder', body);

// ── Square off single position ────────────────────────────────────
// body: { broker_id, ticket_id }
export const squareOffSingle = (broker_id, ticket_id) =>
  apiPost('/users/broker/squareoff', { broker_id, ticket_id });
