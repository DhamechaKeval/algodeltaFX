import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import Icon from '../common/Icon';
import Button from '../common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { placeOrder } from '../../services/accountService';
import { apiPost } from '../../services/api';
import { useAlert } from '../common/AlertContext';

const ORDER_TYPES = [
  { label: 'BUY', value: 0 },
  { label: 'SELL', value: 1 },
  { label: 'BUY LIMIT', value: 2 },
  { label: 'SELL LIMIT', value: 3 },
  { label: 'BUY STOP', value: 4 },
  { label: 'SELL STOP', value: 5 },
  { label: 'BUY STOP LIMIT', value: 6 },
  { label: 'SELL STOP LIMIT', value: 7 },
];

const needsPrice = [2, 3, 4, 5, 6, 7];
const needsStopLimitPrice = [6, 7];

const STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
};

const getOrderTypeLabel = value =>
  ORDER_TYPES.find(t => t.value === value)?.label ?? 'BUY';

const emptyForm = () => ({
  symbol: '',
  orderType: 0,
  volume: '',
  price: '',
  stopLimitPrice: '',
  sl: '',
  tp: '',
  orderDelay: '1000',
});

// ─── BasketRow ────────────────────────────────────────────────────────────────
function BasketRow({ item, index, total, onMoveUp, onMoveDown, onDelete }) {
  const showPrice = needsPrice.includes(item.orderType);
  const showSLP = needsStopLimitPrice.includes(item.orderType);

  const statusColor =
    item.status === STATUS.SUCCESS
      ? '#4ade80'
      : item.status === STATUS.FAILED
      ? '#f87171'
      : '#94a3b8';

  return (
    <View style={br.row}>
      <Text style={[br.cell, br.cellId]}>{index + 1}</Text>

      <View style={[br.cell, br.cellAction]}>
        <TouchableOpacity
          onPress={() => onMoveUp(index)}
          disabled={index === 0}
          style={br.actionBtn}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Icon
            name="chevron-up"
            size={14}
            color={index === 0 ? '#334155' : '#4ade80'}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onMoveDown(index)}
          disabled={index === total - 1}
          style={br.actionBtn}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Icon
            name="chevron-down"
            size={14}
            color={index === total - 1 ? '#334155' : '#4ade80'}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(index)}
          style={br.actionBtn}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Icon name="trash" size={14} color="#f87171" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <Text style={[br.cell, br.cellSymbol]}>{item.symbol}</Text>
      <Text style={[br.cell, br.cellType]}>
        {getOrderTypeLabel(item.orderType)}
      </Text>
      <Text style={[br.cell, br.cellNum]}>
        {Number(item.volume).toFixed(4)}
      </Text>
      <Text style={[br.cell, br.cellNum]}>{item.sl || '–'}</Text>
      <Text style={[br.cell, br.cellNum]}>{item.tp || '–'}</Text>
      <Text style={[br.cell, br.cellNum]}>
        {showPrice && item.price ? item.price : '–'}
      </Text>
      <Text style={[br.cell, br.cellNum]}>
        {showSLP && item.stopLimitPrice ? item.stopLimitPrice : '–'}
      </Text>

      <View style={[br.cell, br.cellStatus]}>
        <View style={[br.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[br.statusTxt, { color: statusColor }]}>
          {item.status === STATUS.SUCCESS
            ? 'Success'
            : item.status === STATUS.FAILED
            ? 'Failed'
            : 'Pending'}
        </Text>
      </View>
    </View>
  );
}

