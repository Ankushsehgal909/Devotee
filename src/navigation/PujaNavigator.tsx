import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PujaStackParamList } from '../types';
import { PujaCatalogScreen } from '../screens/puja/PujaCatalogScreen';
import { PujaDetailScreen } from '../screens/puja/PujaDetailScreen';

const Stack = createNativeStackNavigator<PujaStackParamList>();

export const PujaNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="PujaCatalog"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="PujaCatalog" component={PujaCatalogScreen} />
      <Stack.Screen name="PujaDetail" component={PujaDetailScreen} />
    </Stack.Navigator>
  );
};
