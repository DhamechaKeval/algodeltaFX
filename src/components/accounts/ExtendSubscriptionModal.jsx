import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Button from '../common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { extendBroker } from '../../services/accountService';

const DURATIONS = [
  { label: 'Free Demo', value: 'free_demo' },
  { label: '1 Month', value: '1_month' },
  { label: '3 Months', value: '3_months' },
  { label: '6 Months', value: '6_months' },
  { label: '1 Year', value: '1_year' },
];

export default function ExtendSubscriptionModal({ visible, onClose, item }) {
  const [duration, setDuration] = useState('free_demo');
  const [loading, setLoading] = useState(false);

  const handleExtend = async () => {
    setLoading(true);
    try {
      const res = await extendBroker(item.broker_id, duration);
      if (res?.status === true) {
        Alert.alert('Success', 'Subscription extended successfully!');
        onClose(true);
      } else {
        Alert.alert('Error', res?.message || 'Failed to extend subscription.');
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
      onRequestClose={() => onClose(false)}
    >
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.header}>
            <Text style={s.title}>Extend Subscription</Text>
            <TouchableOpacity onPress={() => onClose(false)}>
              <Text style={s.close}>✕</Text>
            </TouchableOpacity>
          </View>

          {item && (
            <View style={s.accountInfo}>
              <View
                style={[
                  s.dot,
                  {
                    backgroundColor: item.is_connected
                      ? colors.primary
                      : colors.textMuted,
                  },
                ]}
              />
              <Text style={s.accountName} numberOfLines={1}>
                {item.broker_combine_name || item.nic_name}
              </Text>
            </View>
          )}

          <Text style={s.label}>Select Duration</Text>
          <View style={s.durationList}>
            {DURATIONS.map(d => (
              <TouchableOpacity
                key={d.value}
                style={[
                  s.durationItem,
                  duration === d.value && s.durationActive,
                ]}
                onPress={() => setDuration(d.value)}
              >
                <View style={[s.radio, duration === d.value && s.radioActive]}>
                  {duration === d.value && <View style={s.radioDot} />}
                </View>
                <Text
                  style={[
                    s.durationText,
                    duration === d.value && s.durationTextActive,
                  ]}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.btnRow}>
            <Button
              label="Cancel"
              variant="outline"
              onPress={() => onClose(false)}
              style={{ flex: 1 }}
            />
            <Button
              label="Extend"
              variant="primary"
              onPress={handleExtend}
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
  close: {
    fontSize: typography.xl,
    color: colors.textSecondary,
    padding: spacing.xs,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bgInput,
    borderRadius: spacing.radius.md,
    padding: spacing.md,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  accountName: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    fontWeight: typography.medium,
    flex: 1,
  },
  label: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  durationList: { marginBottom: spacing.xl, gap: spacing.xs },
  durationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
  },
  durationActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(74,222,128,0.08)',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primary },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  durationText: { fontSize: typography.md, color: colors.textSecondary },
  durationTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.medium,
  },
  btnRow: { flexDirection: 'row', gap: spacing.md },
});
