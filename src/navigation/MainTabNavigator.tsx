import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { PujaNavigator } from './PujaNavigator';
import { JapamMalaScreen } from '../screens/utilities/JapamMalaScreen';
import { StoreHomeScreen } from '../screens/store/StoreHomeScreen';
import { DevoteeDashboardScreen } from '../screens/account/DevoteeDashboardScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Home, Flame, Sparkles, ShoppingBag, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Darshan',
          tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
        }}
      />

      <Tab.Screen
        name="PujasTab"
        component={PujaNavigator}
        options={{
          tabBarLabel: 'Pujas',
          tabBarIcon: ({ color, size }) => <Flame size={size || 22} color={color} />,
        }}
      />

      {/* Central Elevated Sacred Action (Japam Mala 108 Beads) */}
      <Tab.Screen
        name="MalaTab"
        component={JapamMalaScreen}
        options={{
          tabBarLabel: 'Japam',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.centralTabAction}>
              <Sparkles size={24} color="#FFFFFF" />
            </View>
          ),
          tabBarLabelStyle: styles.centralLabel,
        }}
      />

      <Tab.Screen
        name="StoreTab"
        component={StoreHomeScreen}
        options={{
          tabBarLabel: 'Samagri',
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size || 22} color={color} />,
        }}
      />

      <Tab.Screen
        name="AccountTab"
        component={DevoteeDashboardScreen}
        options={{
          tabBarLabel: 'Devotee',
          tabBarIcon: ({ color, size }) => <User size={size || 22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: colors.borderWarm,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    ...typography.captionSmall,
    fontWeight: '600',
  },
  centralTabAction: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  centralLabel: {
    ...typography.captionSmall,
    fontWeight: '700',
    color: colors.primary,
  },
});
