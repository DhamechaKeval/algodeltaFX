import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from '../common/Icon';
import Badge from '../common/Badge';
import StatBox from '../common/StatBox';
import Toggle from '../common/Toggle';
import MultiplierModal from './MultiplierModal';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import {
  removeChildBroker,
  refreshChildBroker,
  updateChildTrading,
} from '../../services/copyTradeService';
import { useAlert } from '../common/AlertContext';

const fmt = v => {
  if (v === null || v === undefined) return '0';
  const n = Number(v);
  if (n >= 1000) return `${(n / 1000).toFixed(4)}K`;
  return String(v);
};

export default function ChildAccountCard({
  item,
  groupId,
  onReload,
  navigation,
}) {
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showMult, setShowMult] = useState(false);
  const { showAlert } = useAlert();

  // Local state for multiplier display — updates after save
  const [multMethod, setMultMethod] = useState(() => {
    if (item?.is_balance_based) return 'balance_based';
    if (item?.is_fix_lot) return 'fix_lot';
    return 'multiplier';
  });
  const [multValue, setMultValue] = useState(() => {
    if (item?.is_balance_based) return String(item?.multiplier);
    else return String(item?.fix_lot ?? (item?.is_fix_lot ? 0.01 : 1));
  });

  const {
    broker_id,
    broker_combine_name,
    nic_name,
    is_connected,
    grpbr_trading_flag,
    end_date,
    account_info = {},
  } = item;

  const {
    balance = 0,
    equity = 0,
    currency = 'USD',
    leverage = 0,
    margin_free = 0,
    positions_count = 0,
    orders_count = 0,
    floating_profit = 0,
  } = account_info;

  const expiryDate = end_date
    ? new Date(end_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : item?.expiry ?? '—';

  const pnl = Number(floating_profit);

  // ── Multiplier label shown in card ──
  // Shows "1x" for multiplier, "0.01 lot" for fix lot, "Bal" for balance based
  const multDisplayLabel =
    multMethod === 'fix_lot'
      ? `${multValue} lot`
      : multMethod === 'balance_based'
      ? `${multValue}`
      : `${multValue}`;

  // ── Trading toggle ──
  const handleTrading = () => {
    showAlert(
      'Confirm Trading',
      `${grpbr_trading_flag ? 'Disable' : 'Enable'} trading for this account?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const gbId = item?.group_broker_id ?? item?.id ?? broker_id;
              await updateChildTrading(gbId, !grpbr_trading_flag);
              onReload && onReload();
            } catch (e) {
              showAlert('Error', e?.message || 'Failed.');
            }
          },
        },
      ],
    );
  };

  // ── Delete ──
  const handleDelete = () => {
    showAlert(
      'Remove Child Account',
      `Remove "${broker_combine_name || nic_name}" from this group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const gbId = item?.group_broker_id ?? item?.id;
              const res = await removeChildBroker(gbId);
              if (res?.status === true) {
                onReload && onReload();
              } else {
                showAlert('Error', res?.message || 'Failed to remove.');
              }
            } catch (e) {
              showAlert('Error', e?.message || 'Network error.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  // ── Refresh ──
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await refreshChildBroker(broker_id);
      if (res?.status === true) {
        onReload && onReload();
      } else {
        showAlert('Error', res?.message || 'Failed to refresh.');
      }
    } catch (e) {
      showAlert('Error', e?.message || 'Network error.');
    } finally {
      setRefreshing(false);
    }
  };

  // ── After multiplier saved ──
  const handleMultSaved = (method, value) => {
    setMultMethod(method);
    setMultValue(String(value));
    onReload && onReload();
  };

  return (
    <>
      <View style={s.card}>
        {/* ── Name row ── */}
        <View style={s.nameRow}>
          <View
            style={[
              s.dot,
              {
                backgroundColor: is_connected
                  ? colors.primary
                  : colors.textMuted,
              },
            ]}
          />
          <Text style={s.name} numberOfLines={1}>
            {broker_combine_name || nic_name || 'Account'}
          </Text>
        </View>

        {/* ── Badges ── */}
        <View style={s.badgeRow}>
          <Badge label={`${fmt(balance)}-${currency}`} variant="green" />
          <Badge label={`1:${leverage}`} variant="gray" />
        </View>

        {/* ── Stats row 1: Equity | POS | Pending | P&L ── */}
        <View style={s.statsRow}>
          <StatBox label="Equity" value={fmt(equity)} />
          <StatBox label="POS" value={positions_count} />
          <StatBox label="Pending" value={orders_count} />
          <StatBox
            label="P&L"
            value={Number(floating_profit).toFixed(2)}
            green={pnl > 0}
            red={pnl < 0}
          />
        </View>

        {/* ── Stats row 2: Expiry | Multiplier(tappable) | Free Margin ── */}
        <View style={s.statsRow}>
          <StatBox label="Expiry" value={expiryDate} />

          {/* Multiplier — tap to open modal */}
          <TouchableOpacity
            style={s.multBox}
            onPress={() => setShowMult(true)}
            activeOpacity={0.7}
          >
            <Text style={s.multLabel}>
              {multMethod === 'fix_lot'
                ? 'Fix Lot'
                : multMethod === 'balance_based'
                ? 'Bal Based'
                : 'Multiplier'}
            </Text>
            <View style={s.multValueRow}>
              <Text style={s.multValue}>{multDisplayLabel}</Text>
              <Icon
                name="edit"
                size={10}
                color={colors.primary}
                strokeWidth={2}
              />
            </View>
          </TouchableOpacity>

          <StatBox label="Free Margin" value={fmt(margin_free)} />
        </View>

        {/* ── Divider ── */}
        <View style={s.divider} />

        {/* ── Footer: Trading toggle + icon buttons ── */}
        <View style={s.footer}>
          <View style={s.tradingRow}>
            <Text style={s.tradingLabel}>Trading</Text>
            <Toggle value={!!grpbr_trading_flag} onChange={handleTrading} />
          </View>

          <View style={s.iconGrp}>
            {/* Delete */}
            <TouchableOpacity
              style={[s.iconBtn, s.iconRed]}
              onPress={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Icon
                  name="trash"
                  size={15}
                  color={colors.error}
                  strokeWidth={1.8}
                />
              )}
            </TouchableOpacity>

            {/* Refresh */}
            <TouchableOpacity
              style={[s.iconBtn, s.iconPurple]}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="#8B5CF6" />
              ) : (
                <Icon
                  name="refresh"
                  size={15}
                  color="#8B5CF6"
                  strokeWidth={1.8}
                />
              )}
            </TouchableOpacity>

            {/* Eye → AccountDetail */}
            <TouchableOpacity
              style={[s.iconBtn, s.iconGreen]}
              onPress={() =>
                navigation?.navigate('AccountDetail', { account: item })
              }
            >
              <Icon
                name="eye"
                size={15}
                color={colors.primary}
                strokeWidth={1.8}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Multiplier Modal ── */}
      <MultiplierModal
        visible={showMult}
        item={item}
        onClose={() => setShowMult(false)}
        onSaved={handleMultSaved}
      />
    </>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },

  // Name
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
    flexShrink: 0,
  },
  name: {
    fontSize: typography.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },

  // Badges
  badgeRow: { flexDirection: 'row', gap: 5, marginBottom: spacing.sm },

  // Stats
  statsRow: { flexDirection: 'row', gap: 5, marginBottom: spacing.xs },

  // Multiplier box — tappable
  multBox: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderRadius: spacing.radius.sm,
    padding: spacing.xs + 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.2)',
  },
  multLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  multValueRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  multValue: {
    fontSize: typography.sm,
    fontWeight: '700',
    color: colors.primary,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tradingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  tradingLabel: { fontSize: typography.sm, color: colors.textSecondary },
  iconGrp: { flexDirection: 'row', gap: 5 },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRed: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  iconPurple: {
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
  },
  iconGreen: {
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.25)',
  },
});
