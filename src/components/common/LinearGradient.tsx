import React, { useId } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Rect,
} from 'react-native-svg';

export interface LinearGradientProps {
  colors: (string | number)[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: number[];
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const LinearGradient: React.FC<LinearGradientProps> = ({
  colors,
  start = { x: 0, y: 0 },
  end = { x: 0, y: 1 },
  locations,
  style,
  children,
}) => {
  const reactId = useId();
  const gradId = `grad_${reactId.replace(/[^a-zA-Z0-9]/g, '_')}`;

  return (
    <View style={[styles.container, style]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg
          style={StyleSheet.absoluteFill}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
        >
          <Defs>
            <SvgGradient
              id={gradId}
              x1={`${start.x * 100}%`}
              y1={`${start.y * 100}%`}
              x2={`${end.x * 100}%`}
              y2={`${end.y * 100}%`}
            >
              {colors.map((color, index) => {
                const offset =
                  locations && locations[index] !== undefined
                    ? `${locations[index] * 100}%`
                    : `${
                        colors.length > 1
                          ? (index / (colors.length - 1)) * 100
                          : 0
                      }%`;
                return (
                  <Stop key={index} offset={offset} stopColor={String(color)} />
                );
              })}
            </SvgGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${gradId})`} />
        </Svg>
      </View>
      {children}
    </View>
  );
};

export default LinearGradient;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
});
