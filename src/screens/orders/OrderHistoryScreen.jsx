import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import AppHeader from '../../components/common/AppHeader';
import Icon from '../../components/common/Icon';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import {
  getGroupOrderHistory,
  getUserOrders,
  getIndividualOrderHistory,
  getOrdersHistory,
} from '../../services/orderService';

// ── Helpers ───────────────────────────────────────────────────────
const parseList = res =>
  Array.isArray(res?.data)
    ? res.data
    : Array.isArray(res?.orders)
    ? res.orders
    : Array.isArray(res)
    ? res
    : [];

const BuySellBadge = ({ type }) => {
  const t = String(type ?? '').toUpperCase();
  const isBuy = t === 'BUY' || t === '0';
  return (
    <View style={isBuy ? cs.buy : cs.sell}>
      <Text style={isBuy ? cs.buyTxt : cs.sellTxt}>
        {isBuy ? 'BUY' : 'SELL'}
      </Text>
    </View>
  );
};

const StatBox = ({ label, value, green, red }) => (
  <View style={cs.statBox}>
    <Text style={cs.statLabel}>{label}</Text>
    <Text
      style={[
        cs.statVal,
        green && { color: colors.primary },
        red && { color: colors.error },
      ]}
    >
      {value ?? '—'}
    </Text>
  </View>
);

