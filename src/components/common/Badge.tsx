import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'sacred' | 'neutral' | 'gold';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  style,
  textStyle,
  icon,
}) => {
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'success':
        return {
          container: styles.successContainer,
          text: styles.successText,
        };
      case 'warning':
        return {
          container: styles.warningContainer,
          text: styles.warningText,
        };
      case 'danger':
        return {
          container: styles.dangerContainer,
          text: styles.dangerText,
        };
      case 'sacred':
        return {
          container: styles.sacredContainer,
          text: styles.sacredText,
        };
      case 'gold':
        return {
          container: styles.goldContainer,
          text: styles.goldText,
        };
      case 'neutral':
      default:
        return {
          container: styles.neutralContainer,
          text: styles.neutralText,
        };
    }
  };

  const { container, text } = getVariantStyles();

  return (
    <View style={[styles.base, container, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.baseText, text, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: 4,
  },
  baseText: {
    ...typography.caption,
    fontWeight: '600',
  },
  successContainer: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
    borderWidth: 1,
  },
  successText: {
    color: colors.success,
  },
  warningContainer: {
    backgroundColor: colors.warningBg,
    borderColor: '#FDE047',
    borderWidth: 1,
  },
  warningText: {
    color: '#854D0E',
  },
  dangerContainer: {
    backgroundColor: colors.dangerBg,
    borderColor: '#FECACA',
    borderWidth: 1,
  },
  dangerText: {
    color: colors.danger,
  },
  sacredContainer: {
    backgroundColor: colors.primaryMuted,
    borderColor: 'rgba(126, 21, 40, 0.2)',
    borderWidth: 1,
  },
  sacredText: {
    color: colors.primary,
  },
  goldContainer: {
    backgroundColor: colors.amberMuted,
    borderColor: '#FCD34D',
    borderWidth: 1,
  },
  goldText: {
    color: colors.goldAccent,
  },
  neutralContainer: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  neutralText: {
    color: colors.textSecondary,
  },
});
