import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Input from '../common/Input';
import Button from '../common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { reconnectBroker } from '../../services/accountService';
import { useAlert } from '../common/AlertContext';
import { useLoadingLock } from '../../context/LoadingLockContext';

export default function ReconnectModal({ visible, onClose, item }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();
  const { withLock } = useLoadingLock();

  const handleReconnect = () => {
    withLock(async () => {
      if (!password.trim()) {
        showAlert('Error', 'Password is required.');
        return;
      }
      setLoading(true);
      try {
        const res = await reconnectBroker(
          item.broker_id,
          password,
          item.is_host_based ?? false,
        );
        if (res?.status === true) {
          showAlert('Success', 'Account reconnected successfully!');
          setPassword('');
          onClose(true);
        } else {
          showAlert('Error', res?.msg || 'Failed to reconnect.');
        }
      } catch (e) {
        showAlert('Error', e?.msg || 'Network error.');
      } finally {
        setLoading(false);
      }
    });
  };

  const handleClose = () => {
    setPassword('');
    onClose(false);
  };

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
            <Text style={s.title}>Reconnect Account</Text>
            <TouchableOpacity onPress={handleClose}>
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

          <Input
            label="Password"
            placeholder="Enter account password"
            value={password}
            onChangeText={setPassword}
            password
          />

          <View style={s.btnRow}>
            <Button
              label="Cancel"
              variant="outline"
              onPress={handleClose}
              style={{ flex: 1 }}
            />
            <Button
              label="Reconnect"
              variant="primary"
              onPress={handleReconnect}
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
  btnRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
});
