import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import Icon from '../common/Icon';
import Button from '../common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { modifyOrder } from '../../services/accountService';
import { useAlert } from '../common/AlertContext';
import { useLoadingLock } from '../../context/LoadingLockContext';

export default function EditOrderModal({
  visible,
  onClose,
  position,
  brokerId,
}) {
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const { showAlert } = useAlert();
  const { withLock } = useLoadingLock();

  useEffect(() => {
    if (visible && position) {
      setSl(position?.sl ? String(position.sl) : '');
      setTp(position?.tp ? String(position.tp) : '');
    }
  }, [visible, position]);

  const handleSubmit = () => {
    withLock(async () => {
      setLoading(true);
      try {
        const res = await modifyOrder({
          ticket_id: position?.ticket || position?.id,
          broker_id: brokerId,
          price: position?.price_open ?? position?.price ?? 0,
          sl: sl.trim() ? Number(sl) : 0,
          tp: tp.trim() ? Number(tp) : 0,
        });
        if (res?.status === true) {
          showAlert('Success', 'Order modified successfully!');
          onClose(true);
        } else {
          showAlert('Error', res?.msg || 'Failed to modify order.');
        }
      } catch (e) {
        showAlert('Error', e?.msg || 'Network error.');
      } finally {
        setLoading(false);
      }
    });
  };
  const handleClose = () => {
    setSl('');
    setTp('');
    setFocused(null);
    onClose(false);
  };

  const iStyle = name => [s.input, focused === name && s.inputFocused];

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
            <Text style={s.title}>Edit Order</Text>
            <TouchableOpacity onPress={handleClose}>
              <Icon
                name="x"
                size={20}
                color={colors.textSecondary}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>

          {position && (
            <View style={s.posInfo}>
              <Text style={s.posSymbol}>{position?.symbol}</Text>
              <Text style={s.posTicket}>
                #{position?.ticket || position?.id}
              </Text>
              <View style={position?.type === 0 ? s.buy : s.sell}>
                <Text style={position?.type === 0 ? s.buyTxt : s.sellTxt}>
                  {position?.type === 0 ? 'BUY' : 'SELL'}
                </Text>
              </View>
            </View>
          )}

          <Text style={s.label}>Stop Loss (SL)</Text>
          <TextInput
            style={iStyle('sl')}
            placeholder="Not Set"
            placeholderTextColor={colors.textPlaceholder}
            value={sl}
            onChangeText={setSl}
            keyboardType="decimal-pad"
            onFocus={() => setFocused('sl')}
            onBlur={() => setFocused(null)}
          />

          <Text style={s.label}>Target Profit (TP)</Text>
          <TextInput
            style={iStyle('tp')}
            placeholder="Not Set"
            placeholderTextColor={colors.textPlaceholder}
            value={tp}
            onChangeText={setTp}
            keyboardType="decimal-pad"
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
  posInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgInput,
    borderRadius: spacing.radius.md,
    padding: spacing.md,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  posSymbol: {
    fontSize: typography.md,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  posTicket: { fontSize: typography.xs, color: colors.textMuted },
  buy: {
    backgroundColor: 'rgba(74,222,128,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
    borderRadius: spacing.radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  sell: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: spacing.radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  buyTxt: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  sellTxt: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.error,
  },
  label: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
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
    marginBottom: spacing.md,
  },
  inputFocused: { borderColor: colors.primary },
  btnRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
});
