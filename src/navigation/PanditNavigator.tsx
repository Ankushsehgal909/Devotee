import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PanditsDirectoryScreen } from '../screens/pandits/PanditsDirectoryScreen';
import { PanditDetailScreen } from '../screens/pandits/PanditDetailScreen';

export type PanditStackParamList = {
  PanditsDirectory: undefined;
  PanditDetail: { panditId: string };
};

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
    </Stack.Navigator>
  );
};
