export const typography = {
  // Font sizes
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 32,

  // Font weights
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',

  // Line heights
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,

  // Common text styles (ready to use with spread)
  // Usage: style={[typography.styles.heading1]}
  styles: {
    heading1: { fontSize: 28, fontWeight: '800', color: '#ffffff' },
    heading2: { fontSize: 22, fontWeight: '800', color: '#ffffff' },
    heading3: { fontSize: 18, fontWeight: '700', color: '#ffffff' },
    heading4: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
    body: { fontSize: 14, fontWeight: '400', color: '#ffffff' },
    bodyMd: { fontSize: 14, fontWeight: '500', color: '#ffffff' },
    small: { fontSize: 12, fontWeight: '400', color: '#8a9ab5' },
    smallBold: { fontSize: 12, fontWeight: '600', color: '#8a9ab5' },
    tiny: { fontSize: 10, fontWeight: '400', color: '#4a5568' },
    label: { fontSize: 12, fontWeight: '600', color: '#8a9ab5' },
    link: { fontSize: 13, fontWeight: '700', color: '#4ade80' },
    btnText: { fontSize: 16, fontWeight: '800', color: '#0a1a0e' },
    btnTextSm: { fontSize: 13, fontWeight: '700', color: '#0a1a0e' },
  },
};
