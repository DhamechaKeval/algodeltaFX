import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function ConfirmMasterModal({
  visible,
  brokerName,
  loading,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={s.overlay}>
        <View style={s.card}>
          <Text style={s.title}>Confirm Master Connect</Text>
          <Text style={s.msg}>
            Are you sure you want to connect this master account:{'\n'}
            <Text style={s.broker}>{brokerName}</Text>?
          </Text>
          <View style={s.row}>
            <TouchableOpacity style={s.btnNo} onPress={onCancel}>
              <Text style={s.btnNoTxt}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.btnYes}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.primaryText} />
              ) : (
                <Text style={s.btnYesTxt}>Yes</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: spacing.radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
  },
  title: {
    fontSize: typography.base,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  msg: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  broker: { color: colors.primary, fontWeight: '600' },
  row: { flexDirection: 'row', gap: spacing.md, justifyContent: 'flex-end' },
  btnNo: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnNoTxt: {
    fontSize: typography.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  btnYes: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radius.md,
    backgroundColor: colors.primary,
  },
  btnYesTxt: {
    fontSize: typography.sm,
    fontWeight: '700',
    color: colors.primaryText,
  },
});
