import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Icon from '../common/Icon';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getBrokerNames } from '../../services/copyTradeService';

const LOT_METHODS = ['Multiplier', 'Fixed Lot', 'Balance Based'];

export default function AddChildModal({
  visible,
  onClose,
  onAdd,
  existingBrokerIds = [],
}) {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sFocused, setSFocused] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [showBrokerDrop, setShowBrokerDrop] = useState(false);
  const [lotMethod, setLotMethod] = useState('Multiplier');
  const [multiplier, setMultiplier] = useState('1');
  const [multFocused, setMultFocused] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSelectedBroker(null);
      setShowBrokerDrop(false);
      setLotMethod('Multiplier');
      setMultiplier('1');
      setSearch('');
      return;
    }
    setLoading(true);
    getBrokerNames()
      .then(res => {
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        setBrokers(list.filter(b => !existingBrokerIds.includes(b.broker_id)));
      })
      .catch(() => setBrokers([]))
      .finally(() => setLoading(false));
  }, [visible]);

  const filtered = search.trim()
    ? brokers.filter(b =>
        String(b?.broker_name || '')
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : brokers;

  const handleAdd = async () => {
    if (!selectedBroker) return;
    setAdding(true);
    await onAdd(selectedBroker, Number(multiplier) || 1, lotMethod);
    setAdding(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.modal}>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Add Child Account</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon
                name="x"
                size={18}
                color={colors.textSecondary}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>

          {/* Child Account dropdown */}
          <Text style={s.fieldLabel}>Child Account</Text>
          <TouchableOpacity
            style={[s.fieldInp, showBrokerDrop && s.fieldInpActive]}
            onPress={() => setShowBrokerDrop(v => !v)}
          >
            <Text
              style={[
                s.fieldTxt,
                !selectedBroker && { color: colors.textPlaceholder },
              ]}
              numberOfLines={1}
            >
              {selectedBroker
                ? selectedBroker.broker_name
                : 'Select Child Account'}
            </Text>
            <Icon
              name="chevron-down"
              size={12}
              color={showBrokerDrop ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Broker dropdown list */}
          {showBrokerDrop && (
            <View style={s.dropList}>
              {/* Search inside dropdown */}
              <View
                style={[
                  s.dropSearch,
                  sFocused && { borderColor: colors.primary },
                ]}
              >
                <Icon
                  name="search"
                  size={12}
                  color={colors.textMuted}
                  strokeWidth={1.8}
                />
                <TextInput
                  style={s.dropSearchInput}
                  placeholder="Search..."
                  placeholderTextColor={colors.textPlaceholder}
                  value={search}
                  onChangeText={setSearch}
                  onFocus={() => setSFocused(true)}
                  onBlur={() => setSFocused(false)}
                />
              </View>
              {loading ? (
                <View style={s.dropCenter}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : filtered.length === 0 ? (
                <Text style={s.dropEmpty}>No accounts available.</Text>
              ) : (
                filtered.slice(0, 5).map((b, i) => (
                  <TouchableOpacity
                    key={b.broker_id}
                    style={[
                      s.dropItem,
                      i === filtered.slice(0, 5).length - 1 && {
                        borderBottomWidth: 0,
                      },
                      selectedBroker?.broker_id === b.broker_id &&
                        s.dropItemActive,
                    ]}
                    onPress={() => {
                      setSelectedBroker(b);
                      setShowBrokerDrop(false);
                    }}
                  >
                    <Text
                      style={[
                        s.dropTxt,
                        selectedBroker?.broker_id === b.broker_id && {
                          color: colors.primary,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {b.broker_name}
                    </Text>
                    {selectedBroker?.broker_id === b.broker_id && (
                      <Icon
                        name="check"
                        size={12}
                        color={colors.primary}
                        strokeWidth={2.5}
                      />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* Lot Sizing Method pills */}
          <Text style={s.fieldLabel}>Lot Sizing Method</Text>
          <View style={s.pills}>
            {LOT_METHODS.map(m => (
              <TouchableOpacity
                key={m}
                style={[s.pill, lotMethod === m && s.pillActive]}
                onPress={() => setLotMethod(m)}
              >
                <Text style={[s.pillTxt, lotMethod === m && s.pillTxtActive]}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Multiplier input */}
          <Text style={s.fieldLabel}>{lotMethod}</Text>
          <TextInput
            style={[
              s.fieldInp,
              { color: colors.textPrimary },
              multFocused && s.fieldInpActive,
            ]}
            value={multiplier}
            onChangeText={setMultiplier}
            keyboardType="decimal-pad"
            onFocus={() => setMultFocused(true)}
            onBlur={() => setMultFocused(false)}
          />

          {/* Buttons */}
          <View style={s.btnRow}>
            <TouchableOpacity style={s.btnCancel} onPress={onClose}>
              <Text style={s.btnCancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                s.btnAdd,
                (!selectedBroker || adding) && { opacity: 0.6 },
              ]}
              onPress={handleAdd}
              disabled={!selectedBroker || adding}
            >
              {adding ? (
                <ActivityIndicator size="small" color={colors.primaryText} />
              ) : (
                <Text style={s.btnAddTxt}>Add</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.base,
    paddingBottom: spacing.xxxl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.base,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  fieldLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  fieldInp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 1,
    marginBottom: spacing.md,
  },
  fieldInpActive: { borderColor: colors.primary },
  fieldTxt: { flex: 1, fontSize: typography.sm, color: colors.textPrimary },
  dropList: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: -spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  dropSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 1,
  },
  dropSearchInput: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.textPrimary,
    padding: 0,
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropItemActive: { backgroundColor: 'rgba(74,222,128,0.06)' },
  dropTxt: { flex: 1, fontSize: typography.sm, color: colors.textPrimary },
  dropEmpty: {
    padding: spacing.md,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: typography.sm,
  },
  dropCenter: { padding: spacing.md, alignItems: 'center' },
  pills: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillTxt: {
    fontSize: typography.xs + 1,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pillTxtActive: { color: colors.primaryText },
  btnRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  btnCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 9,
    paddingVertical: spacing.sm + 1,
    alignItems: 'center',
  },
  btnCancelTxt: {
    fontSize: typography.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  btnAdd: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 9,
    paddingVertical: spacing.sm + 1,
    alignItems: 'center',
  },
  btnAddTxt: {
    fontSize: typography.sm,
    fontWeight: '700',
    color: colors.primaryText,
  },
});