// ─── PlaceOrderModal ──────────────────────────────────────────────────────────
export default function PlaceOrderModal({
  visible,
  onClose,
  brokerId,
  groupId,
}) {
  const [form, setForm] = useState(emptyForm());
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [showTypes, setShowTypes] = useState(false);
  const [focused, setFocused] = useState(null);
  const { showAlert } = useAlert();

  const [basketEnabled, setBasketEnabled] = useState(false);
  const [basketItems, setBasketItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  // FIX: use form.orderType (not emptyForm.orderType)
  const showPrice = needsPrice.includes(form.orderType);
  const showSLP = needsStopLimitPrice.includes(form.orderType);

  const setField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  // ── symbol search ───────────────────────────────────────────────────────────
  const doSearch = async query => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggest(false);
      return;
    }
    setSearching(true);
    try {
      const res = await apiPost('/symbols/searchsymbol', {
        symbol: query.toLowerCase(),
      });
      const raw = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      const list = raw.map(s => s?.basename || '').filter(Boolean);
      setSuggestions(list);
      setShowSuggest(list.length > 0);
    } catch {
      setSuggestions([]);
      setShowSuggest(false);
    } finally {
      setSearching(false);
    }
  };

  const handleSymbolChange = text => {
    const upper = text.toUpperCase();
    setField('symbol', upper);
    setShowSuggest(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (upper.trim().length >= 1) {
      debounceRef.current = setTimeout(() => doSearch(upper), 350);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSymbol = sym => {
    setField('symbol', sym.toUpperCase());
    setShowSuggest(false);
    setSuggestions([]);
  };

  // ── validation ──────────────────────────────────────────────────────────────
  const validateForm = () => {
    if (!form.symbol.trim()) {
      showAlert('Error', 'Symbol is required.');
      return false;
    }
    if (
      !form.volume.trim() ||
      isNaN(Number(form.volume)) ||
      Number(form.volume) <= 0
    ) {
      showAlert('Error', 'Enter a valid volume.');
      return false;
    }
    if (showPrice && !form.price.trim()) {
      showAlert('Error', 'Price is required for this order type.');
      return false;
    }
    if (showSLP && !form.stopLimitPrice.trim()) {
      showAlert('Error', 'Stop Limit Price is required for this order type.');
      return false;
    }
    return true;
  };

  // ── basket ops ──────────────────────────────────────────────────────────────
  const handleAddToBasket = () => {
    if (!validateForm()) return;
    const newItem = { ...form, id: Date.now(), status: STATUS.PENDING };
    setBasketItems(prev => [...prev, newItem]);
    setForm(f => ({ ...emptyForm(), orderDelay: f.orderDelay }));
    setShowSuggest(false);
    setShowTypes(false);
  };

  const handleMoveUp = index => {
    if (index === 0) return;
    setBasketItems(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const handleMoveDown = index => {
    setBasketItems(prev => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const handleDeleteBasketItem = index =>
    setBasketItems(prev => prev.filter((_, i) => i !== index));

  // ── place order ─────────────────────────────────────────────────────────────
  const buildSingleBody = f => ({
    symbol: f.symbol.trim().toUpperCase(),
    type: f.orderType,
    volume: Number(f.volume),
    broker_id: brokerId,
    ...(needsPrice.includes(f.orderType) &&
      f.price.trim() && { price: Number(f.price) }),
    ...(needsStopLimitPrice.includes(f.orderType) &&
      f.stopLimitPrice.trim() && { stoplimit: Number(f.stopLimitPrice) }),
    ...(f.sl.trim() && { sl: Number(f.sl) }),
    ...(f.tp.trim() && { tp: Number(f.tp) }),
  });

  const handlePlaceOrder = async () => {
    if (basketEnabled) {
      if (basketItems.length === 0) {
        showAlert('Error', 'Basket is empty. Add at least one order.');
        return;
      }
      setLoading(true);
      try {
        const delay = parseInt(form.orderDelay, 10) || 1000;
        const updatedItems = [...basketItems];

        for (let i = 0; i < updatedItems.length; i++) {
          const item = updatedItems[i];
          try {
            const body = {
              group_id: groupId,
              symbol: item.symbol.trim().toUpperCase(),
              type: item.orderType,
              volume: Number(item.volume),
              ...(needsPrice.includes(item.orderType) &&
                item.price && { price: Number(item.price) }),
              ...(needsStopLimitPrice.includes(item.orderType) &&
                item.stopLimitPrice && {
                  stoplimit: Number(item.stopLimitPrice),
                }),
              ...(item.sl && { sl: Number(item.sl) }),
              ...(item.tp && { tp: Number(item.tp) }),
            };
            const res = await apiPost('/users/group/placegrouporder', body);
            updatedItems[i] = {
              ...item,
              status: res?.status === true ? STATUS.SUCCESS : STATUS.FAILED,
            };
          } catch {
            updatedItems[i] = { ...item, status: STATUS.FAILED };
          }
          setBasketItems([...updatedItems]);
          if (i < updatedItems.length - 1) {
            await new Promise(r => setTimeout(r, delay));
          }
        }

        const failed = updatedItems.filter(
          it => it.status === STATUS.FAILED,
        ).length;
        if (failed === 0) {
          showAlert('Success', 'All basket orders placed successfully!');
          handleClose();
        } else {
          showAlert(
            'Partial Success',
            `${updatedItems.length - failed} succeeded, ${failed} failed.`,
          );
        }
      } catch (e) {
        showAlert('Error', e?.message || 'Network error.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // single order
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await placeOrder(buildSingleBody(form));
      if (res?.status === true) {
        showAlert('Success', 'Order placed successfully!');
        handleClose();
      } else {
        showAlert('Error', res?.message || 'Failed to place order.');
      }
    } catch (e) {
      showAlert('Error', e?.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(emptyForm());
    setSuggestions([]);
    setShowSuggest(false);
    setShowTypes(false);
    setFocused(null);
    setBasketItems([]);
    setBasketEnabled(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onClose();
  };

  const iBox = name => [s.inputBox, focused === name && s.inputBoxFocused];
  // FIX: use form.orderType via getOrderTypeLabel
  const selectedTypeLabel = getOrderTypeLabel(form.orderType);

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
            {/* Symbol */}
            <Text style={s.label}>Symbol *</Text>
            <View style={iBox('symbol')}>
              <TextInput
                style={[s.inputText, { flex: 1 }]}
                placeholder="Type Symbol e.g. BTCUSD"
                placeholderTextColor={colors.textPlaceholder}
                value={form.symbol}
                onChangeText={handleSymbolChange}
                autoCapitalize="characters"
                autoCorrect={false}
                onFocus={() => setFocused('symbol')}
                onBlur={() => setFocused(null)}
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

            {/* Order Type + Volume */}
            <View style={s.row}>
              <View style={s.col}>
                <Text style={s.label}>Order Type *</Text>
                <TouchableOpacity
                  style={iBox('orderType')}
                  onPress={() => {
                    setShowTypes(v => !v);
                    setShowSuggest(false);
                  }}
                >
                  {/* FIX: show selectedTypeLabel derived from form.orderType */}
                  <Text
                    style={[
                      s.inputText,
                      { flex: 1, color: colors.textPrimary },
                    ]}
                    numberOfLines={1}
                  >
                    {selectedTypeLabel}
                  </Text>
                  {/* FIX: check form.orderType, reset to 0 on clear */}
                  {form.orderType !== 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setField('orderType', 0);
                        setField('price', '');
                        setField('stopLimitPrice', '');
                        setShowTypes(false);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Icon
                        name="x"
                        size={13}
                        color={colors.textSecondary}
                        strokeWidth={2}
                      />
                    </TouchableOpacity>
                  )}
                  <View style={s.divider} />
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
                          // FIX: compare form.orderType
                          form.orderType === t.value && s.dropItemActive,
                        ]}
                        onPress={() => {
                          // FIX: removed stray setOrderType() call
                          setField('orderType', t.value);
                          setField('price', '');
                          setField('stopLimitPrice', '');
                          setShowTypes(false);
                        }}
                      >
                        <Text
                          style={[
                            s.dropTxt,
                            form.orderType === t.value && {
                              color: colors.primary,
                            },
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
                {/* FIX: restored missing style/placeholder/keyboardType/focus props */}
                <View style={iBox('volume')}>
                  <TextInput
                    style={[s.inputText, { flex: 1 }]}
                    placeholder="0.01"
                    placeholderTextColor={colors.textPlaceholder}
                    value={form.volume}
                    onChangeText={v => setField('volume', v)}
                    keyboardType="decimal-pad"
                    onFocus={() => setFocused('volume')}
                    onBlur={() => setFocused(null)}
                  />
                </View>
              </View>
            </View>

            {/* Price + Stop Limit Price (types 6, 7) */}
            {showSLP && (
              <View style={s.row}>
                <View style={s.col}>
                  <Text style={s.label}>Price *</Text>
                  <View style={iBox('price')}>
                    <TextInput
                      style={[s.inputText, { flex: 1 }]}
                      placeholder="Enter Price"
                      placeholderTextColor={colors.textPlaceholder}
                      value={form.price}
                      onChangeText={v => setField('price', v)}
                      keyboardType="decimal-pad"
                      onFocus={() => setFocused('price')}
                      onBlur={() => setFocused(null)}
                    />
                  </View>
                </View>
                <View style={s.col}>
                  <Text style={s.label}>Stop Limit Price *</Text>
                  <View style={iBox('stopLimitPrice')}>
                    <TextInput
                      style={[s.inputText, { flex: 1 }]}
                      placeholder="Enter Stop Limit Price"
                      placeholderTextColor={colors.textPlaceholder}
                      value={form.stopLimitPrice}
                      onChangeText={v => setField('stopLimitPrice', v)}
                      keyboardType="decimal-pad"
                      onFocus={() => setFocused('stopLimitPrice')}
                      onBlur={() => setFocused(null)}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* FIX: Price only for types 2,3,4,5 (showPrice && !showSLP was missing entirely) */}
            {showPrice && !showSLP && (
              <View style={s.row}>
                <View style={s.col}>
                  <Text style={s.label}>Price *</Text>
                  <View style={iBox('price')}>
                    <TextInput
                      style={[s.inputText, { flex: 1 }]}
                      placeholder="Enter Price"
                      placeholderTextColor={colors.textPlaceholder}
                      value={form.price}
                      onChangeText={v => setField('price', v)}
                      keyboardType="decimal-pad"
                      onFocus={() => setFocused('price')}
                      onBlur={() => setFocused(null)}
                    />
                  </View>
                </View>
                <View style={s.col} />
              </View>
            )}

            {/* SL + TP + Order Delay */}
            <View style={s.row}>
              <View style={s.col}>
                <Text style={s.label}>Stop Loss (SL)</Text>
                {/* FIX: restored missing style/placeholder/keyboardType/focus props */}
                <View style={iBox('sl')}>
                  <TextInput
                    style={[s.inputText, { flex: 1 }]}
                    placeholder="Enter Stop Loss"
                    placeholderTextColor={colors.textPlaceholder}
                    value={form.sl}
                    onChangeText={v => setField('sl', v)}
                    keyboardType="decimal-pad"
                    onFocus={() => setFocused('sl')}
                    onBlur={() => setFocused(null)}
                  />
                </View>
              </View>
              <View style={s.col}>
                <Text style={s.label}>Target Profit (TP)</Text>
                {/* FIX: restored missing style/placeholder/keyboardType/focus props */}
                <View style={iBox('tp')}>
                  <TextInput
                    style={[s.inputText, { flex: 1 }]}
                    placeholder="Enter Target Profit"
                    placeholderTextColor={colors.textPlaceholder}
                    value={form.tp}
                    onChangeText={v => setField('tp', v)}
                    keyboardType="decimal-pad"
                    onFocus={() => setFocused('tp')}
                    onBlur={() => setFocused(null)}
                  />
                </View>
              </View>
              {basketEnabled && (
                <View style={s.col}>
                  <Text style={s.label}>Order Delay (ms) *</Text>
                  <View style={iBox('orderDelay')}>
                    <TextInput
                      style={[s.inputText, { flex: 1 }]}
                      placeholder="1000"
                      placeholderTextColor={colors.textPlaceholder}
                      value={form.orderDelay}
                      onChangeText={v => setField('orderDelay', v)}
                      keyboardType="number-pad"
                      onFocus={() => setFocused('orderDelay')}
                      onBlur={() => setFocused(null)}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Basket toggle + Add */}
            <View style={s.basketBar}>
              <View style={s.basketToggleGroup}>
                <Text style={s.label}>Basket</Text>
                <Switch
                  value={basketEnabled}
                  onValueChange={val => {
                    setBasketEnabled(val);
                    if (!val) setBasketItems([]);
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
              {basketEnabled && (
                <TouchableOpacity style={s.addBtn} onPress={handleAddToBasket}>
                  <Text style={s.addBtnTxt}>Add</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Basket Table */}
            {basketEnabled && basketItems.length > 0 && (
              <View style={s.tableWrap}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    <View style={[br.row, s.tableHeader]}>
                      <Text style={[br.cell, br.cellId, s.thTxt]}>Id</Text>
                      <Text style={[br.cell, br.cellAction, s.thTxt]}>
                        Action
                      </Text>
                      <Text style={[br.cell, br.cellSymbol, s.thTxt]}>
                        Symbol
                      </Text>
                      <Text style={[br.cell, br.cellType, s.thTxt]}>
                        Order Type
                      </Text>
                      <Text style={[br.cell, br.cellNum, s.thTxt]}>Volume</Text>
                      <Text style={[br.cell, br.cellNum, s.thTxt]}>
                        {'Stop Loss\n(SL)'}
                      </Text>
                      <Text style={[br.cell, br.cellNum, s.thTxt]}>
                        {'Target Price\n(TP)'}
                      </Text>
                      <Text style={[br.cell, br.cellNum, s.thTxt]}>Price</Text>
                      <Text style={[br.cell, br.cellNum, s.thTxt]}>
                        {'Stop Limit\nPrice'}
                      </Text>
                      <Text style={[br.cell, br.cellStatus, s.thTxt]}>
                        Status
                      </Text>
                    </View>
                    {basketItems.map((item, index) => (
                      <BasketRow
                        key={item.id}
                        item={item}
                        index={index}
                        total={basketItems.length}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                        onDelete={handleDeleteBasketItem}
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Buttons */}
            <View style={s.btnRow}>
              <Button
                label="Close"
                variant="outline"
                onPress={handleClose}
                style={{ flex: 1 }}
              />
              <Button
                label={
                  basketEnabled
                    ? `Place ${basketItems.length} Order${
                        basketItems.length !== 1 ? 's' : ''
                      }`
                    : 'Place Order'
                }
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

// ─── BasketRow Styles ─────────────────────────────────────────────────────────
const br = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
  },
  cell: { paddingHorizontal: 8, justifyContent: 'center' , color: colors.textPrimary },
  cellId: { width: 32 },
  cellAction: { width: 80, flexDirection: 'row', alignItems: 'center' },
  cellSymbol: { width: 80 },
  cellType: { width: 90 },
  cellNum: { width: 84 },
  cellStatus: { width: 80, flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionBtn: { marginRight: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusTxt: { fontSize: 11, fontWeight: '600' },
});

// ─── Modal Styles ─────────────────────────────────────────────────────────────
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
  inputBoxFocused: { borderColor: colors.primary },
  inputText: { fontSize: typography.sm, color: colors.textPrimary },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
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
  basketBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  basketToggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radius.md,
  },
  addBtnTxt: {
    color: colors.primaryTextm,
    fontWeight: typography.bold,
    fontSize: typography.sm,
  },
  tableWrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  tableHeader: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  thTxt: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'left',
  },
  btnRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
});
