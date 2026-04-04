import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from '../../../components/common/Icon';
import IndividualOrderCard from '../../../components/orders/IndividualOrderCard';
import EmptyState from './shared/OrderEmptyState';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { getIndividualOrderHistory } from '../../../services/orderService';
import { useAlert } from '../../../components/common/AlertContext ';

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

export default function IndividualOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sFocused, setSFocused] = useState(false);
  const { showAlert } = useAlert();

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await getIndividualOrderHistory(0, 50);
      setOrders(parseList(res));
    } catch (e) {
      showAlert('Error', e?.message || 'Failed to load individual orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const data = orders.filter(item => matchesSearch(item, search));

  return (
    <View style={s.container}>
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
        <EmptyState loading />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, i) => String(item?.ticket || item?.id || i)}
          renderItem={({ item, index }) => (
            <IndividualOrderCard item={item} index={index} />
          )}
          contentContainerStyle={{
            paddingHorizontal: spacing.base,
            paddingVertical: spacing.sm + 2,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              message={
                search
                  ? 'No results match your search.'
                  : 'No individual orders found.'
              }
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchData(true)}
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
  container: { flex: 1 },
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
});
