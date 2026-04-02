import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AppHeader from '../../components/common/AppHeader';
import Icon from '../../components/common/Icon';
import GroupOrderCard from '../../components/orders/GroupOrderCard';
import IndividualOrderCard from '../../components/orders/IndividualOrderCard';
import OrderDetailsTab from './tabs/OrderDetailsTab';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import {
  getGroupOrderHistory,
  getIndividualOrderHistory,
} from '../../services/orderService';

const TABS = ['Group Orders', 'Individual Orders', 'Order Details'];

const TYPE_MAP = {
  0: 'buy',
  1: 'sell',
  2: 'buy limit',
  3: 'sell limit',
  4: 'buy stop',
  5: 'sell stop',
};

const matchesSearch = (item, q) => {
  if (!q.trim()) return true;
  const lower = q.toLowerCase();
  return Object.entries(item || {}).some(([key, v]) => {
    if (key === 'type') return (TYPE_MAP[v] ?? '').includes(lower);
    return String(v ?? '')
      .toLowerCase()
      .includes(lower);
  });
};

const parseList = res =>
  Array.isArray(res?.data)
    ? res.data
    : Array.isArray(res?.orders)
    ? res.orders
    : Array.isArray(res)
    ? res
    : [];

// Maps numeric codes to searchable text

export default function OrdersScreen({ navigation }) {
  const [tab, setTab] = useState(0);
  const [groupOrders, setGroupOrders] = useState([]);
  const [indivOrders, setIndivOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sFocused, setSFocused] = useState(false);

  const fetchAll = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const [gRes, iRes] = await Promise.all([
        getGroupOrderHistory(0, 50),
        getIndividualOrderHistory(0, 50),
      ]);
      setGroupOrders(parseList(gRes));
      setIndivOrders(parseList(iRes));
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

  const handleTabChange = i => {
    setTab(i);
    setSearch('');
  };
  const handleViewGroup = group =>
    navigation.navigate('GroupOrderDetail', { group });

  const rawData = tab === 0 ? groupOrders : indivOrders;
  const data = rawData.filter(item => matchesSearch(item, search));
  const emptyMsg = search
    ? 'No results match your search.'
    : tab === 0
    ? 'No group orders found.'
    : 'No individual orders found.';

  const renderItem = ({ item, index }) =>
    tab === 0 ? (
      <GroupOrderCard item={item} index={index} onView={handleViewGroup} />
    ) : (
      <IndividualOrderCard item={item} index={index} />
    );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <AppHeader />

      {/* Tabs */}
      <View style={s.tabBar}>
        {TABS.map((t, i) => (
          <TouchableOpacity
            key={t}
            style={[s.tabBtn, tab === i && s.tabActive]}
            onPress={() => handleTabChange(i)}
          >
            <Text
              style={[s.tabTxt, tab === i && s.tabTxtActive]}
              numberOfLines={1}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab 3 — Order Details (separate file) */}
      {tab === 2 ? (
        <OrderDetailsTab />
      ) : (
        <>
          {/* Search — tab 0 and 1 only */}
          <View style={s.searchRow}>
            <View style={[s.searchBox, sFocused && s.searchFocused]}>
              <Icon
                name="search"
                size={14}
                color={sFocused ? colors.primary : colors.textMuted}
                strokeWidth={1.8}
              />
              <TextInput
                style={s.searchInput}
                placeholder="Search by any field..."
                placeholderTextColor={colors.textPlaceholder}
                value={search}
                onChangeText={setSearch}
                onFocus={() => setSFocused(true)}
                onBlur={() => setSFocused(false)}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Icon
                    name="x"
                    size={13}
                    color={colors.textMuted}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {loading ? (
            <View style={s.center}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={data}
              keyExtractor={(item, i) =>
                String(item?.group_order_id || item?.ticket || item?.id || i)
              }
              renderItem={renderItem}
              contentContainerStyle={{
                paddingHorizontal: spacing.base,
                paddingVertical: spacing.sm + 2,
              }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={s.center}>
                  <Icon
                    name="orders"
                    size={40}
                    color={colors.textMuted}
                    strokeWidth={1}
                  />
                  <Text style={s.emptyTxt}>{emptyMsg}</Text>
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
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.base,
    marginBlock: spacing.sm + 2,
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
  searchRow: { paddingHorizontal: spacing.base, marginBottom: spacing.sm },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    height: 38,
  },
  searchFocused: { borderColor: colors.primary },
  searchInput: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.textPrimary,
    padding: 0,
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
