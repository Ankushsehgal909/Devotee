import React, { useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { localImages } from '../../constants/images';

type SplashScreenProp = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenProp>();
  const { loadStoredSession, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (Platform.OS === 'android') {
      (StatusBar as any).setBackgroundColor?.('transparent');
      (StatusBar as any).setTranslucent?.(true);
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const init = async () => {
      await loadStoredSession();
      timer = setTimeout(() => {
        if (!isAuthenticated) {
          navigation.replace('Onboarding');
        }
      }, 1500);
    };
    init();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Image
        source={localImages.splash}
        style={styles.splashImage}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#58051E',
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
});
