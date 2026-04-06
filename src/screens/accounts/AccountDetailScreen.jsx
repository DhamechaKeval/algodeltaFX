import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  StyleSheet,
} from 'react-native';
import AppHeader from '../../components/common/AppHeader';
import Icon from '../../components/common/Icon';
import PlaceOrderModal from '../../components/accounts/PlaceOrderModal';
import EditOrderModal from '../../components/accounts/EditOrderModal';
import { detailStyles } from '../../styles/accountDetail.styles';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import {
  getPositions,
  getPendingOrders,
  squareOffAll,
  squareOffSingle,
  refreshAccount,
} from '../../services/accountService';
import { exportToCSV } from '../../utils/exportUtils';
import { PositionCard } from './../../components/accounts/PositionCard';
import { PendingCard } from './../../components/accounts/PendingCard';
import { useAlert } from '../../components/common/AlertContext';
import { useLoadingLock } from '../../context/LoadingLockContext';

// ── Main Screen ───────────────────────────────────────────────────
export default function AccountDetailScreen({ route, navigation }) {
  const { account } = route.params;
  const broker_id = account.broker_id;
  const { account_info = {} } = account;
  const { showAlert } = useAlert();

  const [tab, setTab] = useState('positions');
  const [positions, setPositions] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showOrder, setShowOrder] = useState(false);
  const [editPos, setEditPos] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const { withLock } = useLoadingLock();

  const freeMargin = account_info?.margin_free ?? 0;
  const pnl = account_info?.floating_profit ?? 0;

  const fetchData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        const [posRes, pendRes] = await Promise.all([
          getPositions(broker_id),
          getPendingOrders(broker_id),
        ]);
        setPositions(
          Array.isArray(posRes?.data)
            ? posRes.data
            : Array.isArray(posRes)
            ? posRes
            : [],
        );
        setPending(
          Array.isArray(pendRes?.data)
            ? pendRes.data
            : Array.isArray(pendRes)
            ? pendRes
            : [],
        );
      } catch (e) {
        showAlert('Error', e?.msg || 'Failed to load data.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [broker_id],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSquareOff = pos => {
    showAlert(
      'Close Position',
      `Close ${pos?.symbol} ${pos?.type === 0 ? 'BUY' : 'SELL'} (Vol: ${
        pos?.volume
      })?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Position',
          style: 'destructive',
          onPress: () =>
            withLock(async () => {
              try {
                const res = await squareOffSingle(
                  broker_id,
                  pos?.ticket || pos?.id,
                );
                if (res?.status === true) {
                  showAlert('Success', 'Position closed.');
                  fetchData(true);
                } else {
                  showAlert('Error', res?.msg || 'Failed.');
                }
              } catch (e) {
                showAlert('Error', e?.msg || 'Network error.');
              }
            }),
        },
      ],
    );
  };

  const handleSquareOffAll = () => {
    showAlert(
      'Confirm Square Off All',
      'Are you sure you want to square off all positions of this account?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () =>
            withLock(async () => {
              try {
                const res = await squareOffAll(broker_id);
                if (res?.status === true) {
                  showAlert('Success', 'All positions squared off.');
                  fetchData(true);
                } else {
                  showAlert('Error', res?.msg || 'Failed.');
                }
              } catch (e) {
                showAlert('Error', e?.msg || 'Network error.');
              }
            }),
        },
      ],
    );
  };

  const rawData = tab === 'positions' ? positions : pending;
  const data = search.trim()
    ? rawData.filter(i =>
        String(i?.symbol || '')
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : rawData;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <AppHeader />

      {/* Banner */}
      <View style={detailStyles.banner}>
        <View style={detailStyles.bannerTop}>
          <TouchableOpacity
            style={detailStyles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Icon
              name="arrow-left"
              size={16}
              color={colors.primaryText}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
          <Text style={detailStyles.bannerName} numberOfLines={1}>
            {account.broker_combine_name || account.nic_name}
          </Text>
        </View>
        <View style={detailStyles.bannerStats}>
          <View style={detailStyles.statChip}>
            <Text style={detailStyles.statValue}>
              {Number(freeMargin).toLocaleString()}
            </Text>
            <Text style={detailStyles.statLabel}>Free Margin</Text>
          </View>
          <View style={detailStyles.statChip}>
            <Text
              style={[
                detailStyles.statValue,
                pnl >= 0 ? detailStyles.pnlPositive : detailStyles.pnlNegative,
              ]}
            >
              {Number(pnl).toFixed(4)}
              {pnl < 0 ? ' ↓' : ''}
            </Text>
            <Text style={detailStyles.statLabel}>PnL</Text>
          </View>
          <View style={detailStyles.bannerActions}>
            <TouchableOpacity
              style={detailStyles.placeOrderBtn}
              onPress={() => setShowOrder(true)}
            >
              <Text style={detailStyles.placeOrderTxt}>Place Order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={detailStyles.actionIconBtn}
              onPress={() =>
                withLock(async () => {
                  try {
                    await refreshAccount(broker_id);
                  } catch {}
                  await fetchData(true);
                })
              }
            >
              <Icon
                name="refresh"
                size={15}
                color={colors.textSecondary}
                strokeWidth={1.8}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={detailStyles.tabWrap}>
        {['positions', 'pending'].map(t => (
          <TouchableOpacity
            key={t}
            style={[detailStyles.tabBtn, tab === t && detailStyles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text
              style={[
                detailStyles.tabTxt,
                tab === t && detailStyles.tabTxtActive,
              ]}
            >
              {t === 'positions' ? 'Position' : 'Pending Orders'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Toolbar */}
      <View style={detailStyles.toolbar}>
        <TouchableOpacity
          style={detailStyles.exportBtn}
          onPress={() => withLock(() => exportToCSV(data, tab))}
        >
          <Icon
            name="download"
            size={13}
            color={colors.primary}
            strokeWidth={2}
          />
          <Text style={detailStyles.exportTxt}>Export</Text>
        </TouchableOpacity>
        {tab === 'positions' && (
          <TouchableOpacity
            style={detailStyles.squareOffBtn}
            onPress={handleSquareOffAll}
          >
            <Icon name="x" size={13} color={colors.error} strokeWidth={2.5} />
            <Text style={detailStyles.squareOffTxt}>Square Off All</Text>
          </TouchableOpacity>
        )}

        {/* Search */}
        <View
          style={[
            s.searchBox,
            searchFocused && { borderColor: colors.primary },
          ]}
        >
          <Icon
            name="search"
            size={12}
            color={searchFocused ? colors.primary : colors.textMuted}
            strokeWidth={1.8}
          />
          <TextInput
            style={s.searchInput}
            placeholder="Search..."
            placeholderTextColor={colors.textPlaceholder}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </View>
        <TouchableOpacity
          style={detailStyles.refreshBtn}
          onPress={() => fetchData(true)}
        >
          <Icon name="refresh" size={15} color="#8B5CF6" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, i) => String(item?.ticket || item?.id || i)}
          ListEmptyComponent={
            <View
              style={{ alignItems: 'center', paddingVertical: spacing.xxl }}
            >
              <Icon
                name="orders"
                size={36}
                color={colors.textMuted}
                strokeWidth={1}
              />
              <Text
                style={{ color: colors.textSecondary, marginTop: spacing.md }}
              >
                {tab === 'positions'
                  ? 'No open positions.'
                  : 'No pending orders.'}
              </Text>
            </View>
          }
          renderItem={({ item }) =>
            tab === 'positions' ? (
              <PositionCard
                item={item}
                onEdit={setEditPos}
                onSquareOff={handleSquareOff}
              />
            ) : (
              <PendingCard
                item={item}
                onEdit={setEditPos}
                onSquareOff={handleSquareOff}
              />
            )
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.base,
            paddingVertical: spacing.sm + 2,
          }}
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

      <PlaceOrderModal
        visible={showOrder}
        brokerId={broker_id}
        onClose={() => {
          setShowOrder(false);
          fetchData(true);
        }}
      />
      <EditOrderModal
        visible={!!editPos}
        position={editPos}
        brokerId={broker_id}
        onClose={r => {
          setEditPos(null);
          if (r) fetchData(true);
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    gap: 4,
    height: 36,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.xs + 1,
    color: colors.textPrimary,
    padding: 0,
  },
});
