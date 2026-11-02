import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
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
import { requestOtpApi, loginWithPasswordApi, normalizeIdentifier } from '../../api/auth';
import { useAuthStore } from '../../store/useAuthStore';

type LoginNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;
type LoginMethod = 'phone' | 'password';

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
      setError(err.message || 'Unable to request OTP. Please try again.');
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
      setError('Please enter your account password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const session = await loginWithPasswordApi({
        identifier: cleanIdentifier,
        password,
      });

      if (session && (session.tokens?.accessToken || session.accessToken)) {
        await setSession(session);
      } else {
        throw new Error('Valid login session was not returned.');
      }
    } catch (err: any) {
      const msg = err.message || 'Invalid credentials. Please verify your details.';
      setError(msg);
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header & Logo Emblem */}
          <View style={styles.headerArea}>
            <View style={styles.logoBadge}>
              <Icon family="material-community" name="om" size={34} color={colors.white} />
            </View>
            <Text style={styles.title}>Devotee Portal</Text>
            <Text style={styles.subtitle}>
              Sign in to manage your Gotra Sankalps, authentic Puja vidhis, and sacred samagri orders.
            </Text>
          </View>

          {/* Authentication Method Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, method === 'phone' && styles.tabButtonActive]}
              onPress={() => {
                setMethod('phone');
                setError('');
              }}
              activeOpacity={0.8}
            >
              <Icon
                family="material"
                name="phone-android"
                size={18}
                color={method === 'phone' ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.tabText, method === 'phone' && styles.tabTextActive]}>
                Mobile OTP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, method === 'password' && styles.tabButtonActive]}
              onPress={() => {
                setMethod('password');
                setError('');
              }}
              activeOpacity={0.8}
            >
              <Icon
                family="material"
                name="lock-outline"
                size={18}
                color={method === 'password' ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.tabText, method === 'password' && styles.tabTextActive]}>
                Password
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBox}>
              <Icon family="material" name="error-outline" size={18} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form Content */}
          <View style={styles.formCard}>
            {method === 'phone' ? (
              <>
                <Input
                  label="Devotee Mobile Number"
                  placeholder="98765 43210"
                  keyboardType="phone-pad"
                  maxLength={13}
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
                  helperText="A 6-digit verification code will be sent to your device."
                />

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
                    >
                      <Icon
                        family="material"
                        name="textsms"
                        size={14}
                        color={channel === 'sms' ? colors.white : colors.textMuted}
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
                    >
                      <Icon
                        family="material-community"
                        name="whatsapp"
                        size={14}
                        color={channel === 'whatsapp' ? colors.white : colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.channelPillText,
                          channel === 'whatsapp' && styles.channelPillTextActive,
                        ]}
                      >
                        WhatsApp
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Button
                  title="Get Sacred OTP"
                  onPress={handlePhoneOtpSubmit}
                  loading={loading}
                  rightIcon={
                    <Icon family="material" name="arrow-forward" size={18} color={colors.white} />
                  }
                  size="lg"
                  style={styles.actionBtn}
                />
              </>
            ) : (
              <>
                <Input
                  label="Email or Mobile Number"
                  placeholder="name@example.com or 9876543210"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={identifier}
                  onChangeText={(val) => {
                    setIdentifier(val);
                    if (error) setError('');
                  }}
                  leftIcon={
                    <Icon family="material" name="alternate-email" size={18} color={colors.primary} />
                  }
                />

                <Input
                  label="Password"
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (error) setError('');
                  }}
                  leftIcon={
                    <Icon family="material" name="lock" size={18} color={colors.primary} />
                  }
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

                <View style={styles.forgotRow}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ForgotPassword')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                <Button
                  title="Sign In with Password"
                  onPress={handlePasswordLoginSubmit}
                  loading={loading}
                  rightIcon={
                    <Icon family="material" name="login" size={18} color={colors.white} />
                  }
                  size="lg"
                  style={styles.actionBtn}
                />
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

          {/* Footer Terms */}
          <Text style={styles.termsText}>
            By continuing, you agree to VedSarthi Terms of Service and Devotee Privacy Policy.
          </Text>
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
    paddingVertical: spacing.lg,
    justifyContent: 'center',
    flexGrow: 1,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.goldAccent,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  title: {
    ...typography.h2,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamilySerif,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBorder,
    borderRadius: 12,
    padding: 3,
    marginBottom: spacing.md,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 9,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: spacing.md,
    gap: 8,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    flex: 1,
    fontWeight: '500',
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
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: -4,
  },
  channelLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  channelOptions: {
    flexDirection: 'row',
    gap: 6,
  },
  channelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: colors.bgSand,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  channelPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  channelPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  channelPillTextActive: {
    color: colors.white,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.md,
    marginTop: -4,
  },
  forgotText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  actionBtn: {
    marginTop: spacing.xs,
  },
  registerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    gap: 6,
  },
  registerPrompt: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  registerLink: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
  termsText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 18,
    paddingHorizontal: spacing.sm,
  },
});
