// src/screens/wallet/WalletScreen.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AppHeader from '../../components/common/AppHeader';
import Icon from '../../components/common/Icon';
import SearchBar from '../../components/common/SearchBar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import {
  makePayment,
  getUserLedger,
  getInr,
} from '../../services/walletService';
import { getUserIdFromToken } from '../../services/profileService';

const WALLET_COUNTRIES = [
  { label: 'INDIA', value: 'INDIA' },
  { label: 'UNITED STATES', value: 'UNITED STATES' },
  { label: 'RUSSIA', value: 'RUSSIA' },
  { label: 'CANADA', value: 'CANADA' },
  { label: 'JAPAN', value: 'JAPAN' },
  { label: 'NEW ZEALAND', value: 'NEW ZEALAND' },
  { label: 'OTHER', value: 'OTHER' },
];

// ── Build a searchable string for every possible amount format ───────────
// Handles: "8", "8$", "-8$", "+8$", "$8", "8 $", "-8 $", etc.
function buildAmountSearchTokens(tx) {
  const raw = tx?.amount ?? '';
  const num = parseFloat(String(raw));
  if (isNaN(num)) return [];

  const isDebit = String(tx?.transaction_type || tx?.type || '')
    .toLowerCase()
    .includes('debit');

  const sign = isDebit ? '-' : '+';
  const abs = Math.abs(num);
  const absStr = String(abs);
  const signedStr = `${sign}${abs}`;

  // All formats a user might type:
  return [
    absStr, // "8"
    `${absStr}$`, // "8$"
    `$${absStr}`, // "$8"
    `${absStr} $`, // "8 $"
    signedStr, // "+8" or "-8"
    `${signedStr}$`, // "+8$" or "-8$"
    `${signedStr} $`, // "+8 $" or "-8 $"
    `$${signedStr}`, // "$+8" or "$-8"
    String(num), // covers decimals like "8.5"
    `${String(num)}$`,
  ];
}

