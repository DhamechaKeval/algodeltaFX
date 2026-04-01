import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import Icon from '../common/Icon';
import Button from '../common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { setSlTp } from '../../services/accountService';

export default function DaySlTpModal({ visible, onClose, item }) {
  const [slEnabled, setSlEnabled] = useState(false);
  const [tpEnabled, setTpEnabled] = useState(false);
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  useEffect(() => {
    if (visible && item) {
      const hasSl = item.day_sl && item.day_sl > 0;
      const hasTp = item.day_tp && item.day_tp > 0;
      setSlEnabled(!!hasSl);
      setTpEnabled(!!hasTp);
      setSl(hasSl ? String(item.day_sl) : '');
      setTp(hasTp ? String(item.day_tp) : '');
    }
  }, [visible, item]);

  const handleSubmit = async () => {
    if (slEnabled && !sl.trim()) {
      Alert.alert('Error', 'Please enter a Stop Loss value.');
      return;
    }
    if (tpEnabled && !tp.trim()) {
      Alert.alert('Error', 'Please enter a Target Profit value.');
      return;
    }
    setLoading(true);
    try {
      const res = await setSlTp(
        item.broker_id,
        !!(slEnabled || tpEnabled),
        slEnabled && sl.trim() ? Number(sl) : 0,
        tpEnabled && tp.trim() ? Number(tp) : 0,
      );
      if (res?.status === true) {
        Alert.alert('Success', 'Day SL & TP updated successfully!');
        onClose(true);
      } else {
        Alert.alert('Error', res?.message || 'Failed to update.');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSl('');
    setTp('');
    setSlEnabled(false);
    setTpEnabled(false);
    setFocused(null);
    onClose(false);
  };

  const iStyle = (name, enabled) => [
    s.input,
    focused === name && enabled && s.inputFocused,
    !enabled && s.inputDisabled,
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.header}>
            <Text style={s.title}>Add Day SL & TP</Text>
            <TouchableOpacity onPress={handleClose}>
              <Icon
                name="x"
                size={20}
                color={colors.textSecondary}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>

          <View style={s.fieldRow}>
            <Text style={s.fieldLabel}>Stop Loss (SL)</Text>
            <Switch
              value={slEnabled}
              onValueChange={v => setSlEnabled(!!v)}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <TextInput
            style={iStyle('sl', slEnabled)}
            placeholder="Enter Stop Loss"
            placeholderTextColor={colors.textPlaceholder}
            value={sl}
            onChangeText={setSl}
            keyboardType="decimal-pad"
            editable={slEnabled === true}
            onFocus={() => setFocused('sl')}
            onBlur={() => setFocused(null)}
          />

          <View style={s.fieldRow}>
            <Text style={s.fieldLabel}>Target Profit (TP)</Text>
            <Switch
              value={tpEnabled}
              onValueChange={v => setTpEnabled(!!v)}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <TextInput
            style={iStyle('tp', tpEnabled)}
            placeholder="Enter Target Profit"
            placeholderTextColor={colors.textPlaceholder}
            value={tp}
            onChangeText={setTp}
            keyboardType="decimal-pad"
            editable={tpEnabled === true}
            onFocus={() => setFocused('tp')}
            onBlur={() => setFocused(null)}
          />

          <View style={s.btnRow}>
            <Button
              label="Cancel"
              variant="outline"
              onPress={handleClose}
              style={{ flex: 1 }}
            />
            <Button
              label="Submit"
              variant="primary"
              onPress={handleSubmit}
              loading={loading}
              style={{ flex: 1 }}
            />
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    fontSize: typography.md,
    color: colors.textPrimary,
    fontWeight: typography.medium,
  },
  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.md,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  inputFocused: { borderColor: colors.primary },
  inputDisabled: { borderColor: colors.border, opacity: 0.4 },
  btnRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
});
