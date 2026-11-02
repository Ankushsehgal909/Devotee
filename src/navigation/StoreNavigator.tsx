import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StoreStackParamList } from '../types';
import { StoreHomeScreen } from '../screens/store/StoreHomeScreen';
import { BestSellerScreen } from '../screens/store/BestSellerScreen';
import { SacredGiftsScreen } from '../screens/store/SacredGiftsScreen';
import { ProductDetailScreen } from '../screens/store/ProductDetailScreen';
import { CartScreen } from '../screens/store/CartScreen';
import { StoreCheckoutScreen } from '../screens/store/StoreCheckoutScreen';
import { OrderConfirmationScreen } from '../screens/store/OrderConfirmationScreen';
import { OrdersHistoryScreen } from '../screens/store/OrdersHistoryScreen';

const Stack = createNativeStackNavigator<StoreStackParamList>();

export const StoreNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="StoreHome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="StoreHome" component={StoreHomeScreen} />
      <Stack.Screen name="BestSeller" component={BestSellerScreen} />
      <Stack.Screen name="SacredGifts" component={SacredGiftsScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="StoreCheckout" component={StoreCheckoutScreen} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
      <Stack.Screen name="OrderHistory" component={OrdersHistoryScreen} />
    </Stack.Navigator>
  );
};
