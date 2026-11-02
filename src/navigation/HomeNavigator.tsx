import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { FestivalCalendarScreen } from '../screens/home/FestivalCalendarScreen';
import { PanditsDirectoryScreen } from '../screens/pandits/PanditsDirectoryScreen';
import { PanditDetailScreen } from '../screens/pandits/PanditDetailScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="FestivalCalendar" component={FestivalCalendarScreen} />
      <Stack.Screen name="PanditsDirectory" component={PanditsDirectoryScreen} />
      <Stack.Screen name="PanditDetail" component={PanditDetailScreen} />
    </Stack.Navigator>
  );
};
