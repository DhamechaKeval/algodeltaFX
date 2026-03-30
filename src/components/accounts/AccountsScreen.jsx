import React from 'react';
import { View, FlatList, StatusBar, RefreshControl } from 'react-native';
import AppHeader from '../../components/common/AppHeader';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import AccountCard from '../../components/accounts/AccountCard';
import AddAccountModal from '../../components/accounts/AddAccountModal';
import { useAccounts } from '../../hooks/useAccounts';
import { common } from '../../styles/common.styles';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function AccountsScreen() {
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
    handleRefreshAccount,
    handleDeleteAccount,
    handleAddAccount,
    fetchAccounts,
  } = useAccounts();

  return (
    <View style={common.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <AppHeader
        right={
          <Button
            label="＋ Add Account"
            size="sm"
            onPress={() => setShowModal(true)}
          />
        }
      />

      {/* Search */}
      <SearchBar
        value={search}
        onChangeText={handleSearch}
        placeholder="Search accounts..."
      />

      {/* Loading */}
      {loading && <EmptyState type="loading" title="Loading accounts..." />}

      {/* Error */}
      {!loading && error && (
        <EmptyState
          type="error"
          title={error}
          onRetry={() => fetchAccounts()}
        />
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          type="empty"
          title={
            search ? 'No accounts match your search.' : 'No accounts found.'
          }
          subtitle={!search ? 'Tap "+ Add Account" to get started.' : ''}
        />
      )}

      {/* List */}
      {!loading && !error && filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.broker_id)}
          renderItem={({ item }) => (
            <AccountCard
              item={item}
              onToggleTrading={handleToggleTrading}
              onToggleSlTp={handleToggleSlTp}
              onRefresh={handleRefreshAccount}
              onDelete={handleDeleteAccount}
            />
          )}
          contentContainerStyle={{
            padding: spacing.base,
            paddingBottom: spacing.xxl,
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

      {/* Add Account Modal */}
      <AddAccountModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAddAccount}
        loading={addLoading}
      />
    </View>
  );
}
