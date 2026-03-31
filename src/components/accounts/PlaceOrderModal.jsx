import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from '../common/Icon';
import Button from '../common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { placeOrder } from '../../services/accountService';
import { apiPost } from '../../services/api';

const ORDER_TYPES = [
  { label: 'BUY', value: 0 },
  { label: 'SELL', value: 1 },
  { label: 'BUY LIMIT', value: 2 },
  { label: 'SELL LIMIT', value: 3 },
  { label: 'BUY STOP', value: 4 },
  { label: 'SELL STOP', value: 5 },
];

export default function PlaceOrderModal({ visible, onClose, brokerId }) {
  const [symbol, setSymbol] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [orderType, setOrderType] = useState(0);
  const [showTypes, setShowTypes] = useState(false);
  const [volume, setVolume] = useState('');
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  // ── Symbol search ─────────────────────────────────────────────
  const doSearch = async query => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggest(false);
      return;
    }
    setSearching(true);
    try {
      // Call directly with lowercase as API expects
      const res = await apiPost('/symbols/searchsymbol', {
        symbol: query.toLowerCase(),
      });

      // Parse every possible response shape
      let list = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (Array.isArray(res?.symbols)) {
        list = res.symbols;
      } else if (Array.isArray(res?.result)) {
        list = res.result;
      }

      // Normalise to string array
      const names = list
        .map(s => {
          if (typeof s === 'string') return s;
          return s?.symbol || s?.name || s?.Symbol || '';
        })
        .filter(Boolean);

      setSuggestions(names);
      setShowSuggest(names.length > 0);
    } catch (e) {
      setSuggestions([]);
      setShowSuggest(false);
    } finally {
      setSearching(false);
    }
  };

  const handleSymbolChange = text => {
    const upper = text.toUpperCase();
    setSymbol(upper);
    setShowSuggest(false);

    // Debounce search
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (upper.trim().length >= 1) {
      debounceRef.current = setTimeout(() => doSearch(upper), 350);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSymbol = sym => {
    setSymbol(sym.toUpperCase());
    setShowSuggest(false);
    setSuggestions([]);
  };

  const handlePlaceOrder = async () => {
    if (!symbol.trim()) {
      Alert.alert('Error', 'Symbol is required.');
      return;
    }
    if (!volume.trim()) {
      Alert.alert('Error', 'Volume is required.');
      return;
    }
    if (isNaN(Number(volume)) || Number(volume) <= 0) {
      Alert.alert('Error', 'Enter a valid volume.');
      return;
    }
    setLoading(true);
    try {
      const body = {
        symbol: symbol.trim().toUpperCase(),
        type: orderType,
        volume: Number(volume),
        broker_id: brokerId,
        ...(sl.trim() && { sl: Number(sl) }),
        ...(tp.trim() && { tp: Number(tp) }),
      };
      const res = await placeOrder(body);
      if (res?.status === true) {
        Alert.alert('Success', 'Order placed successfully!');
        handleClose();
      } else {
        Alert.alert('Error', res?.message || 'Failed to place order.');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSymbol('');
    setVolume('');
    setSl('');
    setTp('');
    setOrderType(0);
    setShowSuggest(false);
    setShowTypes(false);
    setSuggestions([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onClose();
  };

  const selectedType =
    ORDER_TYPES.find(t => t.value === orderType)?.label || 'BUY';

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
            <Text style={s.title}>Place Order</Text>
            <TouchableOpacity onPress={handleClose}>
              <Icon
                name="x"
                size={20}
                color={colors.textSecondary}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {/* ── Symbol ── */}
            <Text style={s.label}>Symbol *</Text>
            <View style={s.inputBox}>
              <TextInput
                style={[s.inputText, { flex: 1 }]}
                placeholder="Type Symbol e.g. BTCUSD"
                placeholderTextColor={colors.textPlaceholder}
                value={symbol}
                onChangeText={handleSymbolChange}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {searching ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Icon
                  name="chevron-down"
                  size={14}
                  color={colors.textSecondary}
                />
              )}
            </View>

            {/* Symbol suggestions */}
            {showSuggest && suggestions.length > 0 && (
              <View style={s.dropdown}>
                {suggestions.slice(0, 8).map((sym, i) => (
                  <TouchableOpacity
                    key={`sym-${i}`}
                    style={[
                      s.dropItem,
                      i === Math.min(suggestions.length, 8) - 1 && {
                        borderBottomWidth: 0,
                      },
                    ]}
                    onPress={() => handleSelectSymbol(sym)}
                  >
                    <Text style={s.dropTxt}>{sym.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* ── Order Type + Volume (equal width) ── */}
            <View style={s.row}>
              <View style={s.col}>
                <Text style={s.label}>Order Type *</Text>
                <TouchableOpacity
                  style={s.inputBox}
                  onPress={() => {
                    setShowTypes(v => !v);
                    setShowSuggest(false);
                  }}
                >
                  <Text
                    style={[
                      s.inputText,
                      { flex: 1, color: colors.textPrimary },
                    ]}
                  >
                    {selectedType}
                  </Text>
                  <Icon
                    name="chevron-down"
                    size={14}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                {showTypes && (
                  <View style={s.dropdown}>
                    {ORDER_TYPES.map((t, i) => (
                      <TouchableOpacity
                        key={`type-${t.value}`}
                        style={[
                          s.dropItem,
                          i === ORDER_TYPES.length - 1 && {
                            borderBottomWidth: 0,
                          },
                          orderType === t.value && s.dropItemActive,
                        ]}
                        onPress={() => {
                          setOrderType(t.value);
                          setShowTypes(false);
                        }}
                      >
                        <Text
                          style={[
                            s.dropTxt,
                            orderType === t.value && { color: colors.primary },
                          ]}
                        >
                          {t.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={s.col}>
                <Text style={s.label}>Volume *</Text>
                <View style={s.inputBox}>
                  <TextInput
                    style={[s.inputText, { flex: 1 }]}
                    placeholder="0.01"
                    placeholderTextColor={colors.textPlaceholder}
                    value={volume}
                    onChangeText={setVolume}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>

            {/* ── SL + TP (equal width) ── */}
            <View style={s.row}>
              <View style={s.col}>
                <Text style={s.label}>Stop Loss (SL)</Text>
                <View style={s.inputBox}>
                  <TextInput
                    style={[s.inputText, { flex: 1 }]}
                    placeholder="Enter Stop Loss"
                    placeholderTextColor={colors.textPlaceholder}
                    value={sl}
                    onChangeText={setSl}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
              <View style={s.col}>
                <Text style={s.label}>Target Profit (TP)</Text>
                <View style={s.inputBox}>
                  <TextInput
                    style={[s.inputText, { flex: 1 }]}
                    placeholder="Enter Target Profit"
                    placeholderTextColor={colors.textPlaceholder}
                    value={tp}
                    onChangeText={setTp}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>

            {/* Buttons */}
            <View style={s.btnRow}>
              <Button
                label="Close"
                variant="outline"
                onPress={handleClose}
                style={{ flex: 1 }}
              />
              <Button
                label="Place Order"
                variant="primary"
                onPress={handlePlaceOrder}
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
    maxHeight: '92%',
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
  label: {
    fontSize: typography.xs + 1,
    color: colors.textSecondary,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    height: 46,
    marginBottom: spacing.md,
  },
  inputText: { fontSize: typography.sm, color: colors.textPrimary },
  row: { flexDirection: 'row', gap: spacing.sm },
  col: { flex: 1 },
  dropdown: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    marginTop: -spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  dropItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropItemActive: { backgroundColor: 'rgba(74,222,128,0.08)' },
  dropTxt: { fontSize: typography.sm, color: colors.textPrimary },
  btnRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
});
