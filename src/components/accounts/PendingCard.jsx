import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '../../components/common/Icon';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const TYPE_MAP = {
  0: { label: 'BUY', isBuy: true },
  1: { label: 'SELL', isBuy: false },
  2: { label: 'BUY LIMIT', isBuy: true },
  3: { label: 'SELL LIMIT', isBuy: false },
  4: { label: 'BUY STOP', isBuy: true },
  5: { label: 'SELL STOP', isBuy: false },
  6: { label: 'BUY STOP LIMIT', isBuy: true },
  7: { label: 'SELL STOP LIMIT', isBuy: false },
};

// ── Pending Card ──────────────────────────────────────────────────
export function PendingCard({ item, onEdit, onSquareOff }) {
  const typeNum = Number(item?.type ?? 0);
  const typeInfo = TYPE_MAP[typeNum] ?? {
    label: String(item?.type ?? '—'),
    isBuy: true,
  };
  const { label: typeLabel, isBuy } = typeInfo;

  const hasSl = item?.sl && item.sl !== 0;
  const hasTp = item?.tp && item.tp !== 0;

  return (
    <View style={s.card}>
      {/* Row 1: Symbol + Type + PnL */}
      <View style={s.cardRow1}>
        <View>
          <Text style={s.symbol}>{item?.symbol || '—'}</Text>
          <Text style={s.ticket}>#{item?.ticket}</Text>
        </View>
        <View style={s.row1Right}>
          <View style={isBuy ? s.buy : s.sell}>
            <Text style={isBuy ? s.buyTxt : s.sellTxt}>{typeLabel}</Text>
          </View>
        </View>
      </View>

      {/* Row 2: Volume | Price | SL | TP */}
      <View style={s.statsRow}>
        <View style={s.statBox}>
          <Text style={s.statLabel}>Volume</Text>
          <Text style={s.statVal}>
            {item?.volume_initial ?? '—'}/
            {item?.volume_initial - item?.volume_current}
          </Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statLabel}>Price($)</Text>
          <Text style={s.statVal}>
            {item?.price_open ?? item?.price ?? '—'}
          </Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statLabel}>SL</Text>
          <TouchableOpacity onPress={() => onEdit(item)}>
            {hasSl ? (
              <Text style={s.statVal}>{item.sl}</Text>
            ) : (
              <Text style={s.addLink}>Add</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={s.statBox}>
          <Text style={s.statLabel}>TP</Text>
          <TouchableOpacity onPress={() => onEdit(item)}>
            {hasTp ? (
              <Text style={s.statVal}>{item.tp}</Text>
            ) : (
              <Text style={s.addLink}>Add</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Row 3: Action buttons */}
      <View style={s.cardBottom}>
        <Text style={s.timeText}>{item?.create_time || ''}</Text>
        <View style={s.actionRow}>
          {/* Edit SL/TP */}
          <TouchableOpacity style={s.editBtn} onPress={() => onEdit(item)}>
            <Icon name="settings" size={13} color="#EF9F27" strokeWidth={1.8} />
            <Text style={s.editBtnTxt}>Edit SL/TP</Text>
          </TouchableOpacity>
          {/* Square Off — red */}
          <TouchableOpacity
            style={s.squareBtn}
            onPress={() => onSquareOff(item)}
          >
            <Icon name="x" size={13} color="#fff" strokeWidth={2.5} />
            <Text style={s.squareBtnTxt}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  cardRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  symbol: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  ticket: { fontSize: typography.xs, color: colors.textMuted, marginTop: 2 },
  row1Right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  buy: {
    backgroundColor: 'rgba(74,222,128,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
    borderRadius: spacing.radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  sell: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: spacing.radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  buyTxt: {
    fontSize: typography.xs + 1,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  sellTxt: {
    fontSize: typography.xs + 1,
    fontWeight: typography.bold,
    color: colors.error,
  },
  statsRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
  statBox: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderRadius: spacing.radius.sm,
    padding: spacing.xs + 2,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statVal: {
    fontSize: typography.xs + 1,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  addLink: {
    fontSize: typography.xs + 1,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  timeText: { fontSize: typography.xs, color: colors.textMuted },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239,159,39,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,159,39,0.3)',
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  editBtnTxt: {
    fontSize: typography.xs + 1,
    fontWeight: typography.semibold,
    color: '#EF9F27',
  },
  squareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.error,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  squareBtnTxt: {
    fontSize: typography.xs + 1,
    fontWeight: typography.bold,
    color: '#fff',
  },
});
