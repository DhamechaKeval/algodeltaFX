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
  refreshAccount,
} from '../../services/accountService';

// ── Position Card ─────────────────────────────────────────────────
function PositionCard({ item, brokerId, onEdit, onRefresh }) {
  const isBuy = item?.type === 0 || String(item?.type).toUpperCase() === 'BUY';
  const pnl = item?.profit ?? item?.pnl ?? 0;

  return (
    <View style={detailStyles.posCard}>
      {/* Row 1: Symbol + Type + PnL */}
      <View style={detailStyles.posRow1}>
        <View>
          <Text style={detailStyles.posSymbol}>{item?.symbol || '—'}</Text>
          <Text style={detailStyles.posTicket}>
            #{item?.ticket || item?.id || '—'}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
          }}
        >
          <View style={isBuy ? detailStyles.typeBuy : detailStyles.typeSell}>
            <Text
              style={isBuy ? detailStyles.typeBuyTxt : detailStyles.typeSellTxt}
            >
              {isBuy ? 'BUY' : 'SELL'}
            </Text>
          </View>
          <Text
            style={[
              { fontSize: typography.sm, fontWeight: typography.bold },
              pnl > 0 && { color: colors.primary },
              pnl < 0 && { color: colors.error },
              pnl === 0 && { color: colors.textSecondary },
            ]}
          >
            {pnl > 0 ? `+${pnl}` : pnl} ↑
          </Text>
        </View>
      </View>

      {/* Row 2: stats */}
      <View style={detailStyles.posRow2}>
        {[
          { l: 'Volume', v: item?.volume ?? '—' },
          { l: 'Price($)', v: item?.price_open ?? item?.price ?? '—' },
          { l: 'SL', v: item?.sl ?? 0 },
          { l: 'TP', v: item?.tp ?? 0 },
        ].map((stat, i) => (
          <View key={i} style={detailStyles.posStat}>
            <Text style={detailStyles.posStatL}>{stat.l}</Text>
            <Text style={detailStyles.posStatV}>{stat.v}</Text>
          </View>
        ))}
      </View>

      {/* Row 3: Edit SL/TP button */}
      <View
        style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}
      >
        <TouchableOpacity
          style={[
            detailStyles.closeBtn,
            {
              flex: 1,
              borderColor: 'rgba(139,92,246,0.4)',
              backgroundColor: 'rgba(139,92,246,0.08)',
            },
          ]}
          onPress={() => onEdit(item)}
        >
          <Icon name="settings" size={13} color="#8B5CF6" strokeWidth={1.8} />
          <Text
            style={{
              fontSize: typography.xs + 1,
              fontWeight: typography.bold,
              color: '#8B5CF6',
            }}
          >
            Edit SL / TP
          </Text>
        </TouchableOpacity>
      </View>

      {item?.time && (
        <Text
          style={{
            fontSize: typography.xs,
            color: colors.textMuted,
            marginTop: spacing.xs,
          }}
        >
          {item.time}
        </Text>
      )}
    </View>
  );
}

// ── Pending Order Card ────────────────────────────────────────────
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
    <View style={detailStyles.posCard}>
      <View style={detailStyles.posRow1}>
        <View>
          <Text style={detailStyles.posSymbol}>{item?.symbol || '—'}</Text>
          <Text style={detailStyles.posTicket}>
            #{item?.ticket || item?.id || '—'}
          </Text>
        </View>
        <View style={isBuy ? detailStyles.typeBuy : detailStyles.typeSell}>
          <Text
            style={isBuy ? detailStyles.typeBuyTxt : detailStyles.typeSellTxt}
          >
            {typeLabel}
          </Text>
        </View>
      </View>
      <View style={detailStyles.posRow2}>
        {[
          { l: 'Volume', v: item?.volume ?? '—' },
          { l: 'Price($)', v: item?.price_open ?? item?.price ?? '—' },
          { l: 'SL', v: item?.sl ?? 0 },
          { l: 'TP', v: item?.tp ?? 0 },
        ].map((stat, i) => (
          <View key={i} style={detailStyles.posStat}>
            <Text style={detailStyles.posStatL}>{stat.l}</Text>
            <Text style={detailStyles.posStatV}>{stat.v}</Text>
          </View>
        ))}
      </View>
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
  const [showOrder, setShowOrder] = useState(false);
  const [editPos, setEditPos] = useState(null); // position being edited

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

  const handleSquareOffAll = () => {
    Alert.alert(
      'Confirm Square Off All',
      'Are you sure you want to square off all position of this account?',
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

  const handleRefreshBanner = async () => {
    try {
      await refreshAccount(broker_id);
    } catch {}
    fetchData(true);
  };

  const data = tab === 'positions' ? positions : pending;
  const empty =
    tab === 'positions' ? 'No open positions.' : 'No pending orders.';

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
              {pnl}
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
              onPress={handleRefreshBanner}
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
        <TouchableOpacity style={detailStyles.exportBtn}>
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
      </View>

      {/* Content */}
      {loading ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : data.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon
            name="orders"
            size={40}
            color={colors.textMuted}
            strokeWidth={1}
          />
          <Text
            style={{
              color: colors.textSecondary,
              marginTop: spacing.md,
              fontSize: typography.md,
            }}
          >
            {empty}
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, i) => String(item?.ticket || item?.id || i)}
          renderItem={({ item }) =>
            tab === 'positions' ? (
              <PositionCard
                item={item}
                brokerId={broker_id}
                onEdit={pos => setEditPos(pos)}
                onRefresh={() => fetchData(true)}
              />
            ) : (
              <PendingCard item={item} />
            )
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
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

      {/* Place Order Modal */}
      <PlaceOrderModal
        visible={showOrder}
        brokerId={broker_id}
        onClose={() => {
          setShowOrder(false);
          fetchData(true);
        }}
      />

      {/* Edit Order Modal */}
      <EditOrderModal
        visible={!!editPos}
        position={editPos}
        brokerId={broker_id}
        onClose={refreshed => {
          setEditPos(null);
          if (refreshed) fetchData(true);
        }}
      />
    </View>
  );
}
