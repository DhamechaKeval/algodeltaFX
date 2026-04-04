import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from '../common/Icon';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { formatDateTime } from './../../utils/date';
import {
  getChildPositions,
  getChildPendingOrders,
} from '../../services/copyTradeService';

const TABS = ['Positions', 'Pending Orders'];

function OrderRow({ item, index }) {
  const isBuy =
    String(item?.type ?? '').toUpperCase() === 'BUY' || item?.type === 0;
  const pnl = Number(item?.profit ?? item?.pnl ?? 0);
  return (
    <View style={s.row}>
      <View style={s.rowHeader}>
        <Text style={s.symbol}>{item?.symbol || '—'}</Text>
        <Text style={s.ticket}>#{item?.ticket || item?.id || '—'}</Text>
        <View style={isBuy ? s.buy : s.sell}>
          <Text style={isBuy ? s.buyTxt : s.sellTxt}>
            {isBuy ? 'BUY' : 'SELL'}
          </Text>
        </View>
        {pnl !== 0 && (
          <Text
            style={[s.pnl, { color: pnl > 0 ? colors.primary : colors.error }]}
          >
            {pnl > 0 ? '+' : ''}
            {pnl}
          </Text>
        )}
      </View>
      <View style={s.rowStats}>
        {[
          ['Vol', item?.volume],
          ['Price', item?.price_open ?? item?.price],
          ['SL', item?.sl ?? 0],
          ['TP', item?.tp ?? 0],
        ].map(([label, val]) => (
          <View key={label} style={s.statMini}>
            <Text style={s.statMiniLabel}>{label}</Text>
            <Text style={s.statMiniVal}>{val ?? '—'}</Text>
          </View>
        ))}
      </View>
      {item?.create_time && (
        <Text style={s.rowTime}>{formatDateTime(item?.create_time)}</Text>
      )}
    </View>
  );
}

export default function ChildOrdersModal({ visible, groupId, child, onClose }) {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const brokerId = child?.broker_id;
  const childName = child?.broker_name ?? child?.nic_name ?? 'Child Account';

  useEffect(() => {
    if (!visible || !brokerId) return;
    setLoading(true);
    setData([]);
    const fn = tab === 0 ? getChildPositions : getChildPendingOrders;
    fn(groupId, brokerId)
      .then(res => {
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.orders)
          ? res.orders
          : Array.isArray(res)
          ? res
          : [];
        setData(list);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [visible, tab, brokerId, groupId]);

  const handleTabChange = i => {
    setTab(i);
    setData([]);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={onClose}>
            <Icon
              name="arrow-left"
              size={16}
              color={colors.primaryText}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
          <Text style={s.title} numberOfLines={1}>
            {childName}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Tabs */}
        <View style={s.tabBar}>
          {TABS.map((t, i) => (
            <TouchableOpacity
              key={t}
              style={[s.tabBtn, tab === i && s.tabActive]}
              onPress={() => handleTabChange(i)}
            >
              <Text style={[s.tabTxt, tab === i && s.tabTxtActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {loading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item, i) => String(item?.ticket || item?.id || i)}
            renderItem={({ item, index }) => (
              <OrderRow item={item} index={index} />
            )}
            contentContainerStyle={{
              padding: spacing.base,
              paddingBottom: spacing.xxl,
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={s.center}>
                <Icon
                  name="orders"
                  size={36}
                  color={colors.textMuted}
                  strokeWidth={1}
                />
                <Text style={s.emptyTxt}>
                  {tab === 0 ? 'No open positions.' : 'No pending orders.'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: spacing.radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    marginHorizontal: spacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
    backgroundColor: colors.bgCard,
    borderRadius: spacing.radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    borderRadius: spacing.radius.sm,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.primary },
  tabTxt: {
    fontSize: typography.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTxtActive: { color: colors.primaryText, fontWeight: '700' },

  // Row
  row: {
    backgroundColor: colors.bgCard,
    borderRadius: spacing.radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  symbol: {
    fontSize: typography.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ticket: { fontSize: typography.xs, color: colors.textMuted },
  buy: {
    backgroundColor: 'rgba(74,222,128,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  sell: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  buyTxt: { fontSize: typography.xs, fontWeight: '700', color: colors.primary },
  sellTxt: { fontSize: typography.xs, fontWeight: '700', color: colors.error },
  pnl: { fontSize: typography.xs + 1, fontWeight: '700', marginLeft: 'auto' },
  rowStats: { flexDirection: 'row', gap: spacing.xs },
  statMini: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderRadius: spacing.radius.sm,
    padding: spacing.xs + 1,
    alignItems: 'center',
  },
  statMiniLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: 1,
  },
  statMiniVal: {
    fontSize: typography.xs + 1,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rowTime: {
    fontSize: typography.xs - 1,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'right',
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl * 2,
  },
  emptyTxt: {
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontSize: typography.md,
  },
});
