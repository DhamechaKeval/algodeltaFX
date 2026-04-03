import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AppHeader from '../../components/common/AppHeader';
import Icon from '../../components/common/Icon';
import GroupCard from '../../components/copyTrade/GroupCard';
import CreateGroupModal from '../../components/copyTrade/CreateGroupModal';
import GroupContextMenu from '../../components/copyTrade/GroupContextMenu';
import PlaceOrderModal from '../../components/copyTrade/PlaceOrderModal';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import {
  getGroups,
  addGroup,
  updateGroup,
  deleteGroup,
  updateGroupTrading,
  squareOffAll,
  cancelAll,
  getGroupPositions,
  getGroupPendingOrders,
} from '../../services/copyTradeService';

const parseList = res =>
  Array.isArray(res?.data)
    ? res.data
    : Array.isArray(res?.groups)
    ? res.groups
    : Array.isArray(res)
    ? res
    : [];

export default function CopyTradeScreen({ navigation }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sFocused, setSFocused] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editGroup, setEditGroup] = useState(null);
  const [menuGroup, setMenuGroup] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [placeOrderGroup, setPlaceOrderGroup] = useState(null);
  const [showPlaceOrder, setShowPlaceOrder] = useState(false);

  const fetchGroups = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await getGroups();
      setGroups(parseList(res));
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to load groups.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // ── Create / Edit ──
  const handleSubmitGroup = async name => {
    try {
      const res = editGroup
        ? await updateGroup(editGroup.group_id, name)
        : await addGroup(name);
      if (res?.status === true) {
        setShowCreate(false);
        setEditGroup(null);
        fetchGroups(true);
      } else {
        Alert.alert('Error', res?.message || 'Operation failed.');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Network error.');
    }
  };

  // ── Trading toggle ──
  const handleToggleTrading = async (group, val) => {
    try {
      setGroups(prev =>
        prev.map(g =>
          g.group_id === group.group_id ? { ...g, trading_flag: val } : g,
        ),
      );
      const res = await updateGroupTrading(group.group_id, val);
      if (res?.status !== true) fetchGroups(true);
    } catch {
      fetchGroups(true);
    }
  };

  // ── Context menu actions ──
  const handleMenuSelect = async key => {
    if (!menuGroup) return;
    const gid = menuGroup.group_id;
    if (key === 'edit') {
      setEditGroup(menuGroup);
      setShowCreate(true);
      return;
    }
    if (key === 'delete') {
      Alert.alert('Delete Group', `Delete "${menuGroup.group_name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const res = await deleteGroup(gid);
            if (res?.status === true) fetchGroups(true);
            else Alert.alert('Error', res?.message || 'Failed to delete.');
          },
        },
      ]);
      return;
    }
    if (key === 'squareoff') {
      Alert.alert('Square Off All', 'Square off all positions?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const res = await squareOffAll(gid);
            Alert.alert(
              res?.status === true ? 'Success' : 'Error',
              res?.message || 'Done.',
            );
          },
        },
      ]);
      return;
    }
    if (key === 'cancelall') {
      Alert.alert('Cancel All', 'Cancel all pending orders?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const res = await cancelAll(gid);
            Alert.alert(
              res?.status === true ? 'Success' : 'Error',
              res?.message || 'Done.',
            );
          },
        },
      ]);
      return;
    }
    if (key === 'positions') {
      navigation.navigate('GroupDetail', {
        group: menuGroup,
        initialTab: 'positions',
      });
      return;
    }
    if (key === 'pending') {
      navigation.navigate('GroupDetail', {
        group: menuGroup,
        initialTab: 'pending',
      });
      return;
    }
  };

  const filtered = search.trim()
    ? groups.filter(
        g =>
          String(g?.group_name || '')
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          String(g?.group_id || '').includes(search),
      )
    : groups;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <AppHeader />

      {/* Title + Create button */}
      <View style={s.titleRow}>
        <Text style={s.pageTitle}>Copy Trading</Text>
        <TouchableOpacity
          style={s.createBtn}
          onPress={() => {
            setEditGroup(null);
            setShowCreate(true);
          }}
        >
          <Icon
            name="user-plus"
            size={14}
            color={colors.primaryText}
            strokeWidth={2}
          />
          <Text style={s.createBtnTxt}>Create Group</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchRow}>
        <View style={[s.searchBox, sFocused && s.searchFocused]}>
          <Icon
            name="search"
            size={14}
            color={sFocused ? colors.primary : colors.textMuted}
            strokeWidth={1.8}
          />
          <TextInput
            style={s.searchInput}
            placeholder="Search groups..."
            placeholderTextColor={colors.textPlaceholder}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSFocused(true)}
            onBlur={() => setSFocused(false)}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon
                name="x"
                size={13}
                color={colors.textMuted}
                strokeWidth={2}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={s.refreshBtn}
          onPress={() => fetchGroups(true)}
        >
          <Icon
            name="refresh"
            size={15}
            color={colors.textSecondary}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item?.group_id)}
          renderItem={({ item }) => (
            <GroupCard
              item={item}
              onView={g => navigation.navigate('GroupDetail', { group: g })}
              onMenu={g => {
                setMenuGroup(g);
                setShowMenu(true);
              }}
              onToggleTrading={handleToggleTrading}
              onPlaceOrder={g => {
                setPlaceOrderGroup(g);
                setShowPlaceOrder(true);
              }}
              onRefresh={() => fetchGroups(true)}
            />
          )}
          contentContainerStyle={{
            padding: spacing.base,
            paddingBottom: spacing.xxl,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.center}>
              <Icon
                name="copy-trade"
                size={48}
                color={colors.textMuted}
                strokeWidth={1}
              />
              <Text style={s.emptyTxt}>No groups found.</Text>
              <Text style={s.emptySubTxt}>
                Tap + Create Group to get started.
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchGroups(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}

      <CreateGroupModal
        visible={showCreate}
        editGroup={editGroup}
        onClose={() => {
          setShowCreate(false);
          setEditGroup(null);
        }}
        onSubmit={handleSubmitGroup}
      />

      <PlaceOrderModal
        visible={showPlaceOrder}
        groupId={placeOrderGroup?.group_id}
        onClose={success => {
          setShowPlaceOrder(false);
          if (success) Alert.alert('Success', 'Order placed successfully!');
        }}
      />

      <GroupContextMenu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onSelect={handleMenuSelect}
      />
    </View>
  );
}

const s = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  pageTitle: {
    fontSize: typography.xl,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  createBtnTxt: {
    fontSize: typography.sm,
    fontWeight: '700',
    color: colors.primaryText,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    height: 40,
  },
  searchFocused: { borderColor: colors.primary },
  searchInput: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.textPrimary,
    padding: 0,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl * 2,
  },
  emptyTxt: {
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontSize: typography.md,
    fontWeight: '600',
  },
  emptySubTxt: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontSize: typography.sm,
  },
});
