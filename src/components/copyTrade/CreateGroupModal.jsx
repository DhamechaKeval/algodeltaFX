import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useLoadingLock } from '../../context/LoadingLockContext';

export default function CreateGroupModal({
  visible,
  onClose,
  onSubmit,
  editGroup,
}) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const { withLock } = useLoadingLock();
  const isEdit = !!editGroup;

  useEffect(() => {
    if (visible) setName(editGroup?.group_name || '');
  }, [visible, editGroup]);

  const handleSubmit = () =>
    withLock(async () => {
      if (!name.trim()) return;
      setLoading(true);
      await onSubmit(name.trim());
      setLoading(false);
    });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.sheet}>
          <Text style={s.title}>{isEdit ? 'Edit Group' : 'Create Group'}</Text>
          <Text style={s.label}>Group Name</Text>
          <TextInput
            style={[s.input, focused && s.inputFocused]}
            placeholder="Enter group name"
            placeholderTextColor={colors.textPlaceholder}
            value={name}
            onChangeText={setName}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoCapitalize="none"
          />
          <View style={s.row}>
            <TouchableOpacity style={s.btnOutline} onPress={onClose}>
              <Text style={s.btnOutlineTxt}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                s.btnPrimary,
                (!name.trim() || loading) && { opacity: 0.6 },
              ]}
              onPress={handleSubmit}
              disabled={!name.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.primaryText} />
              ) : (
                <Text style={s.btnPrimaryTxt}>
                  {isEdit ? 'Update Group' : 'Create Group'}
                </Text>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.md,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  inputFocused: { borderColor: colors.primary },
  row: { flexDirection: 'row', gap: spacing.md },
  btnOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  btnOutlineTxt: {
    fontSize: typography.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  btnPrimaryTxt: {
    fontSize: typography.sm,
    fontWeight: '700',
    color: colors.primaryText,
  },
});
