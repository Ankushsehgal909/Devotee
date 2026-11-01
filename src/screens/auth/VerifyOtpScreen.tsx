import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Header } from '../../components/common/Header';
import { verifyOtpApi, requestOtpApi } from '../../api/auth';
import { useAuthStore } from '../../store/useAuthStore';

type VerifyOtpRouteProp = RouteProp<AuthStackParamList, 'VerifyOtp'>;
type VerifyOtpNavProp = NativeStackNavigationProp<AuthStackParamList, 'VerifyOtp'>;

export const VerifyOtpScreen: React.FC = () => {
  const route = useRoute<VerifyOtpRouteProp>();
  const navigation = useNavigation<VerifyOtpNavProp>();
  const { phone } = route.params;
  const { setSession } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (otp.length < 6) {
      setError('Please enter the complete 6-digit OTP code');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const session = await verifyOtpApi({
        identifier: phone,
        code: otp,
      });

      if (session && session.accessToken) {
        await setSession(session);
        return;
      }
      navigation.navigate('ProfileSetup', { phone });
    } catch (err: any) {
      // If user profile is not yet created on backend or invalid test code, fallback to setup
      Alert.alert(
        'Verification Info',
        err.message || 'OTP verification returned an error. Proceeding to profile setup.',
        [
          {
            text: 'Continue Setup',
            onPress: () => navigation.navigate('ProfileSetup', { phone }),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await requestOtpApi({ identifier: phone, purpose: 'login' });
      Alert.alert('OTP Resent', 'A fresh code has been sent to your mobile number.');
    } catch (e: any) {
      Alert.alert('Notice', e.message || 'Please wait before requesting a new code.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Verify Identity" showBack />
      <View style={styles.content}>
        <Text style={styles.title}>Enter 6-Digit Code</Text>
        <Text style={styles.subtitle}>
          We sent a verification OTP to <Text style={styles.bold}>{phone}</Text>
        </Text>

        <Input
          placeholder="------"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={(v) => {
            setOtp(v);
            if (error) setError('');
          }}
          error={error}
          containerStyle={styles.otpInput}
          inputStyle={styles.otpText}
        />

        <Button
          title="Verify and Continue"
          onPress={handleVerify}
          loading={loading}
          size="lg"
          style={styles.btn}
        />

        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Did not receive the code? </Text>
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendBtn}>Resend via SMS</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingTop: spacing.xxl,
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
  },
  bold: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  otpInput: {
    marginTop: spacing.md,
  },
  otpText: {
    letterSpacing: 10,
    fontSize: 22,
    textAlign: 'center',
  },
  btn: {
    marginTop: spacing.md,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  resendLabel: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  resendBtn: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
});
