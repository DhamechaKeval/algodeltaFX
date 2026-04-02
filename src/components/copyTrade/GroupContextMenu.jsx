import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import Icon from '../common/Icon';

const MENU_ITEMS = [
  {
    key: 'positions',
    label: 'Positions',
    icon: <Icon name="positions" size={16} />,
  },
  {
    key: 'pending',
    label: 'Pending Orders',
    icon: <Icon name="pending-orders" size={16} />,
  },
  {
    key: 'squareoff',
    label: 'Square Off All',
    icon: <Icon name="square-off" size={16} />,
  },
  {
    key: 'cancelall',
    label: 'Cancel All',
    icon: <Icon name="cancel-all" size={16} />,
  },
  { key: 'edit', label: 'Edit Group', icon: <Icon name="edit" size={16} /> },
  {
    key: 'delete',
    label: 'Delete Group',
    icon: <Icon name="trash" size={16} color={colors.error} />,
    danger: true,
  },
];

export default function GroupContextMenu({ visible, onClose, onSelect }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <View style={s.menu}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.key}
              style={[
                s.item,
                i === MENU_ITEMS.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={() => {
                onSelect(item.key);
                onClose();
              }}
            >
              <Text style={s.icon}>{item.icon}</Text>
              <Text style={[s.label, item.danger && { color: colors.error }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  menu: {
    backgroundColor: colors.bgCard,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    width: '80%',
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  icon: { fontSize: 16, width: 24, textAlign: 'center' },
  label: { fontSize: typography.md, color: colors.textPrimary },
});
