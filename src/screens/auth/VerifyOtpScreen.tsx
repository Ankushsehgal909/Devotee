import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList, AuthSession, ResetPasswordTokenResult } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Icon } from '../../components/common/Icon';
import { Header } from '../../components/common/Header';
import { verifyOtpApi, resendOtpApi, requestOtpApi } from '../../api/auth';
import { useAuthStore } from '../../store/useAuthStore';

type VerifyOtpRouteProp = RouteProp<AuthStackParamList, 'VerifyOtp'>;
type VerifyOtpNavProp = NativeStackNavigationProp<AuthStackParamList, 'VerifyOtp'>;

export const VerifyOtpScreen: React.FC = () => {
  const route = useRoute<VerifyOtpRouteProp>();
  const navigation = useNavigation<VerifyOtpNavProp>();
  const { setSession } = useAuthStore();

  const {
    otpId: initialOtpId,
    identifier,
    purpose = 'login',
    channel = 'sms',
    resendAvailableAt,
    phone,
  } = route.params;

  const activeIdentifier = identifier || phone || '';
  const [currentOtpId, setCurrentOtpId] = useState(initialOtpId || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Calculate cooldown countdown
  const getInitialCooldown = () => {
    if (resendAvailableAt) {
      const remaining = Math.ceil((new Date(resendAvailableAt).getTime() - Date.now()) / 1000);
      return Math.max(0, remaining);
    }
    return 30;
  };

  const [cooldown, setCooldown] = useState(getInitialCooldown);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const channelLabel =
    channel === 'whatsapp' ? 'WhatsApp' : channel === 'email' ? 'Email' : 'SMS';

  // If navigated without an active otpId (e.g. redirected from unverified login), auto-request challenge
  useEffect(() => {
    if (!initialOtpId && activeIdentifier) {
      setLoading(true);
      requestOtpApi({
        identifier: activeIdentifier,
        purpose,
        channel,
      })
        .then((result) => {
          if (result.otpId) {
            setCurrentOtpId(result.otpId);
          }
          if (result.resendAvailableAt) {
            const remaining = Math.ceil(
              (new Date(result.resendAvailableAt).getTime() - Date.now()) / 1000
            );
            setCooldown(Math.max(0, remaining));
          } else {
            setCooldown(30);
          }
          setNotice(`Sacred verification code sent via ${channelLabel}.`);
        })
        .catch((err) => {
          setError(err.message || 'Please tap Resend Code to receive your verification code.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [initialOtpId, activeIdentifier, purpose, channel, channelLabel]);

  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldown]);

  const handleVerify = async () => {
    const cleanCode = code.trim();
    if (cleanCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    if (!currentOtpId) {
      setError('Verification session not active. Please tap Resend Code.');
      return;
    }

    setError('');
    setNotice('');
    setLoading(true);

    try {
      const result = await verifyOtpApi({
        otpId: currentOtpId,
        code: cleanCode,
      });

      if ('resetToken' in result) {
        // Password reset flow
        navigation.navigate('ResetPassword', {
          resetToken: (result as ResetPasswordTokenResult).resetToken,
          identifier: activeIdentifier,
        });
        return;
      }

      const session = result as AuthSession;
      if (session && (session.tokens?.accessToken || session.accessToken)) {
        await setSession(session);
        return;
      }

      // If user profile is not complete
      navigation.navigate('ProfileSetup', { phone: activeIdentifier });
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code. Please check and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError('');
    setNotice('');
    setResending(true);

    try {
      let nextResult;
      if (currentOtpId) {
        nextResult = await resendOtpApi({ otpId: currentOtpId });
      } else {
        nextResult = await requestOtpApi({
          identifier: activeIdentifier,
          purpose,
          channel,
        });
      }

      if (nextResult?.otpId) {
        setCurrentOtpId(nextResult.otpId);
      }

      setNotice('A fresh verification code has been dispatched.');
      setCooldown(30);
    } catch (err: any) {
      setError(err.message || 'Unable to resend code. Please wait before retrying.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <Header
        title="Verify Identity"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.iconWrap}>
            <View style={styles.iconCircle}>
              <Icon family="material" name="mark-email-read" size={36} color={colors.primary} />
            </View>
          </View>

          <View style={styles.headerArea}>
            <Text style={styles.title}>Enter 6-Digit Code</Text>
            <Text style={styles.subtitle}>
              We sent a sacred verification OTP via {channelLabel} to
            </Text>
            <Text style={styles.boldContact}>{activeIdentifier}</Text>
          </View>

          {/* Notice Banner */}
          {notice ? (
            <View style={styles.noticeBox}>
              <Icon family="material" name="check-circle" size={18} color={colors.success} />
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBox}>
              <Icon family="material" name="error-outline" size={18} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.formCard}>
            <Input
              placeholder="------"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={(val) => {
                setCode(val);
                if (error) setError('');
                if (val.length === 6) {
                  // user entered full 6 digits
                }
              }}
              containerStyle={styles.otpInputWrap}
              inputStyle={styles.otpInputText}
              helperText="Enter the 6 digits exactly as received"
            />

            <Button
              title="Verify & Continue"
              onPress={handleVerify}
              loading={loading}
              disabled={code.length !== 6}
              rightIcon={
                <Icon family="material" name="arrow-forward" size={18} color={colors.white} />
              }
              size="lg"
              style={styles.verifyBtn}
            />

            <View style={styles.resendArea}>
              <Text style={styles.resendPrompt}>Didn't receive code?</Text>
              {cooldown > 0 ? (
                <Text style={styles.timerText}>Resend in {cooldown}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResend} disabled={resending}>
                  <Text style={styles.resendLink}>
                    {resending ? 'Sending...' : 'Resend Code'}
                  </Text>
                </TouchableOpacity>
              )}
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
    paddingVertical: spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FDE8E8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F8B4B4',
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.primaryDark,
    fontFamily: typography.fontFamilySerif,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
  boldContact: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEF7EC',
    borderWidth: 1,
    borderColor: '#BCF0DA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: spacing.md,
    gap: 8,
  },
  noticeText: {
    ...typography.caption,
    color: colors.success,
    flex: 1,
    fontWeight: '500',
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
  otpInputWrap: {
    marginVertical: spacing.sm,
  },
  otpInputText: {
    letterSpacing: 10,
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '700',
    color: colors.primaryDark,
  },
  verifyBtn: {
    marginTop: spacing.md,
  },
  resendArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    gap: 6,
  },
  resendPrompt: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  timerText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontWeight: '600',
  },
  resendLink: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
});
