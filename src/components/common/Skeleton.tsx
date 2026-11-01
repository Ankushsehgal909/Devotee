import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ViewStyle,
  DimensionValue,
} from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius: radius = borderRadius.sm,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width,
          height,
          borderRadius: radius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const SkeletonLine: React.FC<{
  width?: DimensionValue;
  height?: number;
  style?: ViewStyle;
}> = ({ width = '100%', height = 14, style }) => (
  <Skeleton width={width} height={height} borderRadius={borderRadius.xs} style={style} />
);

export const SkeletonCircle: React.FC<{
  size: number;
  style?: ViewStyle;
}> = ({ size, style }) => (
  <Skeleton
    width={size}
    height={size}
    borderRadius={size / 2}
    style={style}
  />
);

/** Panchang Daily Strip Loading Skeleton */
export const PanchangSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.cardContainer, styles.warmCard, style]}>
    <View style={styles.rowBetween}>
      <View style={styles.row}>
        <SkeletonCircle size={38} style={styles.marginRight} />
        <View style={styles.columnGap}>
          <SkeletonLine width={140} height={18} />
          <SkeletonLine width={200} height={12} />
        </View>
      </View>
      <Skeleton width={80} height={22} borderRadius={borderRadius.full} />
    </View>
    <View style={styles.divider} />
    <View style={styles.rowBetween}>
      <SkeletonLine width={150} height={12} />
      <SkeletonLine width={120} height={12} />
    </View>
  </View>
);

/** Sacred Puja Service Card Loading Skeleton */
export const PujaCardSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.cardContainer, style]}>
    <View style={styles.row}>
      <SkeletonCircle size={38} style={styles.marginRight} />
      <View style={[styles.columnGap, { flex: 1 }]}>
        <SkeletonLine width="75%" height={16} />
        <SkeletonLine width="35%" height={12} />
      </View>
    </View>

    <View style={[styles.columnGap, { marginVertical: spacing.sm }]}>
      <SkeletonLine width="100%" height={12} />
      <SkeletonLine width="85%" height={12} />
    </View>

    <View style={styles.row}>
      <Skeleton width={90} height={20} borderRadius={borderRadius.sm} style={styles.marginRightSmall} />
      <Skeleton width={80} height={20} borderRadius={borderRadius.sm} />
    </View>

    <View style={styles.divider} />

    <View style={styles.rowBetween}>
      <View style={styles.columnGap}>
        <SkeletonLine width={70} height={10} />
        <SkeletonLine width={90} height={18} />
      </View>
      <Skeleton width={100} height={32} borderRadius={borderRadius.md} />
    </View>
  </View>
);

/** Consecrated Store Product Loading Skeleton */
export const ProductCardSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.cardContainer, style]}>
    <View style={styles.rowBetween}>
      <Skeleton width={80} height={18} borderRadius={borderRadius.full} />
      <Skeleton width={40} height={14} borderRadius={borderRadius.xs} />
    </View>

    <View style={[styles.columnGap, { marginVertical: spacing.sm }]}>
      <SkeletonLine width="80%" height={16} />
      <SkeletonLine width="100%" height={12} />
      <SkeletonLine width="65%" height={12} />
    </View>

    <View style={styles.divider} />

    <View style={styles.rowBetween}>
      <SkeletonLine width={70} height={20} />
      <Skeleton width={75} height={30} borderRadius={borderRadius.md} />
    </View>
  </View>
);

/** Devotee Dashboard Profile and Metrics Loading Skeleton */
export const DevoteeDashboardSkeleton: React.FC = () => (
  <View style={styles.dashboardContainer}>
    {/* Profile Banner */}
    <View style={styles.bannerSkeleton}>
      <SkeletonCircle size={54} style={styles.marginRight} />
      <View style={[styles.columnGap, { flex: 1 }]}>
        <SkeletonLine width="60%" height={18} />
        <SkeletonLine width="45%" height={12} />
        <SkeletonLine width="40%" height={10} />
      </View>
    </View>

    {/* 2x2 Metric Counters */}
    <View style={styles.metricsGrid}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.metricCardSkeleton}>
          <SkeletonCircle size={24} />
          <SkeletonLine width={40} height={22} style={styles.marginVerticalSmall} />
          <SkeletonLine width={80} height={12} />
        </View>
      ))}
    </View>

    {/* Family Tree Skeleton */}
    <View style={[styles.cardContainer, styles.warmCard, { marginTop: spacing.md }]}>
      <SkeletonLine width="55%" height={16} style={{ marginBottom: spacing.xs }} />
      <SkeletonLine width="80%" height={12} style={{ marginBottom: spacing.md }} />
      {[1, 2].map((i) => (
        <View key={i} style={[styles.rowBetween, { paddingVertical: spacing.xs }]}>
          <View style={styles.columnGap}>
            <SkeletonLine width={120} height={14} />
            <SkeletonLine width={160} height={10} />
          </View>
          <Skeleton width={50} height={18} borderRadius={borderRadius.full} />
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: '#EADFCF', // Soft sacred warm bone tone
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderWarm,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  warmCard: {
    backgroundColor: '#FFFDF9',
    borderColor: '#FDE68A',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  columnGap: {
    gap: 4,
  },
  marginRight: {
    marginRight: spacing.md,
  },
  marginRightSmall: {
    marginRight: spacing.xs,
  },
  marginVerticalSmall: {
    marginVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderWarm,
    marginVertical: spacing.sm,
  },
  dashboardContainer: {
    width: '100%',
  },
  bannerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricCardSkeleton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderWarm,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
});
