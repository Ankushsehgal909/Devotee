import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Icon } from '../../components/common/Icon';
import { requestOtpApi } from '../../api/auth';

type LoginProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginProp>();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);

    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`;

    try {
      await requestOtpApi({
        identifier: formattedPhone,
        purpose: 'login',
        channel: 'sms',
      });
      navigation.navigate('VerifyOtp', { phone: formattedPhone });
    } catch (err: any) {
      // In development if backend is not reachable or returns error, provide actionable alert
      Alert.alert(
        'Authentication Notice',
        err.message || 'Unable to connect to VedSarthi API. Continuing to OTP verification.',
        [
          {
            text: 'Proceed with Code',
            onPress: () => navigation.navigate('VerifyOtp', { phone: formattedPhone }),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerArea}>
            <View style={styles.logoBadge}>
              <Icon family="material-community" name="om" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Welcome Devotee</Text>
            <Text style={styles.subtitle}>
              Sign in with your mobile number to manage your Gotra Sankalps, Puja vidhis, and sacred orders.
            </Text>
          </View>

          <View style={styles.formArea}>
            <Input
              label="Devotee Mobile Number"
              placeholder="98765 43210"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={(val) => {
                setPhone(val);
                if (error) setError('');
              }}
              error={error}
              leftIcon={<Icon family="material" name="phone" size={18} color={colors.primary} />}
              helperText="We will send a 6-digit OTP code via SMS"
            />

            <Button
              title="Get Sacred OTP"
              onPress={handleSendOtp}
              loading={loading}
              rightIcon={<Icon family="material" name="arrow-forward" size={18} color="#FFFFFF" />}
              size="lg"
              style={styles.btn}
            />

            <Text style={styles.termsText}>
              By continuing, you agree to VedSarthi Sacred Service Terms and Devotee Privacy Policy.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSand,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.screenPadding,
    justifyContent: 'center',
    flexGrow: 1,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.goldAccent,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 320,
  },
  formArea: {
    width: '100%',
  },
  btn: {
    marginTop: spacing.sm,
  },
  termsText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 18,
  },
});
