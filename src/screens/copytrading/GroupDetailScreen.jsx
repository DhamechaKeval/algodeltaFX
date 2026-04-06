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
} from '../../services/copyTradeService';
import { useAlert } from '../../components/common/AlertContext';
import { useLoadingLock } from '../../context/LoadingLockContext';

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
  const { showAlert } = useAlert();
  const { withLock } = useLoadingLock();

  const groupId = group.group_id;

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
        showAlert('Error', e?.msg || 'Failed to load.');
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
      } else showAlert('Error', res?.msg || 'Failed to connect master.');
    } catch (e) {
      showAlert('Error', e?.msg || 'Network error.');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDisconnect = () => {
    showAlert('Disconnect Master', 'Are you sure you want to disconnect?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: () =>
          withLock(async () => {
            const res = await disconnectMaster(groupId);
            if (res?.status === true) fetchAll(true);
            else showAlert('Error', res?.msg || 'Failed.');
          }),
      },
    ]);
  };

  const handleGroupTrading = val => {
    showAlert(
      'Confirm',
      `${val ? 'Enable' : 'Disable'} trading for this group?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () =>
            withLock(async () => {
              try {
                await updateGroupTrading(groupId, val);

                // ✅ update UI after success
                setGroup(prev => ({ ...prev, trading_flag: val }));

                // ✅ refresh list if needed
                fetchAll(true);
              } catch (e) {
                showAlert('Error', 'Failed to update trading flag');
              }
            }),
        },
      ],
    );
  };

  const handleAddChild = () =>
    withLock(async broker => {
      try {
        const res = await addChildBroker(groupId, broker.broker_id);
        if (res?.status === true) {
          setShowAddChild(false);
          fetchAll(true);
        } else showAlert('Error', res?.msg || 'Failed to add child.');
      } catch (e) {
        showAlert('Error', e?.msg || 'Network error.');
      }
    });

  const hasMaster = !!(group?.master_broker_id || group?.master_broker_name);
  const existingIds = children.map(c => c.broker_id);

  // Group P/C/C/F
  const gPlaced = group?.pending_count;
  const gCancelled = group?.canceled_count;
  const gCompleted = group?.filled_count;
  const gFailed = group?.failed_count;

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
        <View style={s.grpNameandBack}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Icon
              name="arrow-left"
              size={16}
              color={colors.primaryText}
              strokeWidth={3}
            />
          </TouchableOpacity>
          <Text style={s.backTxt} numberOfLines={1}>
            {group?.group_name || `Group #${groupId}`}
          </Text>
        </View>
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
                <Text style={s.disconnectTxt}>Disconnect</Text>
              </TouchableOpacity>
            </View>
            {/* Trading + P/C/C/F */}
            <View style={s.masterBottomRow}>
              <View style={s.masterTradingRow}>
                <Text style={s.masterTradingLabel}>Trading</Text>
                <Toggle
                  value={!!group?.grp_trading_flag}
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
                        name="users"
                        size={12}
                        color={colors.textMuted}
                        strokeWidth={1.5}
                      />
                      <Text style={s.dropTxt} numberOfLines={1}>
                        {b.broker_combine_name}
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
      </View>

      {/* ── Search ── */}
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
            placeholder="Search groups..."
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
          style={s.addChildBtn}
          onPress={() => setShowAddChild(true)}
        >
          <Icon
            name="plus"
            size={15}
            color={colors.primaryText}
            strokeWidth={3}
          />
          <Text style={s.addChildTxt}>Child</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.placeOutlineBtn, children.length === 0 && { opacity: 0.6 }]}
          disabled={children.length === 0}
          onPress={() => setShowPlaceOrder(true)}
        >
          <Text style={s.placeOutlineTxt}>Place Order</Text>
        </TouchableOpacity>
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
              groupId={groupId}
              onReload={() => fetchAll(true)}
              navigation={navigation}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: spacing.base,
            paddingVertical: spacing.sm + 2,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.center}>
              <Icon
                name="users"
                size={34}
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
        brokerName={
          selectedMaster?.broker_combine_name ||
          selectedMaster?.broker_name ||
          ''
        }
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
          if (success) showAlert('Success', 'Order placed successfully!');
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
  grpNameandBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  backTxt: {
    fontSize: typography.xl,
    fontWeight: '700',
    color: colors.textPrimary,
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
    marginBottom: spacing.sm,
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
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignItems: 'center',
    minWidth: 34,
  },
  pcfStatLabel: { fontSize: typography.md, fontWeight: '600' },
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
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
    height: 34,
  },
  addChildTxt: {
    fontSize: typography.xs + 1,
    fontWeight: '700',
    color: colors.primaryText,
  },
  placeOutlineBtn: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOutlineTxt: {
    fontSize: typography.sm,
    fontWeight: '700',
    color: colors.primaryText,
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    marginBlock: spacing.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
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
    fontSize: typography.sm,
    textAlign: 'center',
  },
});
