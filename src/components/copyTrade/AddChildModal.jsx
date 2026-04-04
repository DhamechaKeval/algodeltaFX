import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Icon from '../common/Icon';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getBrokerNames } from '../../services/copyTradeService';

const LOT_METHODS = [
  { key: 'multiplier', label: 'Multiplier', default: '1' },
  { key: 'fix_lot', label: 'Fix Lot', default: '0.01' },
  { key: 'balance_based', label: 'Balance Based', default: null },
];

const BALANCE_BASED_INFO =
  "When you select the Balance Based option, the master account's balance is used as the reference for copying trades to the child account. This means the child account's trade size is adjusted proportionally based on the balance ratio between the child and the master account.";

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
  const [lotMethod, setLotMethod] = useState('multiplier');
  const [lotValue, setLotValue] = useState('1');
  const [valFocused, setValFocused] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSelectedBroker(null);
      setShowBrokerDrop(false);
      setLotMethod('multiplier');
      setLotValue('1');
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

  const handleMethodChange = m => {
    setLotMethod(m);
    if (m === 'multiplier') setLotValue('1');
    else if (m === 'fix_lot') setLotValue('0.01');
    else setLotValue('');
  };

  const filtered = search.trim()
    ? brokers.filter(b =>
        String(b?.broker_combine_name || b?.broker_name || '')
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : brokers;

  const handleAdd = async () => {
    if (!selectedBroker) return;

    // Validate value for non-balance-based
    if (lotMethod !== 'balance_based') {
      const numVal = Number(lotValue);
      if (!lotValue.trim() || isNaN(numVal) || numVal <= 0) {
        return;
      }
    }

    setAdding(true);
    await onAdd(
      selectedBroker,
      lotMethod !== 'balance_based' ? Number(lotValue) : 0,
      lotMethod,
    );
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
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
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
                ? selectedBroker.broker_combine_name ||
                  selectedBroker.broker_name
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
              {loading ? (
                <View style={s.dropCenter}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : filtered.length === 0 ? (
                <Text style={s.dropEmpty}>No accounts available.</Text>
              ) : (
                filtered.slice(0, 6).map((b, i) => (
                  <TouchableOpacity
                    key={b.broker_id}
                    style={[
                      s.dropItem,
                      i === filtered.slice(0, 6).length - 1 && {
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
                      {b.broker_combine_name || b.broker_name}
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
                key={m.key}
                style={[s.pill, lotMethod === m.key && s.pillActive]}
                onPress={() => handleMethodChange(m.key)}
              >
                <Text
                  style={[s.pillTxt, lotMethod === m.key && s.pillTxtActive]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Value input OR balance based info */}
          {lotMethod === 'balance_based' ? (
            <View style={s.infoBox}>
              <View style={s.infoIconRow}>
                <Icon
                  name="info"
                  size={14}
                  color={colors.primary}
                  strokeWidth={2}
                />
                <Text style={s.infoTitle}>Balance Based</Text>
              </View>
              <Text style={s.infoTxt}>{BALANCE_BASED_INFO}</Text>
            </View>
          ) : (
            <View>
              <Text style={s.fieldLabel}>
                {lotMethod === 'fix_lot'
                  ? 'Fixed Lot Size'
                  : 'Multiplier Value'}
              </Text>
              <TextInput
                style={[s.input, valFocused && s.inputFocused]}
                value={lotValue}
                onChangeText={setLotValue}
                keyboardType="decimal-pad"
                placeholder={lotMethod === 'fix_lot' ? '0.01' : '1'}
                placeholderTextColor={colors.textPlaceholder}
                onFocus={() => setValFocused(true)}
                onBlur={() => setValFocused(false)}
                selectTextOnFocus
              />
            </View>
          )}

          {/* Buttons */}
          <View style={s.btnRow}>
            <TouchableOpacity style={s.btnCancel} onPress={onClose}>
              <Text style={s.btnCancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                s.btnAdd,
                (!selectedBroker || adding) && { opacity: 0.5 },
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
    paddingBottom: 40,
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

  // Field
  fieldLabel: {
    fontSize: typography.xs + 1,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.md,
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

  // Dropdown
  dropList: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.textMuted,
    borderRadius: 8,
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
    borderBottomColor: colors.textMuted,
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

  // Pills
  pills: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 4,
  },
  pill: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 12,
  },
  pillTxt: {
    fontSize: typography.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pillTxtActive: { color: colors.primaryText },

  // Input
  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  inputFocused: { borderColor: colors.primary },

  // Balance based info
  infoBox: {
    backgroundColor: 'rgba(74,222,128,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.2)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontSize: typography.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  infoTxt: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Buttons
  btnRow: { flexDirection: 'row', gap: spacing.sm },
  btnCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: spacing.sm + 2,
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
    borderRadius: 10,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  btnAddTxt: {
    fontSize: typography.sm,
    fontWeight: '700',
    color: colors.primaryText,
  },
});
