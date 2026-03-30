import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import AccountCard from '../../components/accounts/AccountCard';
import AddAccountModal from '../../components/accounts/AddAccountModal';
    
const BASE_URL = 'https://api.algodeltafx.com/api/v1';

// ─── Screen ───────────────────────────────────────────────────────
export default function AccountsScreen() {
  const [accounts, setAccounts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchAccounts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/users/broker/getbrokers`, {
        method: 'GET',
        headers: {
          Accept: '*/*',
          Authorization: token,
          Origin: 'https://www.algodeltafx.com',
          Referer: 'https://www.algodeltafx.com/',
        },
      });
      const json = await res.json();
      // API: { status: true, data: [...] }
      const list = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
        ? json
        : [];
      setAccounts(list);
      setFiltered(list);
    } catch {
      setError('Failed to load accounts. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleSearch = text => {
    setSearch(text);
    const q = text.toLowerCase();
    setFiltered(
      !q
        ? accounts
        : accounts.filter(a =>
            (a?.broker_name || a?.nick_name || a?.name || '')
              .toLowerCase()
              .includes(q),
          ),
    );
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={s.header}>
        <Image
          source={require('../../assets/algodeltafx_com_horizontal_logo.jpg')}
          style={s.logo}
          resizeMode="contain"
        />
        <TouchableOpacity style={s.addBtn} onPress={() => setShowModal(true)}>
          <Text style={s.addBtnTxt}>＋ Add Account</Text>
        </TouchableOpacity>
      </View>

      <View style={s.titleRow}>
        <Text style={s.pageTitle}>Accounts</Text>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Text style={s.searchIco}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search accounts..."
          placeholderTextColor={colors.textPlaceholder}
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {/* Content */}
      {loading && (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadTxt}>Loading accounts...</Text>
        </View>
      )}
      {!loading && error && (
        <View style={s.center}>
          <Text style={s.errTxt}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => fetchAccounts()}>
            <Text style={s.retryTxt}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      {!loading && !error && filtered.length === 0 && (
        <View style={s.center}>
          <Text style={{ fontSize: 40, marginBottom: spacing.md }}>📭</Text>
          <Text style={s.emptyTxt}>
            {search ? 'No accounts match your search.' : 'No accounts found.'}
          </Text>
          {!search && (
            <Text style={s.emptySub}>Tap "+ Add Account" to get started.</Text>
          )}
        </View>
      )}
      {!loading && !error && filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => String(item?.id || item?.broker_id || i)}
          renderItem={({ item }) => <AccountCard item={item} />}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchAccounts(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}

      <AddAccountModal
        visible={showModal}
        onClose={added => {
          setShowModal(false);
          if (added) fetchAccounts(true);
        }}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: { width: 130, height: 36 },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  addBtnTxt: {
    fontSize: typography.xs + 1,
    fontWeight: typography.bold,
    color: colors.primaryText,
  },
  titleRow: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  pageTitle: {
    fontSize: typography.xl,
    fontWeight: typography.extrabold,
    color: colors.textPrimary,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  searchIco: { fontSize: 14, marginRight: spacing.sm },
  searchInput: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
  list: { padding: spacing.base, paddingBottom: spacing.xxl },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadTxt: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errTxt: {
    fontSize: typography.sm,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  retryTxt: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.primaryText,
  },
  emptyTxt: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptySub: { fontSize: typography.sm, color: colors.textSecondary },
});

const c = StyleSheet.create({
  wrap: {
    backgroundColor: colors.bgCard,
    borderRadius: spacing.radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: spacing.radius.full,
    flexShrink: 0,
  },
  name: {
    fontSize: typography.sm + 1,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  badgeG: {
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.25)',
    borderRadius: spacing.radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeGTxt: {
    fontSize: typography.xs,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  badgeGr: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeGrTxt: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    fontWeight: typography.semibold,
  },
  statsRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xs },
  statBox: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderRadius: spacing.radius.sm,
    padding: spacing.xs + 2,
    alignItems: 'center',
  },
  statL: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statV: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  toggleGrp: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  toggleItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  toggleLbl: { fontSize: typography.xs, color: colors.textSecondary },
  toggle: {
    width: 28,
    height: 15,
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.full,
    position: 'relative',
  },
  toggleOff: { backgroundColor: colors.borderLight },
  toggleDot: {
    position: 'absolute',
    width: 11,
    height: 11,
    backgroundColor: '#fff',
    borderRadius: spacing.radius.full,
    top: 2,
    right: 2,
  },
  toggleDotOff: { right: undefined, left: 2 },
  iconGrp: { flexDirection: 'row', gap: spacing.xs },
  iconBtn: {
    width: 28,
    height: 28,
    backgroundColor: colors.bgInput,
    borderRadius: spacing.radius.xs + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBtnG: {
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderColor: 'rgba(74,222,128,0.25)',
  },
  iconTxt: { fontSize: 13 },
});

const m = StyleSheet.create({
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
    maxHeight: '92%',
  },
  mHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  mTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  mClose: {
    fontSize: typography.xl,
    color: colors.textSecondary,
    padding: spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.bgInput,
    borderRadius: spacing.radius.md,
    padding: 3,
    marginBottom: spacing.base,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    borderRadius: spacing.radius.sm,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.primary },
  tabTxt: {
    fontSize: typography.xs + 1,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tabTxtActive: { color: colors.primaryText },
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
    fontSize: typography.sm,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  inputWrap: { position: 'relative', marginBottom: spacing.md },
  inputPad: { marginBottom: 0, paddingRight: 44 },
  eye: { position: 'absolute', right: spacing.md, top: spacing.sm },
  twoCol: { flexDirection: 'row' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  switchLbl: {
    fontSize: typography.md,
    color: colors.textPrimary,
    fontWeight: typography.medium,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.base,
  },
  btnCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: spacing.radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  btnCancelTxt: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  btnAdd: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  btnAddTxt: {
    fontSize: typography.md,
    fontWeight: typography.bold,
    color: colors.primaryText,
  },
});
