import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { searchSymbol, placeGroupOrder } from '../../services/copyTradeService';

const ORDER_TYPES = [
  { label: 'BUY', value: 0 },
  { label: 'SELL', value: 1 },
  { label: 'BUY LIMIT', value: 2 },
  { label: 'SELL LIMIT', value: 3 },
  { label: 'BUY STOP', value: 4 },
  { label: 'SELL STOP', value: 5 },
];

export default function PlaceOrderModal({ visible, groupId, onClose }) {
  const [symbol, setSymbol] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [orderType, setOrderType] = useState(0);
  const [showTypes, setShowTypes] = useState(false);
  const [volume, setVolume] = useState('0.01');
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [basket, setBasket] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      setSymbol('');
      setVolume('0.01');
      setSl('');
      setTp('');
      setOrderType(0);
      setBasket(false);
      setSuggestions([]);
      setShowSuggest(false);
      setShowTypes(false);
    }
  }, [visible]);

  const handleSymbolChange = text => {
    const val = text.toUpperCase();
    setSymbol(val);
    setShowSuggest(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length >= 2) {
      debounceRef.current = setTimeout(async () => {
        setSearching(true);
        try {
          const res = await searchSymbol(val.toLowerCase());
          const list = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
            ? res
            : [];
          setSuggestions(
            list
              .map(s =>
                typeof s === 'string' ? s : s?.symbol || s?.name || '',
              )
              .filter(Boolean),
          );
          setShowSuggest(true);
        } catch {
          setSuggestions([]);
        } finally {
          setSearching(false);
        }
      }, 400);
    }
  };

  const handlePlace = async () => {
    if (!symbol.trim() || !volume.trim()) return;
    setLoading(true);
    try {
      const res = await placeGroupOrder({
        group_id: groupId,
        symbol: symbol.trim(),
        type: orderType,
        volume: Number(volume),
        sl: sl ? Number(sl) : 0,
        tp: tp ? Number(tp) : 0,
      });
      if (res?.status === true) {
        onClose(true);
      } else {
        require('react-native').Alert.alert(
          'Error',
          res?.message || 'Failed to place order.',
        );
      }
    } catch (e) {
      require('react-native').Alert.alert(
        'Error',
        e?.message || 'Network error.',
      );
    } finally {
      setLoading(false);
    }
  };

  const iBox = n => [s.inputBox, focused === n && s.inputFocused];
  const selectedType =
    ORDER_TYPES.find(t => t.value === orderType)?.label || 'BUY';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => onClose(false)}
    >
      <View style={s.overlay}>
        <View style={s.sheet}>
          <Text style={s.title}>Place Order</Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Symbol */}
            <Text style={s.label}>Symbol *</Text>
            <View style={iBox('sym')}>
              <TextInput
                style={[s.inputTxt, { flex: 1 }]}
                placeholder="e.g. EURUSD"
                placeholderTextColor={colors.textPlaceholder}
                value={symbol}
                onChangeText={handleSymbolChange}
                autoCapitalize="characters"
                autoCorrect={false}
                onFocus={() => setFocused('sym')}
                onBlur={() => setFocused(null)}
              />
              {searching ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : null}
            </View>
            {showSuggest && suggestions.length > 0 && (
              <View style={s.dropdown}>
                {suggestions.slice(0, 6).map((sym, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      s.dropItem,
                      i === suggestions.length - 1 && { borderBottomWidth: 0 },
                    ]}
                    onPress={() => {
                      setSymbol(sym.toUpperCase());
                      setShowSuggest(false);
                    }}
                  >
                    <Text style={s.dropTxt}>{sym.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Type + Volume */}
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Order Type *</Text>
                <TouchableOpacity
                  style={iBox('type')}
                  onPress={() => setShowTypes(v => !v)}
                >
                  <Text
                    style={[s.inputTxt, { flex: 1, color: colors.textPrimary }]}
                  >
                    {selectedType}
                  </Text>
                </TouchableOpacity>
                {showTypes && (
                  <View style={s.dropdown}>
                    {ORDER_TYPES.map((t, i) => (
                      <TouchableOpacity
                        key={t.value}
                        style={[
                          s.dropItem,
                          i === ORDER_TYPES.length - 1 && {
                            borderBottomWidth: 0,
                          },
                          orderType === t.value && {
                            backgroundColor: 'rgba(74,222,128,0.08)',
                          },
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
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Volume *</Text>
                <View style={iBox('vol')}>
                  <TextInput
                    style={[s.inputTxt, { flex: 1 }]}
                    placeholder="0.01"
                    placeholderTextColor={colors.textPlaceholder}
                    value={volume}
                    onChangeText={setVolume}
                    keyboardType="decimal-pad"
                    onFocus={() => setFocused('vol')}
                    onBlur={() => setFocused(null)}
                  />
                </View>
              </View>
            </View>

            {/* SL + TP */}
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Stop Loss</Text>
                <View style={iBox('sl')}>
                  <TextInput
                    style={[s.inputTxt, { flex: 1 }]}
                    placeholder="0"
                    placeholderTextColor={colors.textPlaceholder}
                    value={sl}
                    onChangeText={setSl}
                    keyboardType="decimal-pad"
                    onFocus={() => setFocused('sl')}
                    onBlur={() => setFocused(null)}
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Take Profit</Text>
                <View style={iBox('tp')}>
                  <TextInput
                    style={[s.inputTxt, { flex: 1 }]}
                    placeholder="0"
                    placeholderTextColor={colors.textPlaceholder}
                    value={tp}
                    onChangeText={setTp}
                    keyboardType="decimal-pad"
                    onFocus={() => setFocused('tp')}
                    onBlur={() => setFocused(null)}
                  />
                </View>
              </View>
            </View>

            {/* Basket toggle */}
            <View style={s.basketRow}>
              <Text style={s.label}>Basket</Text>
              <Switch
                value={basket}
                onValueChange={setBasket}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={s.btnRow}>
              <TouchableOpacity
                style={s.btnOutline}
                onPress={() => onClose(false)}
              >
                <Text style={s.btnOutlineTxt}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btnPrimary, loading && { opacity: 0.7 }]}
                onPress={handlePlace}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.primaryText} />
                ) : (
                  <Text style={s.btnPrimaryTxt}>Place Order</Text>
                )}
              </TouchableOpacity>
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
    paddingBottom: spacing.xxxl,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  label: {
    fontSize: typography.xs + 1,
    color: colors.textSecondary,
    fontWeight: '600',
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
    height: 44,
    marginBottom: spacing.md,
  },
  inputFocused: { borderColor: colors.primary },
  inputTxt: { fontSize: typography.sm, color: colors.textPrimary },
  row: { flexDirection: 'row', gap: spacing.sm },
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
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropTxt: { fontSize: typography.sm, color: colors.textPrimary },
  basketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  btnRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
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
