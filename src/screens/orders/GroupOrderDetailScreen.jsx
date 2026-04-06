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
import UserOrderCard from '../../components/orders/UserOrderCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getUserOrders } from '../../services/orderService';
import { exportToCSV } from '../../utils/exportUtils';
import { useAlert } from '../../components/common/AlertContext';

export default function GroupOrderDetailScreen({ route, navigation }) {
  const { group } = route.params;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sFocused, setSFocused] = useState(false);
  const { showAlert } = useAlert();

  const groupId = group?.group_order_id ?? group?.id;
  const groupName = group?.group_name ?? group?.name ?? `Group #${groupId}`;
  const symbol = group?.symbol ?? '—';
  const volume = group?.volume ?? '—';
  const isBuy =
    String(group?.type ?? '').toUpperCase() === 'BUY' || group?.type === 0;

  const fetchOrders = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        const res = await getUserOrders(groupId);
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.orders)
          ? res.orders
          : Array.isArray(res)
          ? res
          : [];
        setOrders(list);
      } catch (e) {
        showAlert('Error', e?.msg || 'Failed to load orders.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [groupId],
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Dynamic search — matches any field value
  const filtered = search.trim()
    ? orders.filter(item =>
        Object.values(item || {}).some(v =>
          String(v ?? '')
            .toLowerCase()
            .includes(search.toLowerCase()),
        ),
      )
    : orders;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <AppHeader />

      {/* ── Banner ── */}
      <View style={s.banner}>
        <View style={s.bannerTop}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Icon
              name="arrow-left"
              size={16}
              color={colors.primaryText}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
          <Text style={s.bannerName} numberOfLines={1}>
            {groupName}
          </Text>
        </View>

        <View style={s.bannerStats}>
          <View style={s.chip}>
            <Text style={s.chipVal}>{symbol}</Text>
            <Text style={s.chipLabel}>Symbol</Text>
          </View>
          <View style={s.chip}>
            <Text style={s.chipVal}>{volume}</Text>
            <Text style={s.chipLabel}>Volume</Text>
          </View>
          {group?.type !== undefined && group?.type !== null && (
            <View style={isBuy ? s.buy : s.sell}>
              <Text style={isBuy ? s.buyTxt : s.sellTxt}>
                {isBuy ? 'BUY' : 'SELL'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Toolbar ── */}
      <View style={s.toolbar}>
        <TouchableOpacity
          style={s.exportBtn}
          onPress={() => exportToCSV(filtered, 'orders')}
        >
          <Icon
            name="download"
            size={13}
            color={colors.primary}
            strokeWidth={2}
          />
          <Text style={s.exportTxt}>Export</Text>
        </TouchableOpacity>
        <View style={[s.searchBox, sFocused && s.searchFocused]}>
          <Icon
            name="search"
            size={13}
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
        <TouchableOpacity
          style={s.refreshBtn}
          onPress={() => fetchOrders(true)}
        >
          <Icon
            name="refresh"
            size={15}
            color={colors.textSecondary}
            strokeWidth={1.8}
          />
        </TouchableOpacity>
      </View>

      {/* ── List ── */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => String(item?.ticket || item?.id || i)}
          renderItem={({ item, index }) => (
            <UserOrderCard item={item} index={index} />
          )}
          contentContainerStyle={{
            paddingHorizontal: spacing.base,
            paddingVertical: spacing.sm + 2,
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
                {search
                  ? 'No results match your search.'
                  : 'No orders in this group.'}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchOrders(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: spacing.radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.base,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: spacing.radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerName: {
    fontSize: typography.base,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bannerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: { alignItems: 'center' },
  chipVal: {
    fontSize: typography.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chipLabel: { fontSize: typography.xs, color: colors.textSecondary },
  buy: {
    backgroundColor: 'rgba(74,222,128,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  sell: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  buyTxt: { fontSize: typography.sm, fontWeight: '700', color: colors.primary },
  sellTxt: { fontSize: typography.sm, fontWeight: '700', color: colors.error },
  refreshBtn: {
    width: 36,
    height: 36,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    marginBlock: spacing.sm,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 1,
    height: 36,
  },
  exportTxt: {
    fontSize: typography.xs + 1,
    color: colors.primary,
    fontWeight: '600',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.sm,
    height: 36,
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