// ── Group Order Card ──────────────────────────────────────────────
function GroupOrderCard({ item, onViewOrders }) {
  const pnl = item?.total_profit ?? item?.pnl ?? item?.profit ?? 0;
  return (
    <View style={cs.card}>
      <View style={cs.cardRow}>
        <View style={{ flex: 1 }}>
          <Text style={cs.cardTitle}>
            Group #{item?.group_order_id ?? item?.id ?? '—'}
          </Text>
          <Text style={cs.cardSub}>
            {item?.create_time || item?.created_at || '—'}
          </Text>
        </View>
        <Text
          style={[
            cs.pnl,
            pnl >= 0 ? { color: colors.primary } : { color: colors.error },
          ]}
        >
          {pnl >= 0 ? '+' : ''}
          {pnl}
        </Text>
      </View>
      <View style={cs.statsRow}>
        <StatBox label="Symbol" value={item?.symbol} />
        <StatBox
          label="Orders"
          value={item?.order_count ?? item?.total_orders}
        />
        <StatBox label="Volume" value={item?.total_volume ?? item?.volume} />
        <StatBox
          label="Accounts"
          value={item?.broker_count ?? item?.accounts}
        />
      </View>
      <TouchableOpacity style={cs.eyeBtn} onPress={() => onViewOrders(item)}>
        <Icon name="eye" size={14} color={colors.primary} strokeWidth={2} />
        <Text style={cs.eyeBtnTxt}>View Orders</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Individual Order Card ─────────────────────────────────────────
function IndividualOrderCard({ item }) {
  const pnl = item?.profit ?? item?.pnl ?? 0;
  return (
    <View style={cs.card}>
      <View style={cs.cardRow}>
        <View style={{ flex: 1 }}>
          <Text style={cs.cardTitle}>{item?.symbol || '—'}</Text>
          <Text style={cs.cardSub}>
            #{item?.ticket || item?.order_id || item?.id || '—'}
          </Text>
        </View>
        <BuySellBadge type={item?.type} />
      </View>
      <View style={cs.statsRow}>
        <StatBox label="Volume" value={item?.volume} />
        <StatBox label="Price($)" value={item?.price_open ?? item?.price} />
        <StatBox label="P&L" value={pnl} green={pnl > 0} red={pnl < 0} />
        <StatBox label="SL" value={item?.sl ?? 0} />
      </View>
      <View style={cs.statsRow}>
        <StatBox label="TP" value={item?.tp ?? 0} />
        <StatBox label="Account" value={item?.broker_name ?? item?.nic_name} />
        <StatBox label="Time" value={item?.create_time || item?.time} />
      </View>
    </View>
  );
}

// ── Order Detail Card ─────────────────────────────────────────────
function OrderDetailCard({ item }) {
  const pnl = item?.profit ?? item?.pnl ?? 0;
  return (
    <View style={cs.card}>
      <View style={cs.cardRow}>
        <View style={{ flex: 1 }}>
          <Text style={cs.cardTitle}>{item?.symbol || '—'}</Text>
          <Text style={cs.cardSub}>
            #{item?.ticket || item?.order_id || item?.id || '—'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <BuySellBadge type={item?.type} />
          <Text
            style={[
              cs.pnlSm,
              pnl >= 0 ? { color: colors.primary } : { color: colors.error },
            ]}
          >
            {pnl >= 0 ? '+' : ''}
            {pnl}
          </Text>
        </View>
      </View>
      <View style={cs.statsRow}>
        <StatBox label="Volume" value={item?.volume} />
        <StatBox label="Open" value={item?.price_open ?? item?.open_price} />
        <StatBox label="Close" value={item?.price_close ?? item?.close_price} />
        <StatBox label="SL" value={item?.sl ?? 0} />
      </View>
      <View style={cs.statsRow}>
        <StatBox label="TP" value={item?.tp ?? 0} />
        <StatBox
          label="Open Time"
          value={item?.open_time || item?.create_time}
        />
        <StatBox label="Account" value={item?.nic_name ?? item?.broker_name} />
      </View>
    </View>
  );
}

// ── Group Orders Modal ────────────────────────────────────────────
function GroupOrdersModal({ visible, group, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible || !group) return;
    setLoading(true);
    getUserOrders(group?.group_order_id ?? group?.id)
      .then(res => setOrders(parseList(res)))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [visible, group]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={cs.modalHeader}>
          <TouchableOpacity style={cs.modalBack} onPress={onClose}>
            <Icon
              name="arrow-left"
              size={20}
              color={colors.textPrimary}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
          <Text style={cs.modalTitle}>
            Group #{group?.group_order_id ?? group?.id} Orders
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={cs.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : orders.length === 0 ? (
          <View style={cs.center}>
            <Icon
              name="orders"
              size={40}
              color={colors.textMuted}
              strokeWidth={1}
            />
            <Text style={cs.emptyTxt}>No orders in this group.</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item, i) => String(item?.ticket || item?.id || i)}
            renderItem={({ item }) => <IndividualOrderCard item={item} />}
            contentContainerStyle={{
              padding: spacing.base,
              paddingBottom: spacing.xxl,
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────
const TABS = ['Group Orders', 'Individual Orders', 'Order Details'];

export default function OrderHistoryScreen() {
  const [tab, setTab] = useState(0);
  const [groupOrders, setGroupOrders] = useState([]);
  const [indivOrders, setIndivOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);

  const fetchAll = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [gRes, iRes, dRes] = await Promise.all([
        getGroupOrderHistory(0, 20),
        getIndividualOrderHistory(0, 20),
        getOrdersHistory(0, 20),
      ]);
      setGroupOrders(parseList(gRes));
      setIndivOrders(parseList(iRes));
      setOrderDetails(parseList(dRes));
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleViewGroupOrders = group => {
    setSelectedGroup(group);
    setShowGroupModal(true);
  };

  const currentData =
    tab === 0 ? groupOrders : tab === 1 ? indivOrders : orderDetails;

  const renderCard = ({ item }) => {
    if (tab === 0)
      return (
        <GroupOrderCard item={item} onViewOrders={handleViewGroupOrders} />
      );
    if (tab === 1) return <IndividualOrderCard item={item} />;
    return <OrderDetailCard item={item} />;
  };

  const emptyMsg = [
    'No group orders found.',
    'No individual orders found.',
    'No order details found.',
  ][tab];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <AppHeader />

      {/* Title */}
      <View style={cs.titleRow}>
        <Text style={cs.pageTitle}>Orders</Text>
      </View>

      {/* Tabs */}
      <View style={cs.tabBar}>
        {TABS.map((t, i) => (
          <TouchableOpacity
            key={t}
            style={[cs.tabBtn, tab === i && cs.tabActive]}
            onPress={() => setTab(i)}
          >
            <Text
              style={[cs.tabTxt, tab === i && cs.tabTxtActive]}
              numberOfLines={1}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <View style={cs.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item, i) =>
            String(item?.group_order_id || item?.ticket || item?.id || i)
          }
          renderItem={renderCard}
          contentContainerStyle={{
            padding: spacing.base,
            paddingBottom: spacing.xxl,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={cs.center}>
              <Icon
                name="orders"
                size={40}
                color={colors.textMuted}
                strokeWidth={1}
              />
              <Text style={cs.emptyTxt}>{emptyMsg}</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchAll(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}

      {/* Group Orders Modal */}
      <GroupOrdersModal
        visible={showGroupModal}
        group={selectedGroup}
        onClose={() => {
          setShowGroupModal(false);
          setSelectedGroup(null);
        }}
      />
    </View>
  );
}

const cs = StyleSheet.create({
  // Page
  titleRow: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  pageTitle: {
    fontSize: typography.xl,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
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
    fontSize: typography.xs + 1,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTxtActive: { color: colors.primaryText, fontWeight: '700' },

  // Card
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: spacing.radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.base,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSub: { fontSize: typography.xs, color: colors.textMuted, marginTop: 2 },

  // Stats
  statsRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xs },
  statBox: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderRadius: spacing.radius.sm,
    padding: spacing.xs + 2,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statVal: {
    fontSize: typography.xs + 1,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  // P&L
  pnl: { fontSize: typography.base, fontWeight: '700' },
  pnlSm: { fontSize: typography.sm, fontWeight: '600' },

  // Buy/Sell badges
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
  buyTxt: {
    fontSize: typography.xs + 1,
    fontWeight: '700',
    color: colors.primary,
  },
  sellTxt: {
    fontSize: typography.xs + 1,
    fontWeight: '700',
    color: colors.error,
  },

  // Eye button
  eyeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.2)',
    borderRadius: spacing.radius.sm,
    paddingVertical: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  eyeBtnTxt: {
    fontSize: typography.xs + 1,
    fontWeight: '600',
    color: colors.primary,
  },

  // Modal
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalBack: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: typography.base,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },

  // Empty / loading
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
