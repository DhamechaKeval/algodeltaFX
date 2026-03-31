import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from '../common/Icon';
import Button from '../common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { modifyOrder } from '../../services/accountService';

export default function EditOrderModal({
  visible,
  onClose,
  position,
  brokerId,
}) {
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill current SL/TP when modal opens
  useEffect(() => {
    if (visible && position) {
      setSl(position?.sl ? String(position.sl) : '');
      setTp(position?.tp ? String(position.tp) : '');
    }
  }, [visible, position]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const body = {
        ticket_id: position?.ticket || position?.id,
        broker_id: brokerId,
        price: position?.price_open ?? position?.price ?? 0,
        sl: sl.trim() ? Number(sl) : 0,
        tp: tp.trim() ? Number(tp) : 0,
      };
      const res = await modifyOrder(body);
      if (res?.status === true) {
        Alert.alert('Success', 'Order modified successfully!');
        onClose(true);
      } else {
        Alert.alert('Error', res?.message || 'Failed to modify order.');
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
          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Edit Order</Text>
            <TouchableOpacity onPress={handleClose} style={s.closeBtn}>
              <Icon
                name="x"
                size={20}
                color={colors.textSecondary}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>

          {/* Position info */}
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

          {/* SL input */}
          <Text style={s.label}>Stop Loss (SL)</Text>
          <TextInput
            style={s.input}
            placeholder="Not Set"
            placeholderTextColor={colors.textPlaceholder}
            value={sl}
            onChangeText={setSl}
            keyboardType="decimal-pad"
          />

          {/* TP input */}
          <Text style={s.label}>Target Profit (TP)</Text>
          <TextInput
            style={s.input}
            placeholder="Not Set"
            placeholderTextColor={colors.textPlaceholder}
            value={tp}
            onChangeText={setTp}
            keyboardType="decimal-pad"
          />

          {/* Buttons */}
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
  closeBtn: { padding: spacing.xs },
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
  btnRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
});
