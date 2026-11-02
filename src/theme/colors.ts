export const colors = {
  // Sacred Primary Brand Colors
  primary: '#7E1528',         // Sacred Kumkum Crimson (Buttons, Active Icons, Accents)
  primaryDark: '#570E1B',     // Deep Sindoor / Temple Sandalwood
  primaryLight: '#9E1B32',    // Lighter Crimson hover/active state
  primaryMuted: 'rgba(126, 21, 40, 0.08)', // Soft wash for badges and highlights

  // Sacred Secondary Accents
  amberSacred: '#F59E0B',     // Shubh Marigold & Turmeric glow
  amberMuted: '#FFFBEB',      // Pale marigold wash
  goldAccent: '#D97706',      // Consecrated Brass & Aarti flame
  goldGlow: 'rgba(217, 119, 6, 0.15)',

  // Light Theme Surfaces (Natural Khadi & Ivory)
  bgSand: '#FAF9F5',          // Screen background canvas
  bgCard: '#FFFFFF',          // Elevated card background
  bgCardAlt: '#FFFDF7',       // Warm pale yellow card
  bgCream: '#FFFDF7',         // Soft ivory cream container
  borderWarm: '#F3E6D8',      // Warm decorative border
  borderMuted: '#EAE6E1',     // Subtle separator border

  // Sanctum Obsidian (Dark Mode)
  sanctumDark: '#120E10',     // Temple Sanctum Night canvas
  sanctumCard: '#1F171A',     // Elevated Dark Card
  sanctumBorder: '#3A272C',   // Subtle dark maroon border

  // Text Colors
  textPrimary: '#1E1E24',     // High-contrast devotional black
  textSecondary: '#4A4642',   // Readable body text
  textMuted: '#78736E',       // Subtext, timestamps, captions
  textLight: '#FAF9F5',       // Light text on dark/crimson surfaces

  // Semantic Status Colors
  success: '#16A34A',         // Verified Purohit badge, confirmed booking
  successBg: '#F0FDF4',
  successBorder: '#BBF7D0',
  warning: '#EAB308',         // Muhurat alert, holding slot timer
  warningBg: '#FEFCE8',
  danger: '#DC2626',          // Rahu Kaalam, cancellations, errors
  dangerBg: '#FEF2F2',
  error: '#DC2626',
  info: '#2563EB',
  infoBg: '#EFF6FF',
  white: '#FFFFFF',
  cardBorder: '#F3E6D8',
  borderDefault: '#EAE6E1',
};

export type ThemeColors = typeof colors;
