import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import Badge from '../common/Badge';
import StatBox from '../common/StatBox';
import Toggle from '../common/Toggle';
import Icon from '../common/Icon';
import ReconnectModal from './ReconnectModal';
import ExtendSubscriptionModal from './ExtendSubscriptionModal';
import AccountKeyModal from './AccountKeyModal';
import DaySlTpModal from './DaySlTpModal';
import { accountStyles } from '../../styles/accounts.styles';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function AccountCard({
  item,
  navigation,
  onToggleTrading,
  onToggleSlTp,
  onToggleAutoRenew,
  onRefresh,
  onDelete,
  onReloadList,
}) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [showReconnect, setShowReconnect] = useState(false);
  const [showExtend, setShowExtend] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showDaySlTp, setShowDaySlTp] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const {
    broker_id,
    broker_combine_name,
    nic_name,
    is_connected,
    main_trading_flag,
    is_sl_tp_set,
    auto_renew,
    end_date,
    group_involve_count,
    day_sl = 0,
    day_tp = 0,
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
        year: '2-digit',
      })
    : '—';

  // ── Trading toggle — confirmation first ───────────────────────
  const handleTradingPress = () => {
    Alert.alert(
      'Confirm Trading Status Change',
      'Are you sure you want to change the trading status for this account?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => onToggleTrading(broker_id, main_trading_flag),
        },
      ],
    );
  };

  // ── Auto Renew toggle — confirmation first ────────────────────
  const handleAutoRenewPress = () => {
    const action = auto_renew ? 'disable' : 'enable';
    Alert.alert(
      'Confirm Auto Renew',
      `Are you sure you want to ${action} auto renew of this account subscription?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => onToggleAutoRenew(broker_id, auto_renew),
        },
      ],
    );
  };

  // ── Day SL/TP toggle ──────────────────────────────────────────
  const handleDaySlTpPress = () => {
    if (!is_sl_tp_set) {
      setShowDaySlTp(true);
    } else {
      Alert.alert(
        'Disable Day SL/TP',
        'Are you sure you want to disable Day SL/TP for this account?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', onPress: () => onToggleSlTp(broker_id, is_sl_tp_set) },
        ],
      );
    }
  };

  const menuOptions = [
    {
      icon: 'plug',
      label: 'Reconnect Account',
      color: colors.textPrimary,
      onPress: () => {
        setMenuVisible(false);
        setShowReconnect(true);
      },
    },
    {
      icon: 'calendar',
      label: 'Extend Subscription',
      color: colors.textPrimary,
      onPress: () => {
        setMenuVisible(false);
        setShowExtend(true);
      },
    },
    {
      icon: 'key',
      label: 'Account Key',
      color: colors.textPrimary,
      onPress: () => {
        setMenuVisible(false);
        setShowKey(true);
      },
    },
    {
      icon: 'trash',
      label: 'Delete',
      color: colors.error,
      onPress: () => {
        setMenuVisible(false);
        onDelete(broker_id, nic_name || broker_combine_name);
      },
    },
  ];

  return (
    <>
      <View style={accountStyles.card}>
        {/* Name row */}
        <View style={accountStyles.nameRow}>
          <View
            style={[
              accountStyles.dot,
              {
                backgroundColor: is_connected
                  ? colors.primary
                  : colors.textMuted,
              },
            ]}
          />
          <Text style={accountStyles.accountName} numberOfLines={1}>
            {broker_combine_name || nic_name || 'Account'}
          </Text>
        </View>

        {/* Badges */}
        <View style={accountStyles.badgeRow}>
          <Badge
            label={`${Number(balance).toLocaleString()}-${currency}`}
            variant="green"
          />
          <Badge label={`1:${leverage}`} variant="gray" />
        </View>

        {/* Stats row 1 */}
        <View style={accountStyles.statsRow}>
          <StatBox label="Equity" value={Number(equity)} />
          <StatBox label="POS" value={positions_count} />
          <StatBox label="Pending" value={orders_count} />
          <StatBox
            label="P&L"
            value={Number(floating_profit).toFixed(4)}
            green={floating_profit > 0}
            red={floating_profit < 0}
          />
        </View>

        {/* Stats row 2 */}
        <View style={accountStyles.statsRow}>
          <StatBox label="Expiry" value={expiryDate} />
          <StatBox label="In Group" value={group_involve_count} />
          <StatBox
            label="Free Margin"
            value={Number(margin_free)}
            flex={2}
          />
        </View>

        <View style={accountStyles.divider} />

        {/* ── Toggle row 1: Day SL/TP + SL/TP values ── */}
        <View style={s.slTpRow}>
          <View style={accountStyles.toggleItem}>
            <TouchableOpacity
              onPress={() => setShowTooltip(v => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon
                name="info"
                size={14}
                color={colors.primary}
                strokeWidth={1.8}
              />
            </TouchableOpacity>
            <Text style={[accountStyles.toggleLabel, { marginLeft: 3 }]}>
              Day SL/TP
            </Text>
            <Toggle value={!!is_sl_tp_set} onChange={handleDaySlTpPress} />
          </View>
          {is_sl_tp_set && (
            <View style={s.slTpValues}>
              <TouchableOpacity
                style={s.slTpChip}
                onPress={() => setShowDaySlTp(true)}
              >
                <Text style={s.slTpLabel}>SL:</Text>
                <Text style={s.slTpValue}>
                  {Number(day_sl).toLocaleString()}
                </Text>
                <Icon
                  name="settings"
                  size={11}
                  color="#8B5CF6"
                  strokeWidth={1.8}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={s.slTpChip}
                onPress={() => setShowDaySlTp(true)}
              >
                <Text style={s.slTpLabel}>TP:</Text>
                <Text style={s.slTpValue}>
                  {Number(day_tp).toLocaleString()}
                </Text>
                <Icon
                  name="settings"
                  size={11}
                  color="#8B5CF6"
                  strokeWidth={1.8}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tooltip */}
        {showTooltip && (
          <TouchableOpacity
            style={s.tooltipWrap}
            activeOpacity={1}
            onPress={() => setShowTooltip(false)}
          >
            <Text style={s.tooltipTxt}>
              When Day SL/TP is ON, if the stop-loss or take-profit is hit, no
              further trades will be allowed on this account for the rest of the
              day. To continue trading, turn Day SL/TP OFF.
            </Text>
          </TouchableOpacity>
        )}

        {/* ── Toggle row 2: Trading + Auto Renew + icons ── */}
        <View style={accountStyles.bottomRow}>
          <View style={s.togglesRow}>
            <View style={accountStyles.toggleItem}>
              <Text style={accountStyles.toggleLabel}>Trading</Text>
              <Toggle
                value={!!main_trading_flag}
                onChange={handleTradingPress}
              />
            </View>
            <View style={accountStyles.toggleItem}>
              <Text style={accountStyles.toggleLabel}>Auto Renew</Text>
              <Toggle value={!!auto_renew} onChange={handleAutoRenewPress} />
            </View>
          </View>

          <View style={accountStyles.iconGroup}>
            <TouchableOpacity
              style={[accountStyles.iconBtn, s.iconPurple]}
              onPress={() => onRefresh(broker_id)}
            >
              <Icon
                name="refresh"
                size={15}
                color="#8B5CF6"
                strokeWidth={1.8}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[accountStyles.iconBtn, accountStyles.iconBtnGreen]}
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
            <TouchableOpacity
              style={[accountStyles.iconBtn, s.iconPurple]}
              onPress={() => setMenuVisible(true)}
            >
              <Icon
                name="more-vertical"
                size={15}
                color="#8B5CF6"
                strokeWidth={1.8}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 3-dot Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={menuS.backdrop}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={menuS.menu}>
            <Text style={menuS.menuTitle} numberOfLines={1}>
              {nic_name || broker_combine_name}
            </Text>
            <View style={menuS.divider} />
            {menuOptions.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  menuS.menuItem,
                  i === menuOptions.length - 1 && menuS.menuItemLast,
                ]}
                onPress={opt.onPress}
              >
                <Icon
                  name={opt.icon}
                  size={18}
                  color={opt.color}
                  strokeWidth={1.6}
                />
                <Text style={[menuS.menuItemText, { color: opt.color }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <ReconnectModal
        visible={showReconnect}
        item={item}
        onClose={r => {
          setShowReconnect(false);
          if (r) onReloadList?.();
        }}
      />
      <ExtendSubscriptionModal
        visible={showExtend}
        item={item}
        onClose={r => {
          setShowExtend(false);
          if (r) onReloadList?.();
        }}
      />
      <AccountKeyModal
        visible={showKey}
        item={item}
        onClose={() => setShowKey(false)}
      />
      <DaySlTpModal
        visible={showDaySlTp}
        item={item}
        onClose={r => {
          setShowDaySlTp(false);
          if (r) onReloadList?.();
        }}
      />
    </>
  );
}

const s = StyleSheet.create({
  slTpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  slTpValues: { flexDirection: 'row', gap: spacing.xs },
  slTpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 3,
  },
  slTpLabel: { fontSize: typography.xs, color: colors.textSecondary },
  slTpValue: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  togglesRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconPurple: {
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderColor: 'rgba(139,92,246,0.3)',
  },
  tooltipWrap: {
    backgroundColor: '#1a2235',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  tooltipTxt: {
    fontSize: 12,
    color: '#c8d6e8',
    lineHeight: 18,
    textAlign: 'center',
  },
});

const menuS = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  menu: {
    backgroundColor: colors.bgCard,
    borderRadius: spacing.radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    overflow: 'hidden',
  },
  menuTitle: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    textAlign: 'center',
  },
  divider: { height: 1, backgroundColor: colors.border },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuItemText: { fontSize: typography.md, fontWeight: typography.medium },
});
