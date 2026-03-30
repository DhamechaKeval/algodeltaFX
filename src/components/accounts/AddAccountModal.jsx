import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import Input from '../common/Input';
import Button from '../common/Button';
import { accountStyles } from '../../styles/accounts.styles';

// Duration options matching web app
const DURATIONS = [
  { label: 'Free Demo', value: 'free_demo' },
  { label: '1 Month', value: '1_month' },
  { label: '3 Months', value: '3_months' },
  { label: '6 Months', value: '6_months' },
  { label: '1 Year', value: '1_year' },
];

const INITIAL = {
  tab: 'server', // 'server' | 'host'
  fx_login: '',
  fx_password: '',
  nic_name: '',
  fx_server: '',
  fx_host: '',
  fx_port: '',
  duration: 'free_demo',
  auto_renew: true,
};

export default function AddAccountModal({ visible, onClose, onAdd, loading }) {
  const [form, setForm] = useState(INITIAL);
  const [showDuration, setShowDuration] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleAdd = async () => {
    if (!form.fx_login.trim()) {
      Alert.alert('Error', 'MT5 Id is required.');
      return;
    }
    if (!form.fx_password.trim()) {
      Alert.alert('Error', 'Password is required.');
      return;
    }

    // Build body exactly as API expects
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
      Alert.alert('Error', result?.message || 'Something went wrong.');
    }
  };

  const handleClose = () => {
    setForm(INITIAL);
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

          {/* Tab bar */}
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
            {/* MT5 Id → fx_login */}
            <Input
              label="MT5 Id"
              placeholder="Enter MT5 Id"
              value={form.fx_login}
              onChangeText={v => set('fx_login', v)}
              keyboardType="numeric"
            />

            {/* Password → fx_password */}
            <Input
              label="Password"
              placeholder="Enter Password"
              value={form.fx_password}
              onChangeText={v => set('fx_password', v)}
              password
            />

            {/* Server tab: fx_server | Host tab: fx_host + fx_port */}
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

            {/* Nick Name → nic_name */}
            <Input
              label="Nick Name"
              placeholder="Enter Nick Name"
              value={form.nic_name}
              onChangeText={v => set('nic_name', v)}
            />

            {/* Duration picker */}
            <Text style={accountStyles.tabTxt}>Select Duration</Text>
            <TouchableOpacity
              style={[
                accountStyles.tabBtn,
                {
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: '#1f2d42',
                  borderRadius: 10,
                  padding: 12,
                  marginTop: 6,
                  marginBottom: 14,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                },
              ]}
              onPress={() => setShowDuration(v => !v)}
            >
              <Text style={{ color: '#fff', fontSize: 13 }}>
                {DURATIONS.find(d => d.value === form.duration)?.label ||
                  'Select Duration'}
              </Text>
              <Text style={{ color: '#8a9ab5' }}>▾</Text>
            </TouchableOpacity>

            {showDuration &&
              DURATIONS.map(d => (
                <TouchableOpacity
                  key={d.value}
                  onPress={() => {
                    set('duration', d.value);
                    setShowDuration(false);
                  }}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    backgroundColor:
                      form.duration === d.value
                        ? 'rgba(74,222,128,0.1)'
                        : 'transparent',
                    borderRadius: 8,
                    marginBottom: 2,
                  }}
                >
                  <Text
                    style={{
                      color: form.duration === d.value ? '#4ade80' : '#8a9ab5',
                      fontSize: 13,
                    }}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}

            {/* Auto Renew → auto_renew */}
            <View style={accountStyles.switchRow}>
              <Switch
                value={form.auto_renew}
                onValueChange={v => set('auto_renew', v)}
                trackColor={{ false: '#2d3f5a', true: '#4ade80' }}
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
