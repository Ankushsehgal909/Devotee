import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PujaStackParamList } from '../types';
import { PujaCatalogScreen } from '../screens/puja/PujaCatalogScreen';
import { PujaDetailScreen } from '../screens/puja/PujaDetailScreen';
import { PujaCheckoutScreen } from '../screens/puja/PujaCheckoutScreen';
import { MyBookingsScreen } from '../screens/puja/MyBookingsScreen';
import { BookingDetailScreen } from '../screens/puja/BookingDetailScreen';
import { DevoteePanditChatScreen } from '../screens/puja/DevoteePanditChatScreen';

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
      <Stack.Screen name="PujaCheckout" component={PujaCheckoutScreen} />
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="PanditChat" component={DevoteePanditChatScreen} />
    </Stack.Navigator>
  );
};
