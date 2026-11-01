import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  h1: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: 0.2,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: 0.1,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  captionSmall: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 12,
  },
  mantraText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: 0.4,
  },
};
