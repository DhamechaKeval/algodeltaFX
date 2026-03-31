import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export const detailStyles = StyleSheet.create({
  // ── Header banner ─────────────────────────────────────────
  banner: {
    backgroundColor: colors.bgCard,
    borderRadius: spacing.radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.base,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: spacing.radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bannerName: {
    flex: 1,
    fontSize: typography.sm + 1,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  bannerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  pnlPositive: { color: colors.primary },
  pnlNegative: { color: colors.error },

  bannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    justifyContent: 'flex-end',
  },
  placeOrderBtn: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  placeOrderTxt: {
    fontSize: typography.xs + 1,
    fontWeight: typography.bold,
    color: colors.primaryText,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: spacing.radius.sm,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconBtnGreen: {
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderColor: 'rgba(74,222,128,0.3)',
  },

  // ── Tab bar ───────────────────────────────────────────────
  tabWrap: {
    flexDirection: 'row',
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    backgroundColor: colors.bgCard,
    borderRadius: spacing.radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    borderRadius: spacing.radius.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabTxt: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  tabTxtActive: {
    color: colors.primaryText,
  },

  // ── Toolbar ───────────────────────────────────────────────
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 1,
  },
  exportTxt: {
    fontSize: typography.xs + 1,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  squareOffBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 1,
  },
  squareOffTxt: {
    fontSize: typography.xs + 1,
    color: colors.error,
    fontWeight: typography.semibold,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.4)',
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 1,
    marginLeft: 'auto',
  },
  refreshTxt: {
    fontSize: typography.xs + 1,
    color: '#8B5CF6',
    fontWeight: typography.semibold,
  },

  // ── Position row card ─────────────────────────────────────
  posCard: {
    backgroundColor: colors.bgCard,
    borderRadius: spacing.radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  posRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  posSymbol: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  posTicket: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  typeBuy: {
    backgroundColor: 'rgba(74,222,128,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
    borderRadius: spacing.radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  typeSell: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: spacing.radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  typeBuyTxt: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  typeSellTxt: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.error,
  },

  posRow2: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  posStat: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderRadius: spacing.radius.sm,
    padding: spacing.xs + 1,
    alignItems: 'center',
  },
  posStatL: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  posStatV: {
    fontSize: typography.xs + 1,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },

  closeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: spacing.radius.sm,
    paddingVertical: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  closeBtnTxt: {
    fontSize: typography.xs + 1,
    fontWeight: typography.bold,
    color: colors.error,
  },
});
