import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
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

// ── Position Card ─────────────────────────────────────────────────
function PositionCard({ item, onEdit, onSquareOff }) {
  const isBuy = item?.type === 0 || String(item?.type).toUpperCase() === 'BUY';
  const pnl = Number(item?.profit ?? item?.pnl ?? 0);
  const hasSl = item?.sl && item.sl !== 0;
  const hasTp = item?.tp && item.tp !== 0;

  return (
    <View style={s.card}>
      {/* Row 1: Symbol + Type + PnL */}
      <View style={s.cardRow1}>
        <View>
          <Text style={s.symbol}>{item?.symbol || '—'}</Text>
          <Text style={s.ticket}>#{item?.ticket || item?.id || '—'}</Text>
        </View>
        <View style={s.row1Right}>
          <View style={isBuy ? s.buy : s.sell}>
            <Text style={isBuy ? s.buyTxt : s.sellTxt}>
              {isBuy ? 'BUY' : 'SELL'}
            </Text>
          </View>
          <Text
            style={[
              s.pnl,
              pnl > 0 && { color: colors.primary },
              pnl < 0 && { color: colors.error },
            ]}
          >
            {pnl > 0 ? `+${pnl.toFixed(4)}` : pnl.toFixed(4)}
            <Text style={{ fontSize: 10 }}>
              {pnl < 0 ? ' ↓' : pnl > 0 ? ' ↑' : ''}
            </Text>
          </Text>
        </View>
      </View>

      {/* Row 2: Volume | Price | SL | TP */}
      <View style={s.statsRow}>
        <View style={s.statBox}>
          <Text style={s.statLabel}>Volume</Text>
          <Text style={s.statVal}>{item?.volume ?? '—'}</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statLabel}>Price($)</Text>
          <Text style={s.statVal}>
            {item?.price_open ?? item?.price ?? '—'}
          </Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statLabel}>SL</Text>
          <TouchableOpacity onPress={() => onEdit(item)}>
            {hasSl ? (
              <Text style={s.statVal}>{item.sl}</Text>
            ) : (
              <Text style={s.addLink}>Add</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={s.statBox}>
          <Text style={s.statLabel}>TP</Text>
          <TouchableOpacity onPress={() => onEdit(item)}>
            {hasTp ? (
              <Text style={s.statVal}>{item.tp}</Text>
            ) : (
              <Text style={s.addLink}>Add</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Row 3: Action buttons */}
      <View style={s.cardBottom}>
        <Text style={s.timeText}>{item?.time || ''}</Text>
        <View style={s.actionRow}>
          {/* Edit SL/TP */}
          <TouchableOpacity style={s.editBtn} onPress={() => onEdit(item)}>
            <Icon name="settings" size={13} color="#EF9F27" strokeWidth={1.8} />
            <Text style={s.editBtnTxt}>Edit SL/TP</Text>
          </TouchableOpacity>
          {/* Square Off — red */}
          <TouchableOpacity
            style={s.squareBtn}
            onPress={() => onSquareOff(item)}
          >
            <Icon name="x" size={13} color="#fff" strokeWidth={2.5} />
            <Text style={s.squareBtnTxt}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── Pending Card ──────────────────────────────────────────────────
function PendingCard({ item }) {
  const typeMap = {
    0: 'BUY',
    1: 'SELL',
    2: 'BUY LIMIT',
    3: 'SELL LIMIT',
    4: 'BUY STOP',
    5: 'SELL STOP',
  };
  const typeLabel = typeMap[item?.type] || String(item?.type);
  const isBuy = String(typeLabel).includes('BUY');

  return (
    <View style={s.card}>
      <View style={s.cardRow1}>
        <View>
          <Text style={s.symbol}>{item?.symbol || '—'}</Text>
          <Text style={s.ticket}>#{item?.ticket || item?.id || '—'}</Text>
        </View>
        <View style={isBuy ? s.buy : s.sell}>
          <Text style={isBuy ? s.buyTxt : s.sellTxt}>{typeLabel}</Text>
        </View>
      </View>
      <View style={s.statsRow}>
        {[
          { l: 'Volume', v: item?.volume ?? '—' },
          { l: 'Price($)', v: item?.price_open ?? item?.price ?? '—' },
          { l: 'SL', v: item?.sl ?? '—' },
          { l: 'TP', v: item?.tp ?? '—' },
        ].map((stat, i) => (
          <View key={i} style={s.statBox}>
            <Text style={s.statLabel}>{stat.l}</Text>
            <Text style={s.statVal}>{stat.v}</Text>
          </View>
        ))}
      </View>
      {item?.time && (
        <Text style={[s.timeText, { marginTop: spacing.xs }]}>{item.time}</Text>
      )}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────
export default function AccountDetailScreen({ route, navigation }) {
  const { account } = route.params;
  const broker_id = account.broker_id;
  const { account_info = {} } = account;

  const [tab, setTab] = useState('positions');
  const [positions, setPositions] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showOrder, setShowOrder] = useState(false);
  const [editPos, setEditPos] = useState(null);

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
        Alert.alert('Error', e?.message || 'Failed to load data.');
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
    Alert.alert(
      'Close Position',
      `Close ${pos?.symbol} ${pos?.type === 0 ? 'BUY' : 'SELL'} (Vol: ${
        pos?.volume
      })?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Position',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await squareOffSingle(
                broker_id,
                pos?.ticket || pos?.id,
              );
              if (res?.status === true) {
                Alert.alert('Success', 'Position closed.');
                fetchData(true);
              } else {
                Alert.alert('Error', res?.message || 'Failed.');
              }
            } catch (e) {
              Alert.alert('Error', e?.message || 'Network error.');
            }
          },
        },
      ],
    );
  };

  const handleSquareOffAll = () => {
    Alert.alert(
      'Confirm Square Off All',
      'Are you sure you want to square off all positions of this account?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await squareOffAll(broker_id);
              if (res?.status === true) {
                Alert.alert('Success', 'All positions squared off.');
                fetchData(true);
              } else {
                Alert.alert('Error', res?.message || 'Failed.');
              }
            } catch (e) {
              Alert.alert('Error', e?.message || 'Network error.');
            }
          },
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
              style={[
                detailStyles.actionIconBtn,
                detailStyles.actionIconBtnGreen,
              ]}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '800',
                  color: colors.primary,
                }}
              >
                RS
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={detailStyles.actionIconBtn}
              onPress={async () => {
                try {
                  await refreshAccount(broker_id);
                } catch {}
                fetchData(true);
              }}
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
          onPress={() =>
            exportToCSV(
              data,
              tab,
              account.broker_combine_name || account.nic_name,
            )
          }
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
        <TouchableOpacity
          style={detailStyles.refreshBtn}
          onPress={() => fetchData(true)}
        >
          <Icon name="refresh" size={13} color="#8B5CF6" strokeWidth={2} />
          <Text style={detailStyles.refreshTxt}>Refresh</Text>
        </TouchableOpacity>
        {/* Search */}
        <View style={s.searchBox}>
          <Icon
            name="search"
            size={12}
            color={colors.textMuted}
            strokeWidth={1.8}
          />
          <TextInput
            style={s.searchInput}
            placeholder="Search..."
            placeholderTextColor={colors.textPlaceholder}
            value={search}
            onChangeText={setSearch}
          />
        </View>
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
              <PendingCard item={item} />
            )
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: spacing.base,
            paddingBottom: spacing.xxl,
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
  // Position card
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: spacing.radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  symbol: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  ticket: { fontSize: typography.xs, color: colors.textMuted, marginTop: 2 },
  row1Right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  buy: {
    backgroundColor: 'rgba(74,222,128,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
    borderRadius: spacing.radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  sell: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: spacing.radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  buyTxt: {
    fontSize: typography.xs + 1,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  sellTxt: {
    fontSize: typography.xs + 1,
    fontWeight: typography.bold,
    color: colors.error,
  },
  pnl: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.textSecondary,
  },
  statsRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
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
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  addLink: {
    fontSize: typography.xs + 1,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  timeText: { fontSize: typography.xs, color: colors.textMuted },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  // Edit button — orange
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239,159,39,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,159,39,0.3)',
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  editBtnTxt: {
    fontSize: typography.xs + 1,
    fontWeight: typography.semibold,
    color: '#EF9F27',
  },
  // Square off — red filled
  squareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.error,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  squareBtnTxt: {
    fontSize: typography.xs + 1,
    fontWeight: typography.bold,
    color: '#fff',
  },
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
  },
  searchInput: {
    flex: 1,
    fontSize: typography.xs + 1,
    color: colors.textPrimary,
    padding: 0,
  },
});
