import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
  StyleProp,
} from 'react-native';

interface SacredShimmerProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  shimmerColor?: string;
  duration?: number;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
}

export const SacredShimmer: React.FC<SacredShimmerProps> = ({
  children,
  style,
  shimmerColor = 'rgba(255, 235, 180, 0.35)',
  duration = 2400,
  width,
  height,
  borderRadius = 10,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.delay(1200),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue, duration]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-140, 260],
  });

  return (
    <View
      style={[
        styles.container,
        width !== undefined && { width },
        height !== undefined && { height },
        { borderRadius },
        style,
      ]}
    >
      {children}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.shimmerOverlay,
          {
            backgroundColor: shimmerColor,
            transform: [{ translateX }, { skewX: '-25deg' }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 60,
    opacity: 0.65,
  },
});
