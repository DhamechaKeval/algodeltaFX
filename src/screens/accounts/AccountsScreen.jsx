import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
} from 'react-native';
import AppHeader from '../../components/common/AppHeader';
import Icon from '../../components/common/Icon';
import EmptyState from '../../components/common/EmptyState';
import AccountCard from '../../components/accounts/AccountCard';
import AddAccountModal from '../../components/accounts/AddAccountModal';
import { useAccounts } from '../../hooks/useAccounts';
import { common } from '../../styles/common.styles';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const SORT_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Trading Status', value: 'trading' },
  { label: 'Balance ($)', value: 'balance' },
  { label: 'Equity ($)', value: 'equity' },
  { label: 'Free Margin ($)', value: 'free_margin' },
  { label: 'Margin ($)', value: 'margin' },
  { label: 'P&L', value: 'pnl' },
  { label: 'POS', value: 'pos' },
  { label: 'Expiry Date', value: 'expiry' },
  { label: 'Group Count', value: 'group' },
];

export default function AccountsScreen({ navigation }) {
  const {
    filtered,
    search,
    loading,
    refreshing,
    error,
    showModal,
    addLoading,
    setShowModal,
    handleSearch,
    handleToggleTrading,
    handleToggleSlTp,
    handleToggleAutoRenew,
    handleRefreshAccount,
    handleDeleteAccount,
    handleAddAccount,
    fetchAccounts,
  } = useAccounts();

  const [sortBy, setSortBy] = useState('default');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // ── Apply sort ────────────────────────────────────────────────
  const sorted = [...filtered].sort((a, b) => {
    const ai = a?.account_info || {};
    const bi = b?.account_info || {};
    switch (sortBy) {
      case 'trading':
        return (b?.main_trading_flag ? 1 : 0) - (a?.main_trading_flag ? 1 : 0);
      case 'balance':
        return (bi?.balance ?? 0) - (ai?.balance ?? 0);
      case 'equity':
        return (bi?.equity ?? 0) - (ai?.equity ?? 0);
      case 'free_margin':
        return (bi?.margin_free ?? 0) - (ai?.margin_free ?? 0);
      case 'margin':
        return (bi?.margin ?? 0) - (ai?.margin ?? 0);
      case 'pnl':
        return (bi?.floating_profit ?? 0) - (ai?.floating_profit ?? 0);
      case 'pos':
        return (bi?.positions_count ?? 0) - (ai?.positions_count ?? 0);
      case 'expiry':
        return new Date(a?.end_date || 0) - new Date(b?.end_date || 0);
      case 'group':
        return (b?.group_involve_count ?? 0) - (a?.group_involve_count ?? 0);
      default:
        return 0;
    }
  });

  const selectedSort =
    SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sort by';

  return (
    <View style={common.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <AppHeader />

      {/* Search + Sort — same height */}
      <View style={s.toolRow}>
        {/* Search bar — border turns primary on focus */}
        <View style={[s.searchBox, searchFocused && s.searchBoxFocused]}>
          <Icon
            name="search"
            size={14}
            color={searchFocused ? colors.primary : colors.textMuted}
            strokeWidth={1.8}
          />
          <TextInput
            style={s.searchInput}
            placeholder="Search..."
            placeholderTextColor={colors.textPlaceholder}
            value={search}
            onChangeText={handleSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon
                name="x"
                size={13}
                color={colors.textMuted}
                strokeWidth={2}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Sort button — same height as search */}
        <TouchableOpacity
          style={[s.sortBtn, showSortMenu && s.sortBtnActive]}
          onPress={() => setShowSortMenu(true)}
        >
          <Icon
            name="filter"
            size={13}
            color={showSortMenu ? colors.primary : colors.textSecondary}
            strokeWidth={1.8}
          />
          <Text
            style={[s.sortTxt, showSortMenu && { color: colors.primary }]}
            numberOfLines={1}
          >
            {selectedSort}
          </Text>
          <Icon
            name="chevron-down"
            size={13}
            color={showSortMenu ? colors.primary : colors.textSecondary}
            strokeWidth={1.8}
          />
        </TouchableOpacity>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowModal(true)}>
          <Icon
            name="users"
            size={14}
            color={colors.primaryText}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      {/* States */}
      {loading && <EmptyState type="loading" title="Loading accounts..." />}
      {!loading && error && (
        <EmptyState
          type="error"
          title={error}
          onRetry={() => fetchAccounts()}
        />
      )}
      {!loading && !error && sorted.length === 0 && (
        <EmptyState
          type="empty"
          title={
            search ? 'No accounts match your search.' : 'No accounts found.'
          }
          subtitle={!search ? 'Tap "Add Account" to get started.' : ''}
        />
      )}

      {/* List */}
      {!loading && !error && sorted.length > 0 && (
        <FlatList
          data={sorted}
          keyExtractor={item => String(item.broker_id)}
          renderItem={({ item }) => (
            <AccountCard
              item={item}
              navigation={navigation}
              onToggleTrading={handleToggleTrading}
              onToggleSlTp={handleToggleSlTp}
              onToggleAutoRenew={handleToggleAutoRenew}
              onRefresh={handleRefreshAccount}
              onDelete={handleDeleteAccount}
              onReloadList={() => fetchAccounts(true)}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: spacing.base,
            paddingVertical: spacing.sm + 2,
          }}
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
        onClose={() => setShowModal(false)}
        onAdd={handleAddAccount}
        loading={addLoading}
      />

      {/* Sort Menu */}
      <Modal
        visible={showSortMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortMenu(false)}
      >
        <TouchableOpacity
          style={m.backdrop}
          activeOpacity={1}
          onPress={() => setShowSortMenu(false)}
        >
          <View style={m.menu}>
            <View style={m.menuHeader}>
              <Text style={m.menuTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortMenu(false)}>
                <Icon
                  name="x"
                  size={18}
                  color={colors.textSecondary}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>
            <View style={m.divider} />
            {SORT_OPTIONS.map((opt, i) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  m.menuItem,
                  i === SORT_OPTIONS.length - 1 && m.menuItemLast,
                  sortBy === opt.value && m.menuItemActive,
                ]}
                onPress={() => {
                  setSortBy(opt.value);
                  setShowSortMenu(false);
                }}
              >
                <Text
                  style={[m.menuTxt, sortBy === opt.value && m.menuTxtActive]}
                >
                  {opt.label}
                </Text>
                {sortBy === opt.value && (
                  <Icon
                    name="check"
                    size={16}
                    color={colors.primary}
                    strokeWidth={2.5}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ── Fixed height: 42px for both search and sort ───────────────────
const TOOL_HEIGHT = 36;

const s = StyleSheet.create({
  addBtn: {
    height: TOOL_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    // fontWeight: typography.bold,
  },
  addBtnTxt: {
    fontSize: typography.xs + 1,
    fontWeight: typography.bold,
    color: colors.primaryText,
  },

  // Tool row — both children same height
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    marginBlock: spacing.sm,
  },

  // Search box
  searchBox: {
    flex: 1,
    height: TOOL_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
  },
  searchBoxFocused: { borderColor: colors.primary },
  searchInput: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.textPrimary,
    padding: 0,
  },

  // Sort button — same height
  sortBtn: {
    height: TOOL_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
  },
  sortBtnActive: { borderColor: colors.primary },
  sortTxt: {
    fontSize: typography.xs + 1,
    color: colors.textSecondary,
    fontWeight: typography.medium,
    maxWidth: 90,
  },
});

const m = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  menu: {
    backgroundColor: colors.bgCard,
    borderRadius: spacing.radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    overflow: 'hidden',
    maxHeight: '80%',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  menuTitle: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  divider: { height: 1, backgroundColor: colors.border },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuItemActive: { backgroundColor: 'rgba(74,222,128,0.06)' },
  menuTxt: { fontSize: typography.md, color: colors.textSecondary },
  menuTxtActive: { color: colors.primary, fontWeight: typography.semibold },
});
