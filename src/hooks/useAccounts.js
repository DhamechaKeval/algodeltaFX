import { useState, useEffect, useCallback } from 'react';
import {
  getAccounts,
  addAccount,
  deleteAccount,
  updateTradingFlag,
  updateAutoRenew,
  setSlTp,
  refreshAccount,
} from '../services/accountService';
import { useAlert } from '../components/common/AlertContext';
import { useLoadingLock } from '../context/LoadingLockContext';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const { showAlert } = useAlert();
  const { withLock } = useLoadingLock();

  // ── Fetch all ─────────────────────────────────────────────────
  const fetchAccounts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await getAccounts();
      const list = Array.isArray(data?.data) ? data.data : [];
      setAccounts(list);
      setFiltered(list);
    } catch {
      setError('Failed to load accounts. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // ── Search ────────────────────────────────────────────────────
  const handleSearch = useCallback(
    text => {
      setSearch(text);
      const q = text.toLowerCase().trim();
      setFiltered(
        !q
          ? accounts
          : accounts.filter(a =>
              (a?.nic_name || a?.broker_combine_name || '')
                .toLowerCase()
                .includes(q),
            ),
      );
    },
    [accounts],
  );

  // ── Optimistic update helper ──────────────────────────────────
  const updateLocal = useCallback((broker_id, patch) => {
    const apply = list =>
      list.map(a => (a.broker_id === broker_id ? { ...a, ...patch } : a));
    setAccounts(prev => apply(prev));
    setFiltered(prev => apply(prev));
  }, []);

  // ── Toggle Trading ────────────────────────────────────────────
  const handleToggleTrading = useCallback(
    async (broker_id, current) => {
      const next = !current;
      updateLocal(broker_id, { main_trading_flag: next });
      try {
        const res = await updateTradingFlag(broker_id, next);
        if (res?.status !== true) {
          updateLocal(broker_id, { main_trading_flag: current });
          showAlert('Error', res?.msg || 'Failed to update trading.');
        }
      } catch (e) {
        updateLocal(broker_id, { main_trading_flag: current });
        showAlert('Error', e?.msg || 'Network error.');
      }
    },
    [updateLocal],
  );

  // ── Toggle Day SL/TP ──────────────────────────────────────────
  const handleToggleSlTp = useCallback(
    async (broker_id, current) => {
      const next = !current;
      updateLocal(broker_id, { is_sl_tp_set: next });
      try {
        const res = await setSlTp(broker_id, next);
        if (res?.status !== true) {
          updateLocal(broker_id, { is_sl_tp_set: current });
          showAlert('Error', res?.msg || 'Failed to update SL/TP.');
        }
      } catch (e) {
        updateLocal(broker_id, { is_sl_tp_set: current });
        showAlert('Error', e?.msg || 'Network error.');
      }
    },
    [updateLocal],
  );

  // ── Toggle Auto Renew ─────────────────────────────────────────
  const handleToggleAutoRenew = useCallback(
    async (broker_id, current) => {
      const next = !current;
      updateLocal(broker_id, { auto_renew: next });
      try {
        const res = await updateAutoRenew(broker_id, next);
        if (res?.status !== true) {
          updateLocal(broker_id, { auto_renew: current });
          showAlert('Error', res?.msg || 'Failed to update auto renew.');
        }
      } catch (e) {
        updateLocal(broker_id, { auto_renew: current });
      }
    },
    [updateLocal],
  );

  // ── Refresh single account ────────────────────────────────────
  const handleRefreshAccount = useCallback(
    broker_id =>
      withLock(async () => {
        try {
          await refreshAccount(broker_id);
          await fetchAccounts(true);
        } catch (e) {
          showAlert('Error', e?.msg || 'Failed to refresh account.');
        }
      }),
    [fetchAccounts, withLock],
  );

  // ── Delete ────────────────────────────────────────────────────
  const handleDeleteAccount = useCallback(
    (broker_id, name) => {
      showAlert(
        'Delete Account',
        `Are you sure you want to delete "${name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () =>
              withLock(async () => {
                // ← only wrap the onPress
                try {
                  const res = await deleteAccount(broker_id);
                  if (res?.status === true) {
                    fetchAccounts(true);
                  } else {
                    showAlert('Error', res?.msg || 'Failed to delete.');
                  }
                } catch (e) {
                  showAlert('Error', e?.msg || 'Network error.');
                }
              }),
          },
        ],
      );
    },
    [fetchAccounts, withLock],
  );

  // ── Add account ───────────────────────────────────────────────
  const handleAddAccount = useCallback(
    async formData => {
      setAddLoading(true);
      try {
        const res = await addAccount(formData);
        if (res?.status === true) {
          setShowModal(false);
          fetchAccounts(true);
          return { success: true };
        }
        return {
          success: false,
          message: res?.msg || 'Failed to add account.',
        };
      } catch (e) {
        return { success: false, message: e?.msg || 'Network error.' };
      } finally {
        setAddLoading(false);
      }
    },
    [fetchAccounts],
  );

  return {
    accounts,
    filtered,
    search,
    loading,
    refreshing,
    error,
    showModal,
    addLoading,
    setShowModal,
    handleSearch,
    handleToggleTrading,
    handleToggleSlTp,
    handleToggleAutoRenew,
    handleRefreshAccount,
    handleDeleteAccount,
    handleAddAccount,
    fetchAccounts,
  };
};
