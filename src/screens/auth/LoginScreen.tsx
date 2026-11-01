import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Phone, ArrowRight } from 'lucide-react-native';

type LoginProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginProp>();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = () => {
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigation.navigate('VerifyOtp', { phone: `+91${cleanPhone}` });
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerArea}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>VS</Text>
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
              leftIcon={<Phone size={18} color={colors.primary} />}
              helperText="We will send a 6-digit divine OTP via SMS"
            />

            <Button
              title="Get Sacred OTP"
              onPress={handleSendOtp}
              loading={loading}
              rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
              size="lg"
              style={styles.btn}
            />

            <Text style={styles.termsText}>
              By continuing, you agree to VedSarthi's Sacred Service Terms and Devotee Privacy Policy.
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
  logoText: {
    ...typography.h3,
    color: '#FFFFFF',
    fontWeight: '800',
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
