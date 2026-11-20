import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from '../types';
import { HomeNavigator } from './HomeNavigator';
import { PujaNavigator } from './PujaNavigator';
import { PanditNavigator } from './PanditNavigator';
import { StoreNavigator } from './StoreNavigator';
import { AccountNavigator } from './AccountNavigator';
import { colors } from '../theme/colors';
import { Icon } from '../components/common/Icon';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 12 : 8);
  const barHeight = (Platform.OS === 'ios' ? 56 : 58) + bottomPadding;

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#8C827A',
        tabBarStyle: [
          styles.tabBar,
          {
            height: barHeight,
            paddingBottom: bottomPadding,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigator}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('HomeTab', {
              screen: 'HomeScreen',
            });
          },
        })}
        options={{
          tabBarLabel: 'Darshan',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Icon
                family="material-community"
                name={focused ? 'home-variant' : 'home-variant-outline'}
                size={22}
                color={focused ? colors.primary : '#8C827A'}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="PujasTab"
        component={PujaNavigator}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('PujasTab', {
              screen: 'PujaCatalog',
            });
          },
        })}
        options={{
          tabBarLabel: 'Pujas',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Icon
                family="material-community"
                name={focused ? 'fire' : 'fire'}
                size={22}
                color={focused ? colors.primary : '#8C827A'}
              />
            </View>
          ),
        }}
      />

      {/* Central Elevated Pandits Tab (Gurukul Acharyas) */}
      <Tab.Screen
        name="PanditsTab"
        component={PanditNavigator}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('PanditsTab', {
              screen: 'PanditsDirectory',
            });
          },
        })}
        options={{
          tabBarLabel: 'Pandits',
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.centralTabAction,
                focused && styles.centralTabActionActive,
              ]}
            >
              <View style={styles.centralTabInner}>
                <Icon
                  family="material-community"
                  name="account-group"
                  size={24}
                  color={focused ? '#FFF5D6' : '#FFFFFF'}
                />
              </View>
            </View>
          ),
          tabBarLabelStyle: styles.centralLabel,
        }}
      />

      <Tab.Screen
        name="StoreTab"
        component={StoreNavigator}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('StoreTab', {
              screen: 'StoreHome',
            });
          },
        })}
        options={{
          tabBarLabel: 'Samagri',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Icon
                family="material-community"
                name={focused ? 'shopping' : 'shopping-outline'}
                size={22}
                color={focused ? colors.primary : '#8C827A'}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="AccountTab"
        component={AccountNavigator}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('AccountTab', {
              screen: 'DevoteeDashboard',
            });
          },
        })}
        options={{
          tabBarLabel: 'Devotee',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Icon
                family="material-community"
                name={focused ? 'account-circle' : 'account-circle-outline'}
                size={22}
                color={focused ? colors.primary : '#8C827A'}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#F0E4D5',
    borderTopWidth: 1.2,
    paddingTop: 6,
    // Soft sacred shadow
    shadowColor: '#4A0D15',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 12,
  },
  tabBarLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  iconWrap: {
    width: 42,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(126, 21, 40, 0.09)', // Sacred crimson soft aura
  },
  centralTabAction: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 7,
  },
  centralTabActionActive: {
    borderColor: '#E5C378', // Sacred golden halo border
    backgroundColor: '#680E1C',
    shadowColor: '#D97706',
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 9,
  },
  centralTabInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centralLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: colors.primary,
    marginTop: 2,
  },
});
