import {StyleSheet} from 'react-native';
import {colors}     from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing}    from '../theme/spacing';

export const common = StyleSheet.create({
  // ── Containers ──────────────────────────────
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: spacing.radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },

  // ── Header ──────────────────────────────────
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
  logo: {
    width: 130,
    height: 36,
  },

  // ── Page title row ───────────────────────────
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

  // ── Rows ────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // ── List ────────────────────────────────────
  listContent: {
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },

  // ── Divider ─────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },

  // ── Text helpers ────────────────────────────
  textPrimary: {
    fontSize: typography.md,
    color: colors.textPrimary,
  },
  textSecondary: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  textMuted: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
  textGreen: {
    color: colors.primary,
  },
  textError: {
    color: colors.error,
  },
  textBold: {
    fontWeight: typography.bold,
  },
  textCenter: {
    textAlign: 'center',
  },

  // ── Section label ────────────────────────────
  sectionLabel: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});