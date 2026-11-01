import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useAuthStore } from '../../store/useAuthStore';
import { Icon } from '../../components/common/Icon';

type SplashScreenProp = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenProp>();
  const { loadStoredSession, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await loadStoredSession();
      setTimeout(() => {
        if (!isAuthenticated) {
          navigation.replace('Onboarding');
        }
      }, 1500);
    };
    init();
  }, [isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.symbolWrapper}>
        <Icon family="material-community" name="om" size={54} color={colors.goldAccent} />
      </View>
      <Text style={styles.title}>VEDSARTHI</Text>
      <Text style={styles.subtitle}>Sacred Vedic Rituals and Pure Samagri</Text>
      <Text style={styles.tagline}>Devotee Spiritual Companion</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  symbolWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 2,
    borderColor: colors.goldAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    ...typography.h1,
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: 6,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: '#FDE68A',
    textAlign: 'center',
  },
  tagline: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
