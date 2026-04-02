import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export const accountStyles = StyleSheet.create({
  // ── Card wrapper ─────────────────────────────────────────────
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: spacing.radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },

  // ── Name row ─────────────────────────────────────────────────
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: spacing.radius.full,
    flexShrink: 0,
  },
  accountName: {
    flex: 1,
    fontSize: typography.sm + 1,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  moreBtn: {
    padding: spacing.xs,
  },
  moreIcon: {
    fontSize: 18,
    color: colors.textSecondary,
  },

  // ── Badge row ─────────────────────────────────────────────────
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },

  // ── Stats rows ────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },

  // ── Divider ───────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },

  // ── Bottom action row ─────────────────────────────────────────
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  togglesWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  toggleLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },

  // ── Icon buttons ──────────────────────────────────────────────
  iconGroup: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: spacing.radius.sm,
    backgroundColor: colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBtnGreen: {
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderColor: 'rgba(74,222,128,0.3)',
  },
  iconBtnRed: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.3)',
  },
  iconTxt: {
    fontSize: 14,
  },

  // ── Add Account Modal ─────────────────────────────────────────
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  modalTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  modalClose: {
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
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabTxt: {
    fontSize: typography.xs + 1,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tabTxtActive: {
    color: colors.primaryText,
  },
  twoCol: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  switchLabel: {
    fontSize: typography.md,
    color: colors.textPrimary,
    fontWeight: typography.medium,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.base,
  },
});
