import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function UserOrderCard({ item, index }) {
  const isBuy =
    String(item?.type ?? '').toUpperCase() === 'BUY' || item?.type === 0;

  return (
    <View style={s.card}>
      {/* Row 1: Id + Account Name + Type badge */}
      <View style={s.row}>
        <Text style={s.id}>{index + 1}</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.accountName} numberOfLines={1}>
            {item?.account_name || item?.nic_name || item?.broker_name || '—'}
          </Text>
          <Text style={s.ticket}>
            #{item?.ticket || item?.order_id || item?.id || '—'}
          </Text>
        </View>
        <View style={isBuy ? s.buy : s.sell}>
          <Text style={isBuy ? s.buyTxt : s.sellTxt}>
            {isBuy ? 'BUY' : 'SELL'}
          </Text>
        </View>
      </View>

      {/* Row 2: Symbol | Volume | Price | Stop Limit */}
      <View style={s.statsRow}>
        <StatBox label="Symbol" value={item?.symbol} />
        <StatBox label="Volume" value={item?.volume} />
        <StatBox label="Price($)" value={item?.price ?? item?.price_open} />
        <StatBox
          label="Stop Limit"
          value={item?.stop_limit_price ?? item?.sl ?? 0}
        />
      </View>

      {item?.create_time || item?.created_at ? (
        <Text style={s.time}>{item?.create_time || item?.created_at}</Text>
      ) : null}
    </View>
  );
}

function StatBox({ label, value }) {
  return (
    <View style={s.box}>
      <Text style={s.boxLabel}>{label}</Text>
      <Text style={s.boxVal} numberOfLines={1}>
        {value ?? '—'}
      </Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  id: {
    fontSize: typography.xs,
    color: colors.textMuted,
    width: 20,
    textAlign: 'center',
  },
  accountName: {
    fontSize: typography.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ticket: { fontSize: typography.xs, color: colors.textMuted, marginTop: 1 },
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
  buyTxt: {
    fontSize: typography.xs + 1,
    fontWeight: '700',
    color: colors.primary,
  },
  sellTxt: {
    fontSize: typography.xs + 1,
    fontWeight: '700',
    color: colors.error,
  },
  statsRow: { flexDirection: 'row', gap: spacing.xs },
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
  },
  boxVal: {
    fontSize: typography.xs + 1,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  time: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
