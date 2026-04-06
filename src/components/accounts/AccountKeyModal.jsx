import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Switch,
  Clipboard,
  Linking,
} from 'react-native';
import Icon from '../common/Icon';
import Button from '../common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { updateCallbackUrl } from '../../services/accountService';
import { useAlert } from '../common/AlertContext';
import { useLoadingLock } from '../../context/LoadingLockContext';

const DOC_URL =
  'https://docs.algodeltafx.com/#7319f8b2-f790-4587-a22d-48e9c338cd2d';

export default function AccountKeyModal({ visible, onClose, item }) {
  const [showKey, setShowKey] = useState(false);
  const { withLock } = useLoadingLock();
  const [callbackOn, setCallbackOn] = useState(!!item?.broker_callback_url);
  const [callbackUrl, setCallbackUrl] = useState(
    item?.broker_callback_url || '',
  );
  const [saving, setSaving] = useState(false);
  const { showAlert } = useAlert();

  const token = item?.broker_token || '';
  const masked =
    token.length > 0 ? '•'.repeat(Math.min(token.length, 48)) : '—';

  const handleCopy = () => {
    Clipboard.setString(token);
    showAlert('Copied', 'Account key copied to clipboard.');
  };

  const handleViewDocs = () => {
    Linking.openURL(DOC_URL).catch(() =>
      showAlert('Error', 'Could not open documentation link.'),
    );
  };

  const handleToggleCallback = val => {
    setCallbackOn(val);
    if (!val) setCallbackUrl('');
  };

  const handleSave = () =>
    withLock(async () => {
      if (callbackOn && !callbackUrl.trim()) {
        showAlert('Error', 'Please enter a callback URL.');
        return;
      }
      setSaving(true);
      try {
        const url =
          callbackOn && callbackUrl.trim() ? callbackUrl.trim() : null;
        const res = await updateCallbackUrl(item.broker_id, url);
        if (res?.status === true) {
          showAlert('Success', 'Callback URL updated.');
        } else {
          showAlert('Error', res?.msg || 'Failed to update.');
        }
      } catch (e) {
        showAlert('Error', e?.msg || 'Network error.');
      } finally {
        setSaving(false);
      }
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
          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Account Key</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Icon
                name="x"
                size={20}
                color={colors.textSecondary}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>

          {/* Token row */}
          <View style={s.tokenRow}>
            <Text style={s.tokenText} numberOfLines={1}>
              {showKey ? token : masked}
            </Text>
            <View style={s.tokenActions}>
              <TouchableOpacity
                style={[s.iconBtn, s.iconTeal]}
                onPress={() => setShowKey(v => !v)}
              >
                <Icon
                  name={showKey ? 'eye-off' : 'eye'}
                  size={15}
                  color="#1D9E75"
                  strokeWidth={1.8}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.iconBtn, s.iconOrange]}
                onPress={handleCopy}
              >
                <Icon name="copy" size={15} color="#EF9F27" strokeWidth={1.8} />
              </TouchableOpacity>
              <TouchableOpacity style={[s.iconBtn, s.iconPurple]}>
                <Icon
                  name="refresh"
                  size={15}
                  color="#8B5CF6"
                  strokeWidth={1.8}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Callback toggle */}
          <View style={s.callbackRow}>
            <Switch
              value={callbackOn}
              onValueChange={handleToggleCallback}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor="#fff"
            />
            <Text style={s.callbackLabel}>Enable Callback URL</Text>
            <TouchableOpacity onPress={handleViewDocs}>
              <Text style={s.docBtnText}>View Documentation</Text>
            </TouchableOpacity>
          </View>

          {/* Callback URL input */}
          {callbackOn && (
            <>
              <TextInput
                style={s.urlInput}
                placeholder="Enter Callback URL"
                placeholderTextColor={colors.textPlaceholder}
                value={callbackUrl}
                onChangeText={setCallbackUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <Button
                label="Submit"
                variant="primary"
                size="sm"
                onPress={handleSave}
                loading={saving}
                style={{ alignSelf: 'flex-start' }}
              />
            </>
          )}
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
  closeBtn: { padding: spacing.xs },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  tokenText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  tokenActions: { flexDirection: 'row', gap: spacing.xs },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: spacing.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTeal: {
    backgroundColor: 'rgba(29,158,117,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(29,158,117,0.3)',
  },
  iconOrange: {
    backgroundColor: 'rgba(239,159,39,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,159,39,0.3)',
  },
  iconPurple: {
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
  },
  callbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  callbackLabel: {
    flex: 1,
    fontSize: typography.md,
    color: colors.textPrimary,
  },
  docBtnText: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  urlInput: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.md,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
});
