import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from '../common/Icon';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { updateGroupBroker } from '../../services/copyTradeService';

const METHODS = [
  { key: 'multiplier', label: 'Multiplier', default: '1' },
  { key: 'fix_lot', label: 'Fix Lot', default: '0.01' },
  { key: 'balance_based', label: 'Balance Based', default: null },
];

const BALANCE_BASED_INFO =
  "When you select the Balance Based option, the master account's balance is used as the reference for copying trades to the child account. This means the child account's trade size is adjusted proportionally based on the balance ratio between the child and the master account.";

function getMethodFromItem(item) {
  if (item?.is_balance_based) return 'balance_based';
  if (item?.is_fix_lot) return 'fix_lot';
  return 'multiplier';
}

function getValueFromItem(item, method) {
  if (method === 'balance_based') return null;
  if (method === 'fix_lot') return String(item?.fix_lot ?? '0.01');
  return String(item?.fix_lot ?? '1');
}

export default function MultiplierModal({ visible, item, onClose, onSaved }) {
  const [method, setMethod] = useState('multiplier');
  const [value, setValue] = useState('1');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const m = getMethodFromItem(item);
    setMethod(m);
    setValue(getValueFromItem(item, m) ?? '1');
  }, [visible, item]);

  const handleMethodChange = m => {
    setMethod(m);
    if (m === 'multiplier') setValue('1');
    else if (m === 'fix_lot') setValue('0.01');
    else setValue(''); // balance_based — no input
  };

  const handleSave = async () => {
    const gbId = item?.group_broker_id ?? item?.id;
    if (!gbId) {
      Alert.alert('Error', 'Cannot identify broker record.');
      return;
    }

    // Validate only for non-balance-based
    if (method !== 'balance_based') {
      const numVal = Number(value);
      if (!value.trim() || isNaN(numVal) || numVal <= 0) {
        Alert.alert('Invalid', 'Please enter a valid value greater than 0.');
        return;
      }
    }

    setLoading(true);
    try {
      const numVal = method !== 'balance_based' ? Number(value) : 0;
      const payload = {
        fix_lot: numVal,
        is_fix_lot: method === 'fix_lot',
        is_balance_based: method === 'balance_based',
      };
      const res = await updateGroupBroker(gbId, payload);
      if (res?.status === true) {
        onSaved && onSaved(method, numVal);
        onClose();
      } else {
        Alert.alert('Error', res?.message || 'Failed to update.');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.sheet}>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Lot Sizing Method</Text>
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

          {/* Method pills */}
          <View style={s.pills}>
            {METHODS.map(m => (
              <TouchableOpacity
                key={m.key}
                style={[s.pill, method === m.key && s.pillActive]}
                onPress={() => handleMethodChange(m.key)}
              >
                <Text style={[s.pillTxt, method === m.key && s.pillTxtActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Input or info box */}
          {method === 'balance_based' ? (
            /* Balance Based — non-editable info box */
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
            /* Multiplier / Fix Lot — editable input */
            <View>
              <Text style={s.inputLabel}>
                {method === 'fix_lot' ? 'Fixed Lot Size' : 'Multiplier Value'}
              </Text>
              <TextInput
                style={[s.input, focused && s.inputFocused]}
                value={value}
                onChangeText={setValue}
                keyboardType="decimal-pad"
                placeholder={method === 'fix_lot' ? '0.01' : '1'}
                placeholderTextColor={colors.textPlaceholder}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                selectTextOnFocus
              />
              <Text style={s.hint}>
                {method === 'multiplier'
                  ? 'Copies trades with lot size × multiplier. Default: 1 (same lot as master).'
                  : 'Always copies with this exact fixed lot size. Default: 0.01 (micro lot).'}
              </Text>
            </View>
          )}

          {/* Buttons */}
          <View style={s.btnRow}>
            <TouchableOpacity
              style={s.btnCancel}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={s.btnCancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btnSave, loading && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.primaryText} />
              ) : (
                <Text style={s.btnSaveTxt}>Save</Text>
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
  sheet: {
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

  // Pills
  pills: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.base },
  pill: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillTxt: {
    fontSize: typography.xs + 1,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pillTxtActive: { color: colors.primaryText },

  // Input
  inputLabel: {
    fontSize: typography.xs + 1,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.base,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  inputFocused: { borderColor: colors.primary },
  hint: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginBottom: spacing.base,
    lineHeight: 16,
  },

  // Balance based info box
  infoBox: {
    backgroundColor: 'rgba(74,222,128,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.2)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.base,
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
  btnSave: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  btnSaveTxt: {
    fontSize: typography.sm,
    fontWeight: '700',
    color: colors.primaryText,
  },
});
