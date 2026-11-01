import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, shadows, spacing } from '../../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'warm' | 'outline' | 'flat';
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'elevated',
  onPress,
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'warm':
        return styles.warm;
      case 'outline':
        return styles.outline;
      case 'flat':
        return styles.flat;
      case 'elevated':
      default:
        return styles.elevated;
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.base, getVariantStyle(), style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.base, getVariantStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  elevated: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    ...shadows.card,
  },
  warm: {
    backgroundColor: colors.bgCardAlt,
    borderWidth: 1,
    borderColor: '#FDE68A', // soft amber border
    ...shadows.subtle,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  flat: {
    backgroundColor: colors.bgSand,
  },
});
