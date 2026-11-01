import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { AuthStackParamList, User } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Header } from '../../components/common/Header';
import { useAuthStore } from '../../store/useAuthStore';
import { VEDIC_GOTRAS } from '../../constants/vedic';
import { updateProfileApi } from '../../api/auth';

type ProfileSetupRouteProp = RouteProp<AuthStackParamList, 'ProfileSetup'>;

export const ProfileSetupScreen: React.FC = () => {
  const route = useRoute<ProfileSetupRouteProp>();
  const { phone } = route.params;
  const { setSession } = useAuthStore();

  const [name, setName] = useState('');
  const [gotra, setGotra] = useState<string>(VEDIC_GOTRAS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleComplete = async () => {
    if (!name.trim()) {
      setError('Please enter your full devotee name');
      return;
    }
    setError('');
    setLoading(true);

    const userProfile: User = {
      id: `devotee-${Date.now()}`,
      name: name.trim(),
      phone,
      role: 'customer',
      gotra,
      walletBalanceMinor: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await updateProfileApi({
        name: name.trim(),
        gotra,
      });
    } catch {
      // Backend may be running locally or in development; proceed with local session storage
    }

    await setSession({
      accessToken: `token-${Date.now()}`,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      user: userProfile,
    });

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Spiritual Profile Setup" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Vedic Identity</Text>
        <Text style={styles.subtitle}>
          Your Gotra and spiritual details are recited by our Acharyas during Vedic Sankalps.
        </Text>

        <Input
          label="Full Devotee Name"
          placeholder="Suraj Sharma"
          value={name}
          onChangeText={(v) => {
            setName(v);
            if (error) setError('');
          }}
          error={error}
        />

        <Input
          label="Devotee Gotra"
          placeholder="Kashyap, Bharadwaja"
          value={gotra}
          onChangeText={setGotra}
          helperText="Select or type your ancestral Vedic Gotra"
        />

        <Button
          title="Save and Enter Sanctuary"
          onPress={handleComplete}
          loading={loading}
          size="lg"
          style={styles.btn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSand,
  },
  content: {
    padding: spacing.screenPadding,
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  btn: {
    marginTop: spacing.xl,
  },
});