export default function WalletScreen() {
  const [country, setCountry] = useState(WALLET_COUNTRIES[0]);
  const [showCountry, setShowCountry] = useState(false);
  const [amount, setAmount] = useState('');
  const [amtFocused, setAmtFocused] = useState(false);
  const [inrText, setInrText] = useState('');
  const [inrLoading, setInrLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [ledger, setLedger] = useState([]);
  const [ledgerLoad, setLedgerLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentHtml, setPaymentHtml] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [txSearch, setTxSearch] = useState('');

  const debounceRef = useRef(null);

  // ── Fetch ledger ──────────────────────────────────────────────
  const fetchLedger = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLedgerLoad(true);

      let allData = [];
      let offset = 0;
      const limit = 10;

      while (true) {
        const res = await getUserLedger(offset, limit);
        const list = Array.isArray(res?.data) ? res.data : [];
        allData = [...allData, ...list];
        const total = res?.total_records || 0;
        if (allData.length >= total) break;
        offset += limit;
      }

      setLedger(allData);
    } catch (err) {
      console.log(err);
      setLedger([]);
    } finally {
      setLedgerLoad(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  // ── INR equivalent — debounced, only for INDIA ────────────────
  useEffect(() => {
    setInrText('');
    if (
      country.value !== 'INDIA' ||
      !amount.trim() ||
      isNaN(Number(amount)) ||
      Number(amount) <= 0
    )
      return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setInrLoading(true);
      try {
        const res = await getInr(Number(amount));
        const inr = res.amount_inr ?? null;
        if (inr) setInrText(`INR Equivalent: ₹${inr}`);
      } catch {
        setInrText('');
      } finally {
        setInrLoading(false);
      }
    }, 600);
    return () => clearTimeout(debounceRef.current);
  }, [amount, country]);

  // ── Search filter ─────────────────────────────────────────────
  const filteredLedger =
    txSearch.trim() === ''
      ? ledger
      : ledger.filter(tx => {
          const q = txSearch.trim().toLowerCase();

          // Standard text fields
          const textFields = [
            tx?.description,
            tx?.desc,
            tx?.remarks,
            tx?.transaction_type,
            tx?.type,
            tx?.create_time,
            tx?.created_at,
            tx?.time,
            String(tx?.id ?? ''),
          ];

          const textMatch = textFields.some(
            f => f && String(f).toLowerCase().includes(q),
          );

          if (textMatch) return true;

          // ── Amount search — strip $, +, - from query then compare ──
          // Normalize query: remove $ and spaces so "8$", "$8", "8 $" all → "8"
          const qNorm = q.replace(/[$\s]/g, ''); // "-8" or "+8" or "8"

          // Check against all generated tokens
          const amtTokens = buildAmountSearchTokens(tx);
          const amtMatch = amtTokens.some(token =>
            token.toLowerCase().includes(qNorm),
          );

          return amtMatch;
        });

  // ── Make payment ──────────────────────────────────────────────
  const handleAdd = async () => {
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Error', 'Enter a valid amount.');
      return;
    }
    setPaying(true);
    try {
      const userId = await getUserIdFromToken();
      const res = await makePayment(userId, amount, country.value);
      const html = res?.html || res?.data?.html || null;

      if (html) {
        setPaymentHtml(html);
        setShowPayment(true);
        setAmount('');
        setInrText('');
      } else if (res?.status === true) {
        Alert.alert('Success', res?.message || 'Payment initiated!');
        setAmount('');
        setInrText('');
        fetchLedger(true);
      } else {
        Alert.alert('Error', res?.message || 'Payment failed.');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Network error.');
    } finally {
      setPaying(false);
    }
  };

  const closePayment = () => {
    setShowPayment(false);
    setPaymentHtml('');
    fetchLedger(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <AppHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.base,
          paddingVertical: spacing.sm + 2,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchLedger(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* ── Add Amount ── */}
        <View style={s.addSection}>
          <Text style={s.sectionTitle}>Add Amount</Text>
          <View style={s.addRow}>
            <TouchableOpacity
              style={[s.box, showCountry && s.boxFocused]}
              onPress={() => setShowCountry(v => !v)}
            >
              <Text style={s.boxTxt} numberOfLines={1}>
                {country.label}
              </Text>
              <Icon
                name="chevron-down"
                size={14}
                color={showCountry ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>

            <View style={[s.box, amtFocused && s.boxFocused]}>
              <TextInput
                style={s.amtInput}
                placeholder="Enter Amount"
                placeholderTextColor={colors.textMuted}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                onFocus={() => setAmtFocused(true)}
                onBlur={() => setAmtFocused(false)}
              />
            </View>

            <TouchableOpacity
              style={[s.addBtn, paying && { opacity: 0.7 }]}
              onPress={handleAdd}
              disabled={paying}
            >
              {paying ? (
                <ActivityIndicator size="small" color={colors.primaryText} />
              ) : (
                <Text style={s.addBtnTxt}>Add</Text>
              )}
            </TouchableOpacity>
          </View>

          {showCountry && (
            <View style={s.dropdown}>
              {WALLET_COUNTRIES.map((c, i) => (
                <TouchableOpacity
                  key={c.value}
                  style={[
                    s.dropItem,
                    i === WALLET_COUNTRIES.length - 1 && {
                      borderBottomWidth: 0,
                    },
                    country.value === c.value && s.dropItemActive,
                  ]}
                  onPress={() => {
                    setCountry(c);
                    setShowCountry(false);
                  }}
                >
                  <Text
                    style={[
                      s.dropTxt,
                      country.value === c.value && {
                        color: colors.primary,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {c.label}
                  </Text>
                  {country.value === c.value && (
                    <Icon
                      name="check"
                      size={15}
                      color={colors.primary}
                      strokeWidth={2.5}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {country.value === 'INDIA' && amount.trim() !== '' && (
            <View style={{ marginTop: spacing.sm, minHeight: 20 }}>
              {inrLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : inrText ? (
                <Text style={s.inrTxt}>{inrText}</Text>
              ) : null}
            </View>
          )}
        </View>

        {/* ── Transaction History header ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Transaction History</Text>
          <TouchableOpacity
            style={s.refreshBtn}
            onPress={() => fetchLedger(true)}
          >
            <Icon name="refresh" size={14} color="#8B5CF6" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* ── Search bar ── */}
        <SearchBar
          value={txSearch}
          onChangeText={setTxSearch}
          placeholder="Search by description, amount, date..."
          style={s.searchBar}
        />

        {/* ── List ── */}
        {ledgerLoad ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing.xxl }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : ledger.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing.xxl }}>
            <Icon
              name="wallet"
              size={40}
              color={colors.textMuted}
              strokeWidth={1}
            />
            <Text
              style={{ color: colors.textSecondary, marginTop: spacing.md }}
            >
              No transactions found.
            </Text>
          </View>
        ) : filteredLedger.length === 0 ? (
          <View style={s.noResult}>
            <Icon
              name="search"
              size={32}
              color={colors.textMuted}
              strokeWidth={1.2}
            />
            <Text style={s.noResultTxt}>
              No transactions match "{txSearch}"
            </Text>
            <TouchableOpacity
              onPress={() => setTxSearch('')}
              style={s.clearBtn}
            >
              <Text style={s.clearBtnTxt}>Clear Search</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {txSearch.trim() !== '' && (
              <Text style={s.resultCount}>
                {filteredLedger.length} result
                {filteredLedger.length !== 1 ? 's' : ''} found
              </Text>
            )}

            {filteredLedger.map((tx, i) => {
              const isDebit = String(tx?.transaction_type || tx?.type || '')
                .toLowerCase()
                .includes('debit');
              return (
                <View key={i} style={s.txCard}>
                  <View style={s.txRow}>
                    <View
                      style={[
                        s.txIcon,
                        isDebit ? s.txDebitIcon : s.txCreditIcon,
                      ]}
                    >
                      <Icon
                        name={isDebit ? 'trending-up' : 'dollar'}
                        size={16}
                        color={isDebit ? colors.error : colors.primary}
                        strokeWidth={2}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.txDesc} numberOfLines={2}>
                        {tx?.description || tx?.desc || tx?.remarks || '—'}
                      </Text>
                      <Text style={s.txTime}>
                        {tx?.create_time || tx?.created_at || tx?.time || '—'}
                      </Text>
                      <Text style={s.txId}>ID: {tx?.id || i + 1}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
                      <Text
                        style={[
                          s.txAmount,
                          { color: isDebit ? colors.error : colors.primary },
                        ]}
                      >
                        {isDebit ? '-' : '+'}
                        {`${tx?.amount ?? 0} $`}
                      </Text>
                      <View style={isDebit ? s.debitBadge : s.creditBadge}>
                        <Text style={isDebit ? s.debitTxt : s.creditTxt}>
                          {isDebit ? 'Debit' : 'Credit'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* ── PayU WebView modal ── */}
      <Modal
        visible={showPayment}
        animationType="slide"
        onRequestClose={closePayment}
      >
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          <View style={s.payHeader}>
            <TouchableOpacity style={s.payBack} onPress={closePayment}>
              <Icon
                name="arrow-left"
                size={20}
                color={colors.textPrimary}
                strokeWidth={2.5}
              />
            </TouchableOpacity>
            <Text style={s.payTitle}>Payment</Text>
            <View style={{ width: 40 }} />
          </View>
          <WebView
            style={{ flex: 1, backgroundColor: '#fff' }}
            source={{ html: paymentHtml }}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => (
              <View style={s.payLoader}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                  style={{ color: colors.textSecondary, marginTop: spacing.md }}
                >
                  Opening Payment Gateway...
                </Text>
              </View>
            )}
            onNavigationStateChange={navState => {
              const url = navState.url || '';
              if (
                url.includes('payucallback') &&
                url.includes('status=completed')
              ) {
                closePayment();
                Alert.alert(
                  'Payment Successful!',
                  'Your wallet has been topped up.',
                );
              } else if (
                url.includes('payucallback') &&
                url.includes('status=failure')
              ) {
                closePayment();
                Alert.alert(
                  'Payment Failed',
                  'Your payment was not completed.',
                );
              }
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  addSection: { marginBottom: spacing.base },
  sectionTitle: {
    fontSize: typography.base,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  box: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  boxFocused: { borderColor: colors.primary },
  boxTxt: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  amtInput: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.textPrimary,
    padding: 0,
  },
  addBtn: {
    flex: 0.8,
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.md,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnTxt: {
    fontSize: typography.sm,
    fontWeight: '800',
    color: colors.primaryText,
  },
  inrTxt: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: '600',
  },

  dropdown: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: spacing.radius.md,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropItemActive: { backgroundColor: 'rgba(74,222,128,0.08)' },
  dropTxt: { fontSize: typography.sm, color: colors.textSecondary },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  refreshBtn: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    borderRadius: spacing.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchBar: { marginBottom: spacing.md },

  noResult: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  noResultTxt: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  clearBtn: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  clearBtnTxt: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: '700',
  },
  resultCount: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },

  txCard: {
    backgroundColor: colors.card,
    borderRadius: spacing.radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.sm,
  },
  txRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  txDebitIcon: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  txCreditIcon: {
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.2)',
  },
  txDesc: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    flexWrap: 'wrap',
  },
  txTime: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  txId: { fontSize: typography.xs, color: colors.textMuted },
  txAmount: { fontSize: typography.base, fontWeight: '700' },
  debitBadge: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  debitTxt: {
    fontSize: typography.xs,
    fontWeight: '700',
    color: colors.error,
  },
  creditBadge: {
    backgroundColor: 'rgba(74,222,128,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  creditTxt: {
    fontSize: typography.xs,
    fontWeight: '700',
    color: colors.primary,
  },

  payHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  payBack: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payTitle: {
    fontSize: typography.base,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  payLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
});
