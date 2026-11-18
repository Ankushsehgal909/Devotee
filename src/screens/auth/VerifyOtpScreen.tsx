import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList, AuthSession, ResetPasswordTokenResult } from '../../types';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon } from '../../components/common/Icon';
import { LinearGradient } from '../../components/common/LinearGradient';
import { CommonBackgroundScreen } from '../../components/common/CommonBackgroundScreen';
import { localImages } from '../../constants/images';
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
  const [isInputFocused, setIsInputFocused] = useState(true);

  const inputRef = useRef<any>(null);

  // Calculate cooldown countdown
  const getInitialCooldown = () => {
    if (resendAvailableAt) {
      const remaining = Math.ceil((new Date(resendAvailableAt).getTime() - Date.now()) / 1000);
      return Math.max(0, remaining);
    }
    return 56;
  };

  const [cooldown, setCooldown] = useState(getInitialCooldown);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const channelLabel =
    channel === 'whatsapp' ? 'WhatsApp' : channel === 'email' ? 'Email' : 'SMS';

  // Auto-request challenge if navigated without active otpId
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
            setCooldown(56);
          }
          setNotice(`Sacred verification code dispatched via ${channelLabel}.`);
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
      setCooldown(56);
    } catch (err: any) {
      setError(err.message || 'Unable to resend code. Please wait before retrying.');
    } finally {
      setResending(false);
    }
  };

  return (
    <CommonBackgroundScreen
      safeAreaEdges={['top', 'bottom', 'left', 'right']}
      resizeMode="stretch"
    >
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon family="material" name="arrow-back" size={24} color="#6B0E1E" />
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>Verify Identity</Text>
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
          {/* Central Envelope Icon with Glow Ring */}
          <View style={styles.iconGlowWrap}>
            <View style={styles.iconCircle}>
              <Icon
                family="material-community"
                name="email-check"
                size={42}
                color="#7E1528"
              />
            </View>
          </View>

          {/* Heading */}
          <Text style={styles.headingTitle}>Enter 6-Digit Code</Text>

          {/* Sacred Lotus / Flourish Divider */}
          <Image
            source={localImages.divider}
            style={styles.lotusDivider}
            resizeMode="contain"
          />

          {/* Subtitle & Destination Contact */}
          <Text style={styles.headingSubtitle}>
            We sent a sacred verification OTP via {channelLabel} to
          </Text>
          <Text style={styles.boldContact}>
            {activeIdentifier ? (activeIdentifier.startsWith('+') ? activeIdentifier : `+91 ${activeIdentifier}`) : '+91 98765 43210'}
          </Text>

          {/* Notice Banner */}
          {Boolean(notice) && (
            <View style={styles.noticeBox}>
              <Icon family="material" name="check-circle" size={16} color="#16A34A" />
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          )}

          {/* Error Banner */}
          {Boolean(error) && (
            <View style={styles.errorBox}>
              <Icon family="material" name="error-outline" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* White Input Card Container */}
          <View style={styles.cardContainer}>
            {/* 6 Digit Input Boxes */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
              style={styles.otpBoxesRow}
            >
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const digit = code[index] || '';
                const isFocused =
                  isInputFocused &&
                  (code.length === index || (index === 5 && code.length === 6));
                return (
                  <View
                    key={index}
                    style={[
                      styles.otpDigitBox,
                      Boolean(digit) && styles.otpDigitBoxFilled,
                      isFocused && styles.otpDigitBoxFocused,
                    ]}
                  >
                    <Text style={styles.otpDigitText}>{digit}</Text>
                  </View>
                );
              })}

              {/* Invisible Full-coverage TextInput */}
              <TextInput
                ref={inputRef}
                value={code}
                onChangeText={(val) => {
                  const clean = val.replace(/[^0-9]/g, '').slice(0, 6);
                  setCode(clean);
                  if (error) setError('');
                }}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                maxLength={6}
                style={styles.hiddenInput}
                autoFocus
              />
            </TouchableOpacity>

            <Text style={styles.helperText}>
              Enter the 6 digits exactly as received
            </Text>

            {/* Verify & Continue Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleVerify}
              disabled={loading || code.length !== 6}
              style={[
                styles.verifyBtn,
                (loading || code.length !== 6) && styles.verifyBtnDisabled,
              ]}
            >
              <LinearGradient
                colors={['#8B1528', '#6B0E1E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.verifyGradient}
              >
                {/* Subtle mandala watermarks on button edges */}
                <View style={styles.mandalaCornerLeft} pointerEvents="none">
                  <Icon
                    family="material-community"
                    name="flare"
                    size={32}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.mandalaCornerRight} pointerEvents="none">
                  <Icon
                    family="material-community"
                    name="flare"
                    size={32}
                    color="#FFFFFF"
                  />
                </View>

                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <View style={styles.btnContentRow}>
                    <Text style={styles.verifyBtnText}>Verify & Continue</Text>
                    <Icon
                      family="material"
                      name="arrow-forward"
                      size={18}
                      color="#FFFFFF"
                    />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Resend Code Section */}
            <View style={styles.resendRow}>
              <Text style={styles.resendPrompt}>Didn't receive code? </Text>
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
    </CommonBackgroundScreen>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  topHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 16,
    paddingBottom: 36,
    flexGrow: 1,
    justifyContent: 'center',
  },
  iconGlowWrap: {
    alignSelf: 'center',
    marginBottom: 16,
    padding: 5,
    borderRadius: 50,
    backgroundColor: 'rgba(253, 230, 138, 0.45)',
  },
  iconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  headingTitle: {
    fontSize: 24,
    fontFamily: typography.fontFamilySerif,
    fontWeight: '700',
    color: '#6B0E1E',
    textAlign: 'center',
  },
  lotusDivider: {
    width: 140,
    height: 18,
    alignSelf: 'center',
    marginVertical: 6,
  },
  headingSubtitle: {
    fontSize: 13,
    color: '#7A6E63',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 18,
  },
  boldContact: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1110',
    textAlign: 'center',
    marginTop: 3,
    fontFamily: typography.fontFamilySerif,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 14,
    alignSelf: 'center',
    maxWidth: '90%',
  },
  noticeText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '500',
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 14,
    alignSelf: 'center',
    maxWidth: '90%',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
    flex: 1,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0E5D8',
    paddingHorizontal: 16,
    paddingVertical: 22,
    marginTop: 24,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 2,
  },
  otpDigitBox: {
    width: 44,
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8DAC8',
    backgroundColor: '#FFFDFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpDigitBoxFilled: {
    borderColor: '#7E1528',
    backgroundColor: '#FFFFFF',
  },
  otpDigitBoxFocused: {
    borderColor: '#7E1528',
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
  },
  otpDigitText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C1810',
    fontFamily: typography.fontFamilySerif,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0,
  },
  helperText: {
    fontSize: 11.5,
    color: '#7A6E63',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 20,
  },
  verifyBtn: {
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: '#7E1528',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  verifyBtnDisabled: {
    opacity: 0.55,
  },
  verifyGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 20,
  },
  mandalaCornerLeft: {
    position: 'absolute',
    left: 8,
    bottom: -6,
    opacity: 0.15,
  },
  mandalaCornerRight: {
    position: 'absolute',
    right: 8,
    bottom: -6,
    opacity: 0.15,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendPrompt: {
    fontSize: 12.5,
    color: '#7A6E63',
  },
  timerText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#6B0E1E',
  },
  resendLink: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#6B0E1E',
    textDecorationLine: 'underline',
  },
});
