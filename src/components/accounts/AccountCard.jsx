import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Badge from '../common/Badge';
import StatBox from '../common/StatBox';
import Toggle from '../common/Toggle';
import { accountStyles } from '../../styles/accounts.styles';
import { colors } from '../../theme/colors';

export default function AccountCard({
  item,
  onToggleTrading,
  onToggleSlTp,
  onRefresh,
  onDelete,
}) {
  // ── Exact field names from API ──────────────────────────────
  const {
    broker_id,
    nic_name,
    broker_combine_name,
    is_connected,
    main_trading_flag,
    is_sl_tp_set,
    auto_renew,
    end_date,
    group_involve_count,
    account_info,
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
  } = account_info || {};

  const expiryDate = end_date
    ? new Date(end_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
      })
    : '—';

  const dotColor = is_connected ? colors.primary : colors.textMuted;

  // ── More options ─────────────────────────────────────────────
  const handleMore = () => {
    Alert.alert(nic_name || 'Account', 'Choose an action', [
      {
        text: 'Delete Account',
        style: 'destructive',
        onPress: () => onDelete(broker_id),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={accountStyles.card}>
      {/* ── Name row ── */}
      <View style={accountStyles.nameRow}>
        <View style={[accountStyles.dot, { backgroundColor: dotColor }]} />
        <Text style={accountStyles.accountName} numberOfLines={1}>
          {broker_combine_name || nic_name || 'Account'}
        </Text>
        <TouchableOpacity style={accountStyles.moreBtn} onPress={handleMore}>
          <Text style={accountStyles.moreIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* ── Badges ── */}
      <View style={accountStyles.badgeRow}>
        <Badge
          label={`${balance.toLocaleString()}-${currency}`}
          variant="green"
        />
        <Badge label={`1:${leverage}`} variant="gray" />
      </View>

      {/* ── Stats row 1: Equity / POS / Pending / P&L ── */}
      <View style={accountStyles.statsRow}>
        <StatBox label="Equity" value={equity.toLocaleString()} />
        <StatBox label="POS" value={positions_count} />
        <StatBox label="Pending" value={orders_count} />
        <StatBox
          label="P&L"
          value={floating_profit}
          green={floating_profit > 0}
          red={floating_profit < 0}
        />
      </View>

      {/* ── Stats row 2: Expiry / In Group / Free Margin ── */}
      <View style={accountStyles.statsRow}>
        <StatBox label="Expiry" value={expiryDate} />
        <StatBox label="In Group" value={group_involve_count} />
        <StatBox
          label="Free Margin"
          value={margin_free.toLocaleString()}
          flex={2}
        />
      </View>

      <View style={accountStyles.divider} />

      {/* ── Bottom: Toggles + Actions ── */}
      <View style={accountStyles.bottomRow}>
        {/* Toggles */}
        <View style={accountStyles.togglesWrap}>
          <View style={accountStyles.toggleItem}>
            <Text style={accountStyles.toggleLabel}>Day SL/TP</Text>
            <Toggle
              value={is_sl_tp_set}
              onChange={() => onToggleSlTp(broker_id, is_sl_tp_set)}
            />
          </View>
          <View style={accountStyles.toggleItem}>
            <Text style={accountStyles.toggleLabel}>Trading</Text>
            <Toggle
              value={main_trading_flag}
              onChange={() => onToggleTrading(broker_id, main_trading_flag)}
            />
          </View>
        </View>

        {/* Action icons */}
        <View style={accountStyles.iconGroup}>
          <TouchableOpacity
            style={accountStyles.iconBtn}
            onPress={() => onRefresh(broker_id)}
          >
            <Text style={accountStyles.iconTxt}>↻</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[accountStyles.iconBtn, accountStyles.iconBtnGreen]}
          >
            <Text style={[accountStyles.iconTxt, { color: colors.primary }]}>
              👁
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[accountStyles.iconBtn, accountStyles.iconBtnRed]}
            onPress={() => onDelete(broker_id)}
          >
            <Text style={[accountStyles.iconTxt, { color: colors.error }]}>
              🗑
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
