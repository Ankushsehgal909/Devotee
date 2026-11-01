import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { TextStyle } from 'react-native';

export type IconFamily = 'material-community' | 'material' | 'ionicons' | 'feather';

export interface IconProps {
  family?: IconFamily;
  name: string;
  size?: number;
  color?: string;
  style?: TextStyle;
}

export const Icon: React.FC<IconProps> = ({
  family = 'material-community',
  name,
  size = 24,
  color = '#1E1E24',
  style,
}) => {
  switch (family) {
    case 'material':
      return <MaterialIcons name={name} size={size} color={color} style={style} />;
    case 'ionicons':
      return <Ionicons name={name} size={size} color={color} style={style} />;
    case 'feather':
      return <Feather name={name} size={size} color={color} style={style} />;
    case 'material-community':
    default:
      return <MaterialCommunityIcons name={name} size={size} color={color} style={style} />;
  }
};

export { MaterialCommunityIcons, MaterialIcons, Ionicons, Feather };
