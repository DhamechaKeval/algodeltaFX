import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from '../common/Icon';
import Toggle from '../common/Toggle';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import {
  getBrokerNames,
  connectMaster,
  disconnectMaster,
} from '../../services/copyTradeService';

export default function GroupCard({
  item,
  onView,
  onMenu,
  onToggleTrading,
  onPlaceOrder,
  onRefresh,
}) {
  const [showDrop, setShowDrop] = useState(false);
  const [brokers, setBrokers] = useState([]);
  const [bLoading, setBLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const placed = item?.placed ?? item?.place_order ?? 0;
  const cancelled = item?.cancelled ?? item?.cancel_order ?? 0;
  const completed = item?.completed ?? item?.filled_orders ?? 0;
  const failed = item?.failed ?? item?.failed_order ?? 0;
  const childCount = item?.child_count ?? item?.broker_count ?? 0;
  const hasMaster = !!(item?.master_broker_name || item?.master_broker_name);

  // ── Load brokers when dropdown opens ──
  useEffect(() => {
    if (!showDrop) return;
    setBLoading(true);
    getBrokerNames()
      .then(res => {
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        setBrokers(list);
      })
      .catch(() => setBrokers([]))
      .finally(() => setBLoading(false));
  }, [showDrop]);

  // ── Connect master ──
  const handleSelectBroker = broker => {
    setShowDrop(false);
    Alert.alert(
      'Confirm Connect',
      `Connect "${broker.broker_combine_name}" as master account?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            setConnecting(true);
            try {
              const res = await connectMaster(item.group_id, broker.broker_id);
              if (res?.status === true) {
                onRefresh && onRefresh();
              } else {
                Alert.alert(
                  'Error',
                  res?.message || 'Failed to connect master.',
                );
              }
            } catch (e) {
              Alert.alert('Error', e?.message || 'Network error.');
            } finally {
              setConnecting(false);
            }
          },
        },
      ],
    );
  };

  // ── Disconnect master ──
  const handleDisconnect = () => {
    Alert.alert(
      'Confirm Disconnect',
      `Disconnect master account from "${item?.group_name}"?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            setConnecting(true);
            try {
              const res = await disconnectMaster(item.group_id);
              if (res?.status === true) {
                onRefresh && onRefresh();
              } else {
                Alert.alert('Error', res?.message || 'Failed to disconnect.');
              }
            } catch (e) {
              Alert.alert('Error', e?.message || 'Network error.');
            } finally {
              setConnecting(false);
            }
          },
        },
      ],
    );
  };

  // ── Trading toggle ──
  const handleTrading = () => {
    Alert.alert(
      'Confirm',
      `${item?.trading_flag ? 'Disable' : 'Enable'} trading for this group?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => onToggleTrading(item, !item?.trading_flag),
        },
      ],
    );
  };

  return (
    <View style={s.card}>
      {/* ── Top: Group Name + Menu + Eye ── */}
      <View style={s.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.nameLabel}>Group Name</Text>
          <Text style={s.nameVal} numberOfLines={1}>
            {item?.group_name || `Group #${item?.group_id}`}
          </Text>
        </View>
        <View style={s.topActions}>
          <TouchableOpacity style={s.menuBtn} onPress={() => onMenu(item)}>
            <Icon
              name="more-vertical"
              size={15}
              color="#8B5CF6"
              strokeWidth={1.8}
            />
          </TouchableOpacity>
          <TouchableOpacity style={s.eyeBtn} onPress={() => onView(item)}>
            <Icon
              name="eye"
              size={15}
              color={colors.primary}
              strokeWidth={1.8}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Master Account ── */}
      <View style={s.masterSection}>
        <Text style={s.masterLabel}>Master Account</Text>

        {connecting ? (
          <View style={s.masterLoadRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={s.masterLoadTxt}>Processing...</Text>
          </View>
        ) : hasMaster ? (
          /* Connected — show name + disconnect icon */
          <View style={s.masterConnectedRow}>
            <Text style={s.masterName} numberOfLines={1}>
              {item?.master_broker_name || `ID: ${item?.master_broker_id}`}
            </Text>
            <TouchableOpacity
              style={s.disconnectIcon}
              onPress={handleDisconnect}
            >
              <Icon
                name="lan-disconnect"
                size={16}
                color={colors.error}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>
        ) : (
          /* Not connected — show dropdown */
          <View>
            <TouchableOpacity
              style={[
                s.masterSelectRow,
                showDrop && { borderColor: colors.primary },
              ]}
              onPress={() => setShowDrop(v => !v)}
            >
              <Text style={s.masterSelectTxt}>Select Master</Text>
              <Icon
                name={showDrop ? 'chevron-up' : 'chevron-down'}
                size={15}
                color={showDrop ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>

            {/* Dropdown list */}
            {showDrop && (
              <View style={s.dropList}>
                {bLoading ? (
                  <View style={s.dropCenter}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : brokers.length === 0 ? (
                  <Text style={s.dropEmpty}>No accounts available.</Text>
                ) : (
                  brokers.map((b, i) => (
                    <TouchableOpacity
                      key={b.broker_id}
                      style={[
                        s.dropItem,
                        i === brokers.length - 1 && { borderBottomWidth: 0 },
                      ]}
                      onPress={() => handleSelectBroker(b)}
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

      {/* ── Child section ── */}
      <View style={s.childBox}>
        <Text style={s.childHeader}>
          Child{'  '}
          <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
            {childCount}
          </Text>
        </Text>

        {/* P / C / C / F */}
        <View style={s.pcfRow}>
          <View style={s.pcfItem}>
            <Text style={s.pcfLabel}>P</Text>
            <Text style={[s.pcfVal, { color: colors.warning }]}>{placed}</Text>
          </View>
          <View style={s.vLine} />
          <View style={s.pcfItem}>
            <Text style={s.pcfLabel}>C</Text>
            <Text style={[s.pcfVal, { color: colors.error }]}>{cancelled}</Text>
          </View>
          <View style={s.vLine} />
          <View style={s.pcfItem}>
            <Text style={s.pcfLabel}>C</Text>
            <Text style={[s.pcfVal, { color: colors.primary }]}>
              {completed}
            </Text>
          </View>
          <View style={s.vLine} />
          <View style={s.pcfItem}>
            <Text style={s.pcfLabel}>F</Text>
            <Text style={[s.pcfVal, { color: colors.error }]}>{failed}</Text>
          </View>
        </View>
      </View>

      {/* ── Bottom: Trading + Place Order ── */}
      <View style={s.bottomRow}>
        <View style={s.tradingRow}>
          <Text style={s.tradingLabel}>Trading</Text>
          <Toggle value={!!item?.trading_flag} onChange={handleTrading} />
        </View>
        <TouchableOpacity
          style={s.placeBtn}
          onPress={() => onPlaceOrder && onPlaceOrder(item)}
        >
          <Text style={s.placeBtnTxt}>Place Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },

  // Top
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  nameLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  nameVal: {
    fontSize: typography.base,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  topActions: { flexDirection: 'row', gap: spacing.xs, marginTop: 2 },
  eyeBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Master
  masterSection: { marginBottom: spacing.sm },
  masterLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  masterLoadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  masterLoadTxt: { fontSize: typography.sm, color: colors.textSecondary },
  masterConnectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  masterName: {
    flex: 1,
    fontSize: typography.sm + 2,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  disconnectIcon: { padding: spacing.xs },
  masterSelectRow: {
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
  masterSelectTxt: { fontSize: typography.sm, color: colors.textPlaceholder },

  // Dropdown
  dropList: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.textMuted,
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
    fontSize: typography.sm,
    textAlign: 'center',
  },
  dropCenter: { padding: spacing.md, alignItems: 'center' },

  // Child box
  childBox: {
    backgroundColor: colors.bgInput,
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  childHeader: {
    fontSize: typography.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  pcfRow: { flexDirection: 'row' },
  pcfItem: { flex: 1, alignItems: 'center' },
  pcfLabel: {
    fontSize: typography.md,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  pcfVal: { fontSize: typography.md, fontWeight: '700' },
  vLine: { width: 1, backgroundColor: colors.border },

  // Bottom
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tradingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  tradingLabel: { fontSize: typography.xs, color: colors.textSecondary },
  placeBtn: {
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 7,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  placeBtnTxt: {
    fontSize: typography.sm,
    fontWeight: '700',
    color: colors.primaryText,
  },
});
