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
import Toggle from '../../components/common/Toggle';
import ChildAccountCard from '../../components/copyTrade/ChildAccountCard';
import ConfirmMasterModal from '../../components/copyTrade/ConfirmMasterModal';
import PlaceOrderModal from '../../components/copyTrade/PlaceOrderModal';
import AddChildModal from '../../components/copyTrade/AddChildModal';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import {
  getGroupById,
  getGroupBrokers,
  getBrokerNames,
  connectMaster,
  disconnectMaster,
  updateGroupTrading,
  addChildBroker,
  updateMultiplier,
} from '../../services/copyTradeService';

const parseList = res =>
  Array.isArray(res?.data)
    ? res.data
    : Array.isArray(res?.brokers)
    ? res.brokers
    : Array.isArray(res)
    ? res
    : [];

export default function GroupDetailScreen({ route, navigation }) {
  const { group: initialGroup } = route.params;

  const [group, setGroup] = useState(initialGroup);
  const [children, setChildren] = useState([]);
  const [brokerNames, setBrokerNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sFocused, setSFocused] = useState(false);
  const [showMasterDrop, setShowMasterDrop] = useState(false);
  const [bLoading, setBLoading] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [showPlaceOrder, setShowPlaceOrder] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);

  const groupId = group?.group_id ?? initialGroup?.group_id;

  const fetchAll = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        const [gRes, cRes, bRes] = await Promise.all([
          getGroupById(groupId),
          getGroupBrokers(groupId),
          getBrokerNames(),
        ]);
        const gData =
          gRes?.data ?? gRes?.group ?? (gRes?.group_id ? gRes : null);
        if (gData?.group_id) setGroup(gData);
        setChildren(parseList(cRes));
        const bList = Array.isArray(bRes?.data)
          ? bRes.data
          : Array.isArray(bRes)
          ? bRes
          : [];
        setBrokerNames(bList);
      } catch (e) {
        Alert.alert('Error', e?.message || 'Failed to load.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [groupId],
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Load broker names when dropdown opens
  useEffect(() => {
    if (!showMasterDrop) return;
    setBLoading(true);
    getBrokerNames()
      .then(res => {
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        setBrokerNames(list);
      })
      .catch(() => {})
      .finally(() => setBLoading(false));
  }, [showMasterDrop]);

  const handleSelectMaster = broker => {
    setSelectedMaster(broker);
    setShowMasterDrop(false);
    setShowConfirm(true);
  };

  const handleConfirmMaster = async () => {
    setConfirmLoading(true);
    try {
      const res = await connectMaster(groupId, selectedMaster.broker_id);
      if (res?.status === true) {
        setShowConfirm(false);
        setSelectedMaster(null);
        fetchAll(true);
      } else Alert.alert('Error', res?.message || 'Failed to connect master.');
    } catch (e) {
      Alert.alert('Error', e?.message || 'Network error.');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert('Disconnect Master', 'Are you sure you want to disconnect?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: async () => {
          const res = await disconnectMaster(groupId);
          if (res?.status === true) fetchAll(true);
          else Alert.alert('Error', res?.message || 'Failed.');
        },
      },
    ]);
  };

  const handleGroupTrading = async val => {
    setGroup(prev => ({ ...prev, trading_flag: val }));
    try {
      await updateGroupTrading(groupId, val);
    } catch {
      fetchAll(true);
    }
  };

  const handleChildTrading = (child, val) => {
    setChildren(prev =>
      prev.map(c =>
        c.broker_id === child.broker_id ? { ...c, trading_flag: val } : c,
      ),
    );
  };

  const handleAddChild = async broker => {
    try {
      const res = await addChildBroker(groupId, broker.broker_id);
      if (res?.status === true) {
        setShowAddChild(false);
        fetchAll(true);
      } else Alert.alert('Error', res?.message || 'Failed to add child.');
    } catch (e) {
      Alert.alert('Error', e?.message || 'Network error.');
    }
  };

  const handleUpdateMultiplier = async (child, val) => {
    try {
      await updateMultiplier(groupId, child.broker_id, val);
      setChildren(prev =>
        prev.map(c =>
          c.broker_id === child.broker_id ? { ...c, multiplier: val } : c,
        ),
      );
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed.');
    }
  };

  const hasMaster = !!(group?.master_broker_id || group?.master_broker_name);
  const existingIds = children.map(c => c.broker_id);

  // Group P/C/C/F
  const gPlaced = group?.placed ?? group?.place_order ?? 0;
  const gCancelled = group?.cancelled ?? group?.cancel_order ?? 0;
  const gCompleted = group?.completed ?? group?.filled_orders ?? 0;
  const gFailed = group?.failed ?? group?.failed_order ?? 0;

  const filtered = search.trim()
    ? children.filter(c =>
        Object.values(c || {}).some(v =>
          String(v ?? '')
            .toLowerCase()
            .includes(search.toLowerCase()),
        ),
      )
    : children;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <AppHeader />

      {/* ── Header bar ── */}
      <View style={s.headerBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Icon
            name="arrow-left"
            size={14}
            color={colors.primaryText}
            strokeWidth={2.5}
          />
          <Text style={s.backTxt} numberOfLines={1}>
            {group?.group_name || `Group #${groupId}`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.refreshIconBtn}
          onPress={() => fetchAll(true)}
        >
          <Icon
            name="refresh"
            size={15}
            color={colors.textSecondary}
            strokeWidth={1.8}
          />
        </TouchableOpacity>
      </View>

      {/* ── Master Account Banner ── */}
      <View style={s.masterBanner}>
        <Text style={s.masterBannerLabel}>Master Account</Text>

        {hasMaster ? (
          <>
            {/* Name + Disconnect */}
            <View style={s.masterNameRow}>
              <Text style={s.masterNameTxt} numberOfLines={1}>
                {group?.master_broker_name || `ID: ${group?.master_broker_id}`}
              </Text>
              <TouchableOpacity
                style={s.disconnectBtn}
                onPress={handleDisconnect}
              >
                <Text style={s.disconnectTxt}>⛔ Disconnect</Text>
              </TouchableOpacity>
            </View>
            {/* Trading + P/C/C/F */}
            <View style={s.masterBottomRow}>
              <View style={s.masterTradingRow}>
                <Text style={s.masterTradingLabel}>Trading</Text>
                <Toggle
                  value={!!group?.trading_flag}
                  onChange={handleGroupTrading}
                />
              </View>
              <View style={s.masterPcfRow}>
                {[
                  {
                    label: 'P',
                    val: gPlaced,
                    color: colors.warning,
                    bg: 'rgba(245,158,11,0.1)',
                    border: 'rgba(245,158,11,0.3)',
                  },
                  {
                    label: 'C',
                    val: gCancelled,
                    color: colors.error,
                    bg: 'rgba(239,68,68,0.1)',
                    border: 'rgba(239,68,68,0.3)',
                  },
                  {
                    label: 'C',
                    val: gCompleted,
                    color: colors.primary,
                    bg: 'rgba(74,222,128,0.1)',
                    border: 'rgba(74,222,128,0.3)',
                  },
                  {
                    label: 'F',
                    val: gFailed,
                    color: colors.warning,
                    bg: 'rgba(245,158,11,0.1)',
                    border: 'rgba(245,158,11,0.3)',
                  },
                ].map((stat, i) => (
                  <View
                    key={i}
                    style={[
                      s.pcfStatBox,
                      { backgroundColor: stat.bg, borderColor: stat.border },
                    ]}
                  >
                    <Text style={[s.pcfStatLabel, { color: stat.color }]}>
                      {stat.label}
                    </Text>
                    <Text style={[s.pcfStatVal, { color: stat.color }]}>
                      {stat.val}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          /* Master dropdown */
          <View>
            <TouchableOpacity
              style={[
                s.masterDropBtn,
                showMasterDrop && { borderColor: colors.primary },
              ]}
              onPress={() => setShowMasterDrop(v => !v)}
            >
              <Text
                style={[
                  s.masterDropTxt,
                  {
                    color: selectedMaster
                      ? colors.textPrimary
                      : colors.textPlaceholder,
                  },
                ]}
                numberOfLines={1}
              >
                {selectedMaster
                  ? selectedMaster.broker_name
                  : 'Select Master Account'}
              </Text>
              <Icon
                name={showMasterDrop ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={showMasterDrop ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>
            {showMasterDrop && (
              <View style={s.masterDropList}>
                {bLoading ? (
                  <View style={s.dropCenter}>
                    <ActivityIndicator color={colors.primary} />
                  </View>
                ) : brokerNames.length === 0 ? (
                  <Text style={s.dropEmpty}>No accounts available.</Text>
                ) : (
                  brokerNames.map((b, i) => (
                    <TouchableOpacity
                      key={b.broker_id}
                      style={[
                        s.dropItem,
                        i === brokerNames.length - 1 && {
                          borderBottomWidth: 0,
                        },
                      ]}
                      onPress={() => handleSelectMaster(b)}
                    >
                      <Icon
                        name="user"
                        size={12}
                        color={colors.textMuted}
                        strokeWidth={1.5}
                      />
                      <Text style={s.dropTxt} numberOfLines={1}>
                        {b.broker_name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>
        )}
      </View>

      {/* ── Child section header ── */}
      <View style={s.childHdr}>
        <Text style={s.childHdrTxt}>Child Accounts</Text>
        <View style={s.childHdrBtns}>
          <TouchableOpacity
            style={s.addChildBtn}
            onPress={() => setShowAddChild(true)}
          >
            <Icon
              name="plus"
              size={12}
              color={colors.primaryText}
              strokeWidth={2.5}
            />
            <Text style={s.addChildTxt}>Add Child</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.placeOutlineBtn}
            onPress={() => setShowPlaceOrder(true)}
          >
            <Text style={s.placeOutlineTxt}>Place Order</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search ── */}
      <View style={s.searchRow}>
        <View style={[s.searchBox, sFocused && s.searchFocused]}>
          <Icon
            name="search"
            size={13}
            color={sFocused ? colors.primary : colors.textMuted}
            strokeWidth={1.8}
          />
          <TextInput
            style={s.searchInput}
            placeholder="Search..."
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
                size={12}
                color={colors.textMuted}
                strokeWidth={2}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Child list ── */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item?.broker_id)}
          renderItem={({ item }) => (
            <ChildAccountCard
              item={item}
              onToggleTrading={handleChildTrading}
              onUpdateMultiplier={handleUpdateMultiplier}
            />
          )}
          contentContainerStyle={{
            padding: spacing.base,
            paddingBottom: spacing.xxl,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.center}>
              <Icon
                name="user"
                size={40}
                color={colors.textMuted}
                strokeWidth={1}
              />
              <Text style={s.emptyTxt}>
                {search
                  ? 'No results.'
                  : 'No child accounts yet.\nTap + Add Child to connect one.'}
              </Text>
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

      {/* ── Modals ── */}
      <ConfirmMasterModal
        visible={showConfirm}
        brokerName={selectedMaster?.broker_name || ''}
        loading={confirmLoading}
        onConfirm={handleConfirmMaster}
        onCancel={() => {
          setShowConfirm(false);
          setSelectedMaster(null);
        }}
      />
      <PlaceOrderModal
        visible={showPlaceOrder}
        groupId={groupId}
        onClose={success => {
          setShowPlaceOrder(false);
          if (success) Alert.alert('Success', 'Order placed successfully!');
        }}
      />
      <AddChildModal
        visible={showAddChild}
        onClose={() => setShowAddChild(false)}
        onAdd={handleAddChild}
        existingBrokerIds={existingIds}
      />
    </View>
  );
}

const s = StyleSheet.create({
  // Header bar
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  backTxt: {
    fontSize: typography.xs + 1,
    fontWeight: '700',
    color: colors.primaryText,
    maxWidth: 160,
  },
  refreshIconBtn: {
    width: 32,
    height: 32,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Master banner
  masterBanner: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  masterBannerLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  masterNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  masterNameTxt: {
    flex: 1,
    fontSize: typography.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  disconnectBtn: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  disconnectTxt: {
    fontSize: typography.xs + 1,
    fontWeight: '700',
    color: colors.error,
  },
  masterBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  masterTradingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  masterTradingLabel: { fontSize: typography.xs, color: colors.textSecondary },
  masterPcfRow: { flexDirection: 'row', gap: 5 },
  pcfStatBox: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignItems: 'center',
    minWidth: 34,
  },
  pcfStatLabel: { fontSize: typography.xs, fontWeight: '600' },
  pcfStatVal: { fontSize: typography.sm, fontWeight: '700' },

  // Master dropdown
  masterDropBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  masterDropTxt: { flex: 1, fontSize: typography.sm, marginRight: spacing.xs },
  masterDropList: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropTxt: { flex: 1, fontSize: typography.sm, color: colors.textPrimary },
  dropEmpty: {
    padding: spacing.md,
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: typography.sm,
  },
  dropCenter: { padding: spacing.md, alignItems: 'center' },

  // Child section header
  childHdr: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xs,
  },
  childHdrTxt: {
    fontSize: typography.sm,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  childHdrBtns: { flexDirection: 'row', gap: 6 },
  addChildBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  addChildTxt: {
    fontSize: typography.xs + 1,
    fontWeight: '700',
    color: colors.primaryText,
  },
  placeOutlineBtn: {
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  placeOutlineTxt: {
    fontSize: typography.xs + 1,
    fontWeight: '700',
    color: colors.primary,
  },

  // Search
  searchRow: { paddingHorizontal: spacing.base, marginBottom: spacing.sm },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
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
    fontSize: typography.sm,
    textAlign: 'center',
  },
});
