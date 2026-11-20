import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
  StyleProp,
} from 'react-native';

interface SacredAuraProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  auraColor?: string;
  size?: number;
  active?: boolean;
}

export const SacredAura: React.FC<SacredAuraProps> = ({
  children,
  style,
  auraColor = 'rgba(217, 119, 6, 0.22)',
  size = 60,
  active = true,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!active) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.8,
            duration: 1600,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.35,
            duration: 1600,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim, opacityAnim, active]);

  return (
    <View style={[styles.wrapper, style]}>
      {active && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.auraDisk,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: auraColor,
              transform: [{ scale: pulseAnim }],
              opacity: opacityAnim,
            },
          ]}
        />
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  auraDisk: {
    position: 'absolute',
  },
});
