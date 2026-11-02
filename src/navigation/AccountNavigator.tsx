import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../types';
import { DevoteeDashboardScreen } from '../screens/account/DevoteeDashboardScreen';
import { ProfileSettingsScreen } from '../screens/account/ProfileSettingsScreen';
import { FamilyMembersScreen } from '../screens/account/FamilyMembersScreen';
import { SavedAddressesScreen } from '../screens/account/SavedAddressesScreen';
import { SupportDeskScreen } from '../screens/account/SupportDeskScreen';
import { PaymentLedgerScreen } from '../screens/account/PaymentLedgerScreen';
import { OrdersHistoryScreen } from '../screens/store/OrdersHistoryScreen';
import { MyBookingsScreen } from '../screens/puja/MyBookingsScreen';

const Stack = createNativeStackNavigator<AccountStackParamList>();

export const AccountNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="DevoteeDashboard"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DevoteeDashboard" component={DevoteeDashboardScreen} />
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
      <Stack.Screen name="FamilyMembers" component={FamilyMembersScreen} />
      <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} />
      <Stack.Screen name="SupportDesk" component={SupportDeskScreen} />
      <Stack.Screen name="PaymentLedger" component={PaymentLedgerScreen} />
      <Stack.Screen name="OrderHistory" component={OrdersHistoryScreen} />
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
    </Stack.Navigator>
  );
};
