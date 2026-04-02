import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Badge from '../common/Badge';
import StatBox from '../common/StatBox';
import Toggle from '../common/Toggle';
import Icon from '../common/Icon';
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
          <StatBox label="Equity" value={Number(equity).toFixed(2)} />
          <StatBox label="POS" value={positions_count} />
          <StatBox label="Pending" value={orders_count} />
          <StatBox
            label="P&L"
            value={Number(floating_profit).toFixed(2)}
            green={floating_profit > 0}
            red={floating_profit < 0}
          />
        </View>

        {/* Stats row 2 */}
        <View style={accountStyles.statsRow}>
          <StatBox label="Expiry" value={expiryDate} />
          <StatBox label="Multiplier" value={1} />
          <StatBox
            label="Free Margin"
            value={Number(margin_free).toFixed(2)}
            flex={2}
          />
        </View>

        <View style={accountStyles.divider} />
        <View style={accountStyles.bottomRow}>
          <View style={s.togglesRow}>
            <View style={accountStyles.toggleItem}>
              <Text style={accountStyles.toggleLabel}>Trading</Text>
              <Toggle
                value={!!main_trading_flag}
                onChange={handleTradingPress}
              />
            </View>
          </View>

          <View style={accountStyles.iconGroup}>
            <TouchableOpacity
              style={[accountStyles.iconBtn, s.iconRed]}
              onPress={() => onRefresh(broker_id)}
            >
              <Icon
                name="trash"
                size={15}
                color={colors.error}
                strokeWidth={1.8}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[accountStyles.iconBtn, s.iconPurple]}
              onPress={() => setMenuVisible(true)}
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
          </View>
        </View>
      </View>
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
  iconRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  iconPurple: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
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
