import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

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

export default function OrderDetailCard({ item, index }) {
  const isBuy =
    String(item?.type ?? '').toUpperCase() === 'BUY' || item?.type === 0;

  return (
    <View style={s.card}>
      {/* ── Header: Id + Symbol + Type badge + P&L ── */}
      <View style={s.headerRow}>
        <Text style={s.idTxt}>{index + 1}</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.symbol}>{item?.symbol || '—'}</Text>
          <Text style={s.ticket}>{item?.broker_combine_name || ''}</Text>
          <Text style={s.ticket}>
            #{item?.ticket || item?.order_id || item?.id || '—'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 3 }}>
          <View style={isBuy ? s.buy : s.sell}>
            <Text style={isBuy ? s.buyTxt : s.sellTxt}>
              {isBuy ? 'BUY' : 'SELL'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Row 1: Volume | Price | SL | TP ── */}
      <View style={s.row}>
        <StatBox label="Volume" value={item?.volume} />
        <StatBox label="Price($)" value={item?.price ?? item?.price_open} />
        <StatBox label="SL" value={item?.sl ?? 0} />
        <StatBox label="TP" value={item?.tp ?? 0} />
      </View>

      {/* ── Row 2: Stop Limit | Account | Group ── */}
      <View style={s.row}>
        <StatBox
          label="Stop Limit($)"
          value={item?.stop_limit_price ?? item?.stop_limit ?? 0}
        />
        <StatBox
          label="State"
          value={
            <Text style={item?.is_failed ? s.failedTxt : s.filledTxt}>
              {item?.is_failed ? 'FAILED' : 'FILLED'}
            </Text>
          }
        />
        <StatBox label="Order From" value={item?.order_from} />
        <View style={{ flex: 1 }} />
      </View>

      {/* ── Time — small, bottom right ── */}
      {(item?.create_time || item?.created_at || item?.time) && (
        <Text style={s.time}>
          {item?.create_time || item?.created_at || item?.time}
        </Text>
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
  symbol: {
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
  failedTxt: {
    fontSize: typography.xs + 1,
    fontWeight: '700',
    color: colors.error,
  },
  filledTxt: {
    fontSize: typography.xs + 1,
    fontWeight: '700',
    color: colors.primary,
  },
  pnl: { fontSize: typography.xs + 1, fontWeight: '700' },
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
