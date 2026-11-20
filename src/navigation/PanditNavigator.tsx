import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PanditsDirectoryScreen } from '../screens/pandits/PanditsDirectoryScreen';
import { PanditDetailScreen } from '../screens/pandits/PanditDetailScreen';
import { PujaDetailScreen } from '../screens/puja/PujaDetailScreen';
import { PujaCheckoutScreen } from '../screens/puja/PujaCheckoutScreen';
import { PanditStackParamList } from '../types/navigation';

export type { PanditStackParamList };

const Stack = createNativeStackNavigator<PanditStackParamList>();

export const PanditNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="PanditsDirectory"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="PanditsDirectory"
        component={PanditsDirectoryScreen}
      />
      <Stack.Screen name="PanditDetail" component={PanditDetailScreen} />
      <Stack.Screen name="PujaDetail" component={PujaDetailScreen} />
      <Stack.Screen name="PujaCheckout" component={PujaCheckoutScreen} />
    </Stack.Navigator>
  );
};
