import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
import {
  requestOtpApi,
  loginWithPasswordApi,
  normalizeIdentifier,
} from '../../api/auth';
import { ApiError } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';

type LoginNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;
type LoginMethod = 'phone' | 'password';

const BUTTON_GRADIENT_COLORS = ['#9E1B32', '#6B0E1E'];

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavigationProp>();
  const { setSession } = useAuthStore();

  const [method, setMethod] = useState<LoginMethod>('phone');
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('sms');

  // Phone OTP form state
  const [phone, setPhone] = useState('');

  // Password login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneOtpSubmit = async () => {
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setError('');
    setLoading(true);

    const formattedPhone = normalizeIdentifier(cleanPhone);

    try {
      const result = await requestOtpApi({
        identifier: formattedPhone,
        purpose: 'login',
        channel,
      });

      navigation.navigate('VerifyOtp', {
        otpId: result.otpId,
        identifier: formattedPhone,
        purpose: 'login',
        channel,
        resendAvailableAt: result.resendAvailableAt,
        phone: formattedPhone,
      });
    } catch (err: any) {
      const msg = err?.message || '';
      const isUnverifiedOrRegisterRequired =
        err?.statusCode === 403 ||
        msg.toLowerCase().includes('register') ||
        msg.toLowerCase().includes('not verified') ||
        msg.toLowerCase().includes('verify this identifier');

      if (isUnverifiedOrRegisterRequired) {
        // Retry requesting OTP with purpose 'register' since account is pending verification
        try {
          const regResult = await requestOtpApi({
            identifier: formattedPhone,
            purpose: 'register',
            channel,
          });

          navigation.navigate('VerifyOtp', {
            otpId: regResult.otpId,
            identifier: formattedPhone,
            purpose: 'register',
            channel,
            resendAvailableAt: regResult.resendAvailableAt,
            phone: formattedPhone,
          });
          return;
        } catch (regErr: any) {
          // If already requested or cooldown active, still navigate to VerifyOtp screen
          if (
            regErr?.statusCode === 429 ||
            regErr?.message?.toLowerCase().includes('cooldown')
          ) {
            navigation.navigate('VerifyOtp', {
              otpId: '',
              identifier: formattedPhone,
              purpose: 'register',
              channel,
              phone: formattedPhone,
            });
            return;
          }
          setError(
            regErr?.message ||
              msg ||
              'Unable to request OTP. Please try again.',
          );
          return;
        }
      }

      setError(msg || 'Unable to request OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLoginSubmit = async () => {
    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setError('Please enter your email or mobile number');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setError('');
    setLoading(true);

    const formattedIdentifier = normalizeIdentifier(cleanIdentifier);

    try {
      const session = await loginWithPasswordApi({
        identifier: formattedIdentifier,
        password,
      });

      if (session && (session.tokens?.accessToken || session.accessToken)) {
        await setSession(session);
        return;
      } else {
        throw new Error('Valid login session was not returned.');
      }
    } catch (err: any) {
      const msg =
        err?.message || 'Invalid credentials. Please verify your details.';
      const isUnverified =
        err?.statusCode === 403 ||
        msg.includes('not verified') ||
        msg.includes('Verify this identifier') ||
        msg.includes('Registration is not verified') ||
        err?.code === 'UNVERIFIED';

      if (isUnverified) {
        // Needs OTP verification before sign in
        const purpose: 'register' | 'login' =
          msg.toLowerCase().includes('register') ||
          msg.toLowerCase().includes('registration')
            ? 'register'
            : 'login';
        const otpChannel = formattedIdentifier.includes('@') ? 'email' : 'sms';

        try {
          const otpResult = await requestOtpApi({
            identifier: formattedIdentifier,
            purpose,
            channel: otpChannel,
          });

          navigation.navigate('VerifyOtp', {
            otpId: otpResult.otpId,
            identifier: formattedIdentifier,
            purpose,
            channel: otpResult.channel || otpChannel,
            resendAvailableAt: otpResult.resendAvailableAt,
            phone: formattedIdentifier.includes('@')
              ? undefined
              : formattedIdentifier,
          });
          return;
        } catch (otpErr: any) {
          // If request OTP failed (e.g., cooldown or active challenge already sent), navigate to OTP screen
          navigation.navigate('VerifyOtp', {
            otpId: '',
            identifier: formattedIdentifier,
            purpose,
            channel: otpChannel,
            phone: formattedIdentifier.includes('@')
              ? undefined
              : formattedIdentifier,
          });
          return;
        }
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CommonBackgroundScreen resizeMode="stretch">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header & Logo Emblem */}
          <View style={styles.headerArea}>
            <Image
              source={localImages.om}
              style={styles.omLogo}
              resizeMode="contain"
            />
            <Image
              source={localImages.divider}
              style={styles.divider}
              resizeMode="contain"
            />
            <Text style={styles.title}>Devotee Portal</Text>
            <Text style={styles.subtitle}>
              Sign in to manage your Gotra Sankalps, authentic Puja vidhis, and
              sacred samagri orders.
            </Text>
          </View>

          {/* Authentication Method Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                method === 'phone' && styles.tabButtonActive,
              ]}
              onPress={() => {
                setMethod('phone');
                setError('');
              }}
              activeOpacity={0.8}
            >
              <Icon
                family="material"
                name="phone-android"
                size={16}
                color={method === 'phone' ? colors.white : colors.primary}
              />
              <Text
                style={[
                  styles.tabText,
                  method === 'phone' && styles.tabTextActive,
                ]}
              >
                Mobile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                method === 'password' && styles.tabButtonActive,
              ]}
              onPress={() => {
                setMethod('password');
                setError('');
              }}
              activeOpacity={0.8}
            >
              <Icon
                family="material"
                name="mail-outline"
                size={16}
                color={method === 'password' ? colors.white : colors.primary}
              />
              <Text
                style={[
                  styles.tabText,
                  method === 'password' && styles.tabTextActive,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>
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
                {(error.toLowerCase().includes('verif') ||
                  error.toLowerCase().includes('pending') ||
                  error.toLowerCase().includes('register')) &&
                (identifier.trim() || phone.trim()) ? (
                  <TouchableOpacity
                    style={styles.errorActionBtn}
                    onPress={() => {
                      const id = identifier.trim() || phone.trim();
                      const formatted = normalizeIdentifier(id);
                      const isReg =
                        error.toLowerCase().includes('register') ||
                        error.toLowerCase().includes('registration');
                      navigation.navigate('VerifyOtp', {
                        otpId: '',
                        identifier: formatted,
                        purpose: isReg ? 'register' : 'login',
                        channel: formatted.includes('@') ? 'email' : 'sms',
                        phone: formatted.includes('@') ? undefined : formatted,
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.errorActionText}>
                      Verify with OTP now →
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ) : null}

          {/* Form Content */}
          <View style={styles.formCard}>
            {method === 'phone' ? (
              <>
                {/* Field Label with Leading Icon */}
                <View style={styles.labelRow}>
                  <Icon
                    family="material"
                    name="phone-android"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.fieldLabel}>Devotee Mobile Number</Text>
                </View>

                {/* Country Code + Phone Input */}
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
                    maxLength={13}
                    value={phone}
                    onChangeText={val => {
                      setPhone(val);
                      if (error) setError('');
                    }}
                  />
                </View>

                {/* Helper info with Icon */}
                <View style={styles.helperRow}>
                  <Icon
                    family="material"
                    name="info-outline"
                    size={14}
                    color={colors.textMuted}
                  />
                  <Text style={styles.helperText}>
                    A 6-digit verification code will be sent to your device.
                  </Text>
                </View>

                {/* Delivery Channel Selector */}
                <View style={styles.channelRow}>
                  <Text style={styles.channelLabel}>Send code via:</Text>
                  <View style={styles.channelOptions}>
                    <TouchableOpacity
                      style={[
                        styles.channelPill,
                        channel === 'sms' && styles.channelPillActive,
                      ]}
                      onPress={() => setChannel('sms')}
                      activeOpacity={0.8}
                    >
                      <Icon
                        family="material"
                        name="textsms"
                        size={14}
                        color={channel === 'sms' ? colors.white : '#4A2027'}
                      />
                      <Text
                        style={[
                          styles.channelPillText,
                          channel === 'sms' && styles.channelPillTextActive,
                        ]}
                      >
                        SMS
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.channelPill,
                        channel === 'whatsapp' && styles.channelPillActive,
                      ]}
                      onPress={() => setChannel('whatsapp')}
                      activeOpacity={0.8}
                    >
                      <Icon
                        family="material-community"
                        name="whatsapp"
                        size={14}
                        color={
                          channel === 'whatsapp' ? colors.white : '#4A2027'
                        }
                      />
                      <Text
                        style={[
                          styles.channelPillText,
                          channel === 'whatsapp' &&
                            styles.channelPillTextActive,
                        ]}
                      >
                        WhatsApp
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Primary Button with LinearGradient */}
                <TouchableOpacity
                  style={[
                    styles.primaryButtonWrap,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handlePhoneOtpSubmit}
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
                        <Text style={styles.buttonText}>Get Sacred OTP</Text>
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
              </>
            ) : (
              <>
                {/* Field 1: Email or Mobile */}
                <View style={styles.labelRow}>
                  <Icon
                    family="material"
                    name="mail-outline"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.fieldLabel}>Email or Mobile Number</Text>
                </View>

                <View style={styles.inputBox}>
                  <Icon
                    family="material"
                    name="alternate-email"
                    size={18}
                    color={colors.primary}
                    style={styles.inputLeftIcon}
                  />
                  <TextInput
                    style={styles.textInputField}
                    placeholder="Enter email or mobile number"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={identifier}
                    onChangeText={val => {
                      setIdentifier(val);
                      if (error) setError('');
                    }}
                  />
                </View>

                {/* Field 2: Password */}
                <View style={[styles.labelRow, { marginTop: 8 }]}>
                  <Icon
                    family="material"
                    name="lock-outline"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.fieldLabel}>Password</Text>
                </View>

                <View style={styles.inputBox}>
                  <Icon
                    family="material"
                    name="lock"
                    size={18}
                    color={colors.primary}
                    style={styles.inputLeftIcon}
                  />
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

                <View style={styles.forgotRow}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ForgotPassword')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Primary Button with LinearGradient */}
                <TouchableOpacity
                  style={[
                    styles.primaryButtonWrap,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handlePasswordLoginSubmit}
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
                        <Text style={styles.buttonText}>
                          Sign In with Password
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
              </>
            )}

            {/* Register Navigation Link */}
            <View style={styles.registerWrap}>
              <Text style={styles.registerPrompt}>New to VedSarthi?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.7}
              >
                <Text style={styles.registerLink}>Create Devotee Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Feature Highlights (Target UI Feature Cards) */}
          {/* <View style={styles.featureCardsRow}>
            <View style={styles.featureCard}>
              <Icon
                family="material"
                name="shopping-bag"
                size={22}
                color={colors.primary}
              />
              <Text style={styles.featureTitle}>Puja Samagri</Text>
              <Text style={styles.featureSubtitle}>(Authentic & Pure)</Text>
            </View>

            <View style={styles.featureCard}>
              <Icon
                family="material-community"
                name="account-tie"
                size={22}
                color={colors.primary}
              />
              <Text style={styles.featureTitle}>Book a Pandit</Text>
              <Text style={styles.featureSubtitle}>(Verified Priests)</Text>
            </View>

            <View style={styles.featureCard}>
              <Icon
                family="material"
                name="event-available"
                size={22}
                color={colors.primary}
              />
              <Text style={styles.featureTitle}>Schedule Puja</Text>
              <Text style={styles.featureSubtitle}>(At Home or Online)</Text>
            </View>
          </View> */}

          {/* Footer Terms */}
          <Text style={styles.termsText}>
            By continuing, you agree to VedSarthi{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and Devotee{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </CommonBackgroundScreen>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    justifyContent: 'center',
    flexGrow: 1,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 6,
  },
  omLogo: {
    width: 66,
    height: 66,
    marginBottom: 4,
  },
  divider: {
    width: 135,
    height: 22,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A0E18',
    marginBottom: 6,
    fontFamily: typography.fontFamilySerif,
  },
  subtitle: {
    fontSize: 13,
    color: '#685A50',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3E8DC',
    borderRadius: 24,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFE5DA',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: '#821427',
    elevation: 2,
    shadowColor: '#821427',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#591724',
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: '700',
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
    paddingVertical: 20,
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
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D181C',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6DACD',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
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
  inputLeftIcon: {
    marginRight: 8,
  },
  inputRightIcon: {
    padding: 4,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    marginTop: 2,
  },
  helperText: {
    fontSize: 12,
    color: '#786F66',
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  channelLabel: {
    fontSize: 13,
    color: '#591724',
    fontWeight: '500',
  },
  channelOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  channelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'transparent',
    gap: 6,
    borderWidth: 1,
    borderColor: '#D9CCC0',
  },
  channelPillActive: {
    backgroundColor: '#821427',
    borderColor: '#821427',
  },
  channelPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A2027',
  },
  channelPillTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: 16,
    marginTop: 4,
  },
  forgotText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
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
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  registerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3E9DF',
    gap: 6,
  },
  registerPrompt: {
    fontSize: 13,
    color: '#786F66',
  },
  registerLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  featureCardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  featureCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EDE2D4',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  featureTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2D181C',
    marginTop: 6,
    textAlign: 'center',
  },
  featureSubtitle: {
    fontSize: 9,
    color: '#786F66',
    marginTop: 2,
    textAlign: 'center',
  },
  termsText: {
    fontSize: 11,
    color: '#786F66',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    lineHeight: 16,
    paddingHorizontal: 16,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '700',
  },
});
