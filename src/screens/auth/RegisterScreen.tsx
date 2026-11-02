import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
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
import { Header } from '../../components/common/Header';
import { registerCustomerApi, normalizeIdentifier } from '../../api/auth';

type RegisterNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNavigationProp>();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const cleanName = name.trim();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const cleanEmail = email.trim();

    if (!cleanName || cleanName.length < 2) {
      setError('Please enter your full name (at least 2 characters)');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (password && password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      setError('Please accept the Terms of Service & Privacy Policy');
      return;
    }

    setError('');
    setLoading(true);

    const formattedPhone = normalizeIdentifier(cleanPhone);

    try {
      const result = await registerCustomerApi({
        name: cleanName,
        phone: formattedPhone,
        ...(cleanEmail ? { email: cleanEmail } : {}),
        ...(password ? { password } : {}),
        acceptedTermsAt: new Date().toISOString(),
        preferredLanguage: 'en',
      });

      if (result && result.otp) {
        navigation.navigate('VerifyOtp', {
          otpId: result.otp.otpId,
          identifier: formattedPhone,
          purpose: 'register',
          channel: result.otp.channel,
          resendAvailableAt: result.otp.resendAvailableAt,
          phone: formattedPhone,
        });
      } else {
        navigation.navigate('Login');
      }
    } catch (err: any) {
      const msg = err?.message || 'Registration failed. Please check your details and try again.';
      if (err?.statusCode === 409 || msg.toLowerCase().includes('already exists')) {
        setError('An account with this phone or email already exists. Tap below to sign in or verify.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <Header
        title="Create Devotee Account"
        showBack
        onBackPress={() => navigation.navigate('Login')}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introBox}>
            <Text style={styles.heading}>Welcome to VedSarthi</Text>
            <Text style={styles.subheading}>
              Register to book authentic Vedic pujas, consult verified Pandits, and receive holy Prasadam at your home.
            </Text>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBox}>
              <Icon family="material" name="error-outline" size={18} color={colors.error} />
              <View style={styles.errorContent}>
                <Text style={styles.errorText}>{error}</Text>
                {error.includes('exists') || error.includes('verify') ? (
                  <TouchableOpacity
                    style={styles.errorActionBtn}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.errorActionText}>Go to Login / Verify →</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ) : null}

          {/* Form Card */}
          <View style={styles.formCard}>
            <Input
              label="Full Name *"
              placeholder="e.g. Ramesh Kumar Sharma"
              value={name}
              onChangeText={(val) => {
                setName(val);
                if (error) setError('');
              }}
              leftIcon={<Icon family="material" name="person" size={18} color={colors.primary} />}
            />

            <Input
              label="Mobile Number *"
              placeholder="98765 43210"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={(val) => {
                setPhone(val);
                if (error) setError('');
              }}
              leftIcon={
                <View style={styles.countryCodeWrap}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
              }
              helperText="Verification OTP will be dispatched to this number"
            />

            <Input
              label="Email Address (Optional)"
              placeholder="ramesh@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (error) setError('');
              }}
              leftIcon={<Icon family="material" name="email" size={18} color={colors.primary} />}
            />

            <Input
              label="Password *"
              placeholder="Minimum 8 characters"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (error) setError('');
              }}
              leftIcon={<Icon family="material" name="lock" size={18} color={colors.primary} />}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon
                    family="feather"
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              }
            />

            <Input
              label="Confirm Password *"
              placeholder="Re-enter your password"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={(val) => {
                setConfirmPassword(val);
                if (error) setError('');
              }}
              leftIcon={<Icon family="material" name="lock-clock" size={18} color={colors.primary} />}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon
                    family="feather"
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              }
            />

            {/* Terms Agreement Checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                {agreeTerms && (
                  <Icon family="material" name="check" size={14} color={colors.white} />
                )}
              </View>
              <Text style={styles.termsLabel}>
                I agree to the <Text style={styles.termsBold}>Terms of Service</Text> and{' '}
                <Text style={styles.termsBold}>Privacy Policy</Text> of VedSarthi.
              </Text>
            </TouchableOpacity>

            <Button
              title="Create Account & Verify OTP"
              onPress={handleRegister}
              loading={loading}
              rightIcon={
                <Icon family="material" name="arrow-forward" size={18} color={colors.white} />
              }
              size="lg"
              style={styles.submitBtn}
            />

            {/* Login Link */}
            <View style={styles.loginWrap}>
              <Text style={styles.loginPrompt}>Already have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
              >
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  introBox: {
    marginBottom: spacing.md,
  },
  heading: {
    ...typography.h3,
    color: colors.primaryDark,
    fontFamily: typography.fontFamilySerif,
    marginBottom: 4,
  },
  subheading: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: spacing.md,
    gap: 8,
  },
  errorContent: {
    flex: 1,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '500',
    lineHeight: 18,
  },
  errorActionBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  errorActionText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  countryCodeWrap: {
    paddingRight: 6,
    borderRightWidth: 1,
    borderRightColor: colors.cardBorder,
    marginRight: 8,
  },
  countryCodeText: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: spacing.sm,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsLabel: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
    lineHeight: 18,
  },
  termsBold: {
    color: colors.primary,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: spacing.md,
  },
  loginWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    gap: 6,
  },
  loginPrompt: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  loginLink: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
});
