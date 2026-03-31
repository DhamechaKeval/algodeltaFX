import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import Input from '../common/Input';
import Button from '../common/Button';
import { accountStyles } from '../../styles/accounts.styles';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const DURATIONS = [
  { label: 'Free Demo', value: 'free_demo' },
  { label: '1 Month', value: '1_month' },
  { label: '3 Months', value: '3_months' },
  { label: '6 Months', value: '6_months' },
  { label: '1 Year', value: '1_year' },
];

const INITIAL = {
  tab: 'server',
  fx_login: '',
  fx_password: '',
  nic_name: '',
  fx_server: '',
  fx_host: '',
  fx_port: '443',
  duration: 'free_demo',
  auto_renew: true,
};

export default function AddAccountModal({ visible, onClose, onAdd, loading }) {
  const [form, setForm] = useState(INITIAL);
  const [showDuration, setShowDuration] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const selectedDuration =
    DURATIONS.find(d => d.value === form.duration)?.label || 'Select Duration';

  const handleAdd = async () => {
    if (!form.fx_login.trim()) {
      Alert.alert('Error', 'MT5 Id is required.');
      return;
    }
    if (!form.fx_password.trim()) {
      Alert.alert('Error', 'Password is required.');
      return;
    }
    if (form.tab === 'server' && !form.fx_server.trim()) {
      Alert.alert('Error', 'Server Name is required.');
      return;
    }
    if (form.tab === 'host' && !form.fx_host.trim()) {
      Alert.alert('Error', 'Host is required.');
      return;
    }

    const body = {
      fx_login: form.fx_login.trim(),
      fx_password: form.fx_password,
      nic_name: form.nic_name.trim(),
      duration: form.duration,
      auto_renew: form.auto_renew,
      is_host_based: form.tab === 'host',
      ...(form.tab === 'server'
        ? { fx_server: form.fx_server.trim() }
        : {
            fx_host: form.fx_host.trim(),
            fx_port: parseInt(form.fx_port) || 443,
          }),
    };

    const result = await onAdd(body);
    if (result?.success) {
      setForm(INITIAL);
    } else {
      Alert.alert('Failed', result?.message || 'Something went wrong.');
    }
  };

  const handleClose = () => {
    setForm(INITIAL);
    setShowDuration(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={accountStyles.overlay}>
        <View style={accountStyles.sheet}>
          {/* Header */}
          <View style={accountStyles.modalHeader}>
            <Text style={accountStyles.modalTitle}>Add Account</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={accountStyles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Bar */}
          <View style={accountStyles.tabBar}>
            {['server', 'host'].map(t => (
              <TouchableOpacity
                key={t}
                style={[
                  accountStyles.tabBtn,
                  form.tab === t && accountStyles.tabActive,
                ]}
                onPress={() => set('tab', t)}
              >
                <Text
                  style={[
                    accountStyles.tabTxt,
                    form.tab === t && accountStyles.tabTxtActive,
                  ]}
                >
                  {t === 'server' ? 'Connect With Server' : 'Connect With Host'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Input
              label="MT5 Id"
              placeholder="Enter MT5 Id"
              value={form.fx_login}
              onChangeText={v => set('fx_login', v)}
              keyboardType="numeric"
            />

            <Input
              label="Password"
              placeholder="Enter Password"
              value={form.fx_password}
              onChangeText={v => set('fx_password', v)}
              password
            />

            {form.tab === 'server' ? (
              <Input
                label="Server Name"
                placeholder="e.g. MetaQuotes-Demo"
                value={form.fx_server}
                onChangeText={v => set('fx_server', v)}
              />
            ) : (
              <View style={accountStyles.twoCol}>
                <View style={{ flex: 2 }}>
                  <Input
                    label="Host"
                    placeholder="Enter Host IP"
                    value={form.fx_host}
                    onChangeText={v => set('fx_host', v)}
                  />
                </View>
                <View style={{ width: spacing.sm }} />
                <View style={{ flex: 1 }}>
                  <Input
                    label="Port"
                    placeholder="443"
                    value={form.fx_port}
                    onChangeText={v => set('fx_port', v)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}

            <Input
              label="Nick Name"
              placeholder="Enter Nick Name"
              value={form.nic_name}
              onChangeText={v => set('nic_name', v)}
            />

            {/* Duration Picker */}
            <Text style={mStyles.label}>Select Duration</Text>
            <TouchableOpacity
              style={mStyles.pickerBtn}
              onPress={() => setShowDuration(v => !v)}
            >
              <Text style={mStyles.pickerText}>{selectedDuration}</Text>
              <Text style={mStyles.pickerArrow}>
                {showDuration ? '▴' : '▾'}
              </Text>
            </TouchableOpacity>

            {showDuration && (
              <View style={mStyles.dropDown}>
                {DURATIONS.map(d => (
                  <TouchableOpacity
                    key={d.value}
                    style={[
                      mStyles.dropItem,
                      form.duration === d.value && mStyles.dropItemActive,
                    ]}
                    onPress={() => {
                      set('duration', d.value);
                      setShowDuration(false);
                    }}
                  >
                    <Text
                      style={[
                        mStyles.dropItemText,
                        form.duration === d.value && { color: colors.primary },
                      ]}
                    >
                      {d.label}
                    </Text>
                    {form.duration === d.value && (
                      <Text style={{ color: colors.primary }}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Auto Renew */}
            <View style={accountStyles.switchRow}>
              <Switch
                value={form.auto_renew}
                onValueChange={v => set('auto_renew', v)}
                trackColor={{ false: colors.borderLight, true: colors.primary }}
                thumbColor="#fff"
              />
              <Text style={accountStyles.switchLabel}>Auto Renew</Text>
            </View>

            {/* Buttons */}
            <View style={accountStyles.modalBtnRow}>
              <Button
                label="Cancel"
                variant="outline"
                onPress={handleClose}
                style={{ flex: 1 }}
              />
              <Button
                label="Add"
                variant="primary"
                onPress={handleAdd}
                loading={loading}
                style={{ flex: 1 }}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const mStyles = StyleSheet.create({
  label: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  pickerText: { fontSize: typography.md, color: colors.textPrimary },
  pickerArrow: { fontSize: typography.sm, color: colors.textSecondary },
  dropDown: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropItemActive: { backgroundColor: 'rgba(74,222,128,0.08)' },
  dropItemText: { fontSize: typography.md, color: colors.textSecondary },
});
