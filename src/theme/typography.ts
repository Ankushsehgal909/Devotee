import { TextStyle, Platform } from 'react-native';

export const typography = {
  fontFamilySerif: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  fontFamilySans: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  h1: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: 0.2,
  } as TextStyle,
  h2: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: 0.1,
  } as TextStyle,
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  } as TextStyle,
  h4: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  } as TextStyle,
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } as TextStyle,
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } as TextStyle,
  caption: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  } as TextStyle,
  captionSmall: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 12,
  } as TextStyle,
  mantraText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: 0.4,
  } as TextStyle,
};
