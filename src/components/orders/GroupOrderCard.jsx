import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '../common/Icon';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { formatDateTime } from '../../utils/date';

function StatBox({ label, value, green, red }) {
  return (
    <View style={s.box}>
      <Text style={s.boxLabel}>{label}</Text>
      <Text
        style={[
          s.boxVal,
          green && { color: colors.primary },
          red && { color: colors.error },
        ]}
        numberOfLines={1}
      >
        {value ?? '—'}
      </Text>
    </View>
  );
}

export default function GroupOrderCard({ item, index, onView }) {
  const isBuy =
    String(item?.type ?? '').toUpperCase() === 'BUY' || item?.type === 0;
  const isSell =
    String(item?.type ?? '').toUpperCase() === 'SELL' || item?.type === 1;

  return (
    <View style={s.card}>
      {/* ── Header: Id + Eye + Group Name ── */}
      <View style={s.headerRow}>
        <Text style={s.idTxt}>{index + 1}</Text>
        <TouchableOpacity style={s.eyeBtn} onPress={() => onView(item)}>
          <Icon name="eye" size={14} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.groupName} numberOfLines={1}>
          {item?.group_name ||
            item?.name ||
            `Group #${item?.group_order_id || item?.id || '—'}`}
        </Text>
        {/* Type badge */}
        {item?.type !== undefined && item?.type !== null && (
          <View style={isBuy ? s.buy : s.sell}>
            <Text style={isBuy ? s.buyTxt : s.sellTxt}>
              {isBuy ? 'BUY' : 'SELL'}
            </Text>
          </View>
        )}
      </View>

      {/* ── Row 1: Symbol | Volume | Price | Stop Limit ── */}
      <View style={s.row}>
        <StatBox label="Symbol" value={item?.symbol} />
        <StatBox label="Volume" value={item?.volume} />
        <StatBox label="Price($)" value={item?.price ?? item?.price_open} />
        <StatBox
          label="Stop Limit($)"
          value={item?.stop_limit_price ?? item?.stop_limit ?? 0}
        />
      </View>

      {/* ── Row 2: SL | TP | Order Form | Filled ── */}
      <View style={s.row}>
        <StatBox label="SL" value={(item?.sl).toFixed(2)} />
        <StatBox label="TP" value={(item?.tp).toFixed(2)} />
        <StatBox label="Order Form" value={item?.order_from} />
        <StatBox
          label="Filled"
          value={item?.state_4_count}
          green={item?.state_4_count > 0}
        />
      </View>

      {/* ── Row 3: Place Order | Cancel | Failed ── */}
      <View style={s.row}>
        <StatBox label="Place Order" value={item?.state_2_count} />
        <StatBox
          label="Cancel Order"
          value={item?.state_1_count}
          red={item?.state_1_count > 0}
        />
        <StatBox
          label="Failed Order"
          value={item?.failed_count}
          red={item?.failed_count > 0}
        />
        <View style={{ flex: 1 }} />
      </View>

      {/* ── Time — small, bottom ── */}
      {item?.create_time && (
        <Text style={s.time}>{formatDateTime(item?.create_time)}</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: spacing.radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  idTxt: {
    fontSize: typography.xs,
    color: colors.textMuted,
    width: 18,
    textAlign: 'center',
  },
  eyeBtn: {
    width: 28,
    height: 28,
    borderRadius: spacing.radius.sm,
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupName: {
    flex: 1,
    fontSize: typography.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  buy: {
    backgroundColor: 'rgba(74,222,128,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  sell: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  buyTxt: { fontSize: typography.xs, fontWeight: '700', color: colors.primary },
  sellTxt: { fontSize: typography.xs, fontWeight: '700', color: colors.error },

  row: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xs },
  box: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderRadius: spacing.radius.sm,
    padding: spacing.xs + 2,
    alignItems: 'center',
  },
  boxLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: 2,
    textAlign: 'center',
  },
  boxVal: {
    fontSize: typography.xs + 1,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  time: {
    fontSize: typography.xs - 1,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
});
