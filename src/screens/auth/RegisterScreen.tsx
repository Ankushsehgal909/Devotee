import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon } from '../../components/common/Icon';
import {
  CommonBackgroundScreen,
  LinearGradient,
} from '../../components/common';
import { localImages } from '../../constants/images';
import { registerCustomerApi, normalizeIdentifier } from '../../api/auth';

type RegisterNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Register'
>;

const BUTTON_GRADIENT_COLORS = ['#9E1B32', '#6B0E1E'];

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
      const msg =
        err?.message ||
        'Registration failed. Please check your details and try again.';
      if (
        err?.statusCode === 409 ||
        msg.toLowerCase().includes('already exists')
      ) {
        setError(
          'An account with this phone or email already exists. Tap below to sign in or verify.',
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <CommonBackgroundScreen resizeMode="stretch">
      {/* Top Custom Nav Header */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Icon family="material" name="arrow-back" size={22} color="#1E1E24" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Create Devotee Account</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Intro Section */}
          <View style={styles.introBox}>
            <View style={styles.titleWrap}>
              <Text style={styles.heading}>Welcome to VedSarthi</Text>
              <Image
                source={localImages.divider}
                style={styles.lotusDivider}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.subheading}>
              Register to book authentic Vedic pujas, consult verified Pandits,
              and receive holy Prasadam at your home.
            </Text>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBox}>
              <Icon
                family="material"
                name="error-outline"
                size={18}
                color={colors.error}
              />
              <View style={styles.errorContent}>
                <Text style={styles.errorText}>{error}</Text>
                {error.includes('exists') || error.includes('verify') ? (
                  <TouchableOpacity
                    style={styles.errorActionBtn}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.errorActionText}>
                      Go to Login / Verify →
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ) : null}

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Field 1: Full Name */}
            <View style={styles.labelRow}>
              <Icon
                family="material"
                name="person"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.fieldLabel}>
                Full Name <Text style={styles.requiredStar}>*</Text>
              </Text>
            </View>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInputField}
                placeholder="Enter name"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={val => {
                  setName(val);
                  if (error) setError('');
                }}
              />
            </View>

            {/* Field 2: Mobile Number */}
            <View style={[styles.labelRow, { marginTop: 6 }]}>
              <Icon
                family="material"
                name="phone-android"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.fieldLabel}>
                Mobile Number <Text style={styles.requiredStar}>*</Text>
              </Text>
            </View>
            <View style={styles.inputBox}>
              <View style={styles.countryCodeWrap}>
                <Text style={styles.countryCodeText}>+91</Text>
                <Icon
                  family="material"
                  name="keyboard-arrow-down"
                  size={18}
                  color={colors.textPrimary}
                />
              </View>
              <View style={styles.inputDivider} />
              <TextInput
                style={styles.textInputField}
                placeholder="Enter mobile number"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={val => {
                  setPhone(val);
                  if (error) setError('');
                }}
              />
            </View>
            <View style={styles.helperRow}>
              <Icon
                family="material"
                name="info-outline"
                size={14}
                color={colors.textMuted}
              />
              <Text style={styles.helperText}>
                Verification OTP will be dispatched to this number.
              </Text>
            </View>

            {/* Field 3: Email Address (Optional) */}
            <View style={styles.labelRow}>
              <Icon
                family="material"
                name="mail-outline"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.fieldLabel}>Email Address (Optional)</Text>
            </View>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInputField}
                placeholder="Enter email"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={val => {
                  setEmail(val);
                  if (error) setError('');
                }}
              />
            </View>

            {/* Field 4: Password */}
            <View style={[styles.labelRow, { marginTop: 6 }]}>
              <Icon
                family="material"
                name="lock-outline"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.fieldLabel}>
                Password <Text style={styles.requiredStar}>*</Text>
              </Text>
            </View>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInputField}
                placeholder="Enter password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={val => {
                  setPassword(val);
                  if (error) setError('');
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.inputRightIcon}
              >
                <Icon
                  family="feather"
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Field 5: Confirm Password */}
            <View style={[styles.labelRow, { marginTop: 6 }]}>
              <Icon
                family="material-community"
                name="lock-check"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.fieldLabel}>
                Confirm Password <Text style={styles.requiredStar}>*</Text>
              </Text>
            </View>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInputField}
                placeholder="Confirm password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={val => {
                  setConfirmPassword(val);
                  if (error) setError('');
                }}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.inputRightIcon}
              >
                <Icon
                  family="feather"
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Terms Agreement Checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  agreeTerms && styles.checkboxActive,
                ]}
              >
                {agreeTerms && (
                  <Icon
                    family="material"
                    name="check"
                    size={13}
                    color={colors.white}
                  />
                )}
              </View>
              <Text style={styles.termsLabel}>
                I agree to the{' '}
                <Text style={styles.termsBold}>Terms of Service</Text> and{' '}
                <Text style={styles.termsBold}>Privacy Policy</Text> of
                VedSarthi.
              </Text>
            </TouchableOpacity>

            {/* Submit Button with LinearGradient */}
            <TouchableOpacity
              style={[
                styles.primaryButtonWrap,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={loading}
            >
              <LinearGradient
                colors={BUTTON_GRADIENT_COLORS}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Icon
                      family="material"
                      name="person-add"
                      size={18}
                      color={colors.white}
                    />
                    <Text style={styles.buttonText}>
                      Create Account & Verify OTP
                    </Text>
                    <Icon
                      family="material"
                      name="arrow-forward"
                      size={18}
                      color={colors.white}
                    />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

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
    </CommonBackgroundScreen>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1E24',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 28,
    flexGrow: 1,
  },
  introBox: {
    marginBottom: 16,
    marginTop: 4,
  },
  titleWrap: {
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A0E18',
    fontFamily: typography.fontFamilySerif,
    textAlign: 'left',
  },
  lotusDivider: {
    width: 95,
    height: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 13,
    color: '#665A50',
    lineHeight: 18,
    maxWidth: 270,
    textAlign: 'left',
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
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#EDE2D4',
    elevation: 2,
    shadowColor: '#3A1505',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D181C',
  },
  requiredStar: {
    color: '#7E1528',
    fontWeight: '700',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6DACD',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 8,
  },
  countryCodeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingRight: 8,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  inputDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#E6DACD',
    marginRight: 10,
  },
  textInputField: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  inputRightIcon: {
    padding: 4,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    marginTop: -2,
  },
  helperText: {
    fontSize: 11,
    color: '#786F66',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 18,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#7E1528',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: '#7E1528',
    borderColor: '#7E1528',
  },
  termsLabel: {
    flex: 1,
    fontSize: 12,
    color: '#3E3A36',
    lineHeight: 17,
  },
  termsBold: {
    fontWeight: '700',
    color: '#7E1528',
  },
  primaryButtonWrap: {
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#821427',
    elevation: 3,
    shadowColor: '#821427',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  primaryButtonGradient: {
    height: 50,
    width: '100%',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  loginPrompt: {
    fontSize: 13,
    color: '#786F66',
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7E1528',
  },
});
