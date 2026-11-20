import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon } from '../../components/common/Icon';
import { LinearGradient } from '../../components/common/LinearGradient';
import { CommonBackgroundScreen } from '../../components/common/CommonBackgroundScreen';
import { localImages } from '../../constants/images';
import { requestOtpApi, normalizeIdentifier } from '../../api/auth';

type ForgotPasswordNavProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

const BUTTON_GRADIENT_COLORS = ['#8B1528', '#5A0C1A'];

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordNavProp>();

  const [identifier, setIdentifier] = useState('');
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestResetOtp = async () => {
    const clean = identifier.trim();
    if (!clean) {
      setError('Please enter your registered mobile number or email');
      return;
    }

    setError('');
    setLoading(true);

    const formatted = normalizeIdentifier(clean);
    const isEmail = formatted.includes('@');

    try {
      const result = await requestOtpApi({
        identifier: formatted,
        purpose: 'reset_password',
        channel: isEmail ? 'email' : channel,
      });

      navigation.navigate('VerifyOtp', {
        otpId: result.otpId,
        identifier: formatted,
        purpose: 'reset_password',
        channel: isEmail ? 'email' : channel,
        resendAvailableAt: result.resendAvailableAt,
        phone: formatted,
      });
    } catch (err: any) {
      setError(
        err.message ||
          'Unable to send password reset code. Please check your identifier.',
      );
    } finally {
      setLoading(false);
    }
  };

  const isEmailInput = identifier.includes('@');

  return (
    <CommonBackgroundScreen
      safeAreaEdges={['top', 'bottom', 'left', 'right']}
      resizeMode="stretch"
    >
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Login');
            }
          }}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon family="material" name="arrow-back" size={24} color="#6B0E1E" />
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>Forgot Password</Text>
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
          {/* Top Lotus Flourish */}
          <Image
            source={localImages.divider}
            style={styles.topLotusDivider}
            resizeMode="contain"
          />

          {/* Central Medallion Badge with Radiant Ring */}
          <View style={styles.medallionWrapper}>
            <View style={styles.medallionOuterRing}>
              <View style={styles.medallionInnerRing}>
                <Icon
                  family="material-community"
                  name="lock-reset"
                  size={46}
                  color="#7E1528"
                />
              </View>
            </View>
          </View>

          {/* Screen Title & Subtitle */}
          <Text style={styles.headingTitle}>Reset Your Password</Text>
          <Text style={styles.headingSubtitle}>
            Enter your registered mobile number or email address.{'\n'}
            We will send you a 6-digit verification code to securely create a new password.
          </Text>

          {/* Lotus Divider */}
          <Image
            source={localImages.divider}
            style={styles.lotusDivider}
            resizeMode="contain"
          />

          {/* Error Banner */}
          {Boolean(error) && (
            <View style={styles.errorBox}>
              <Icon family="material" name="error-outline" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* White Card Container */}
          <View style={styles.cardContainer}>
            {/* Label Row with Phone Icon */}
            <View style={styles.fieldHeaderRow}>
              <View style={styles.fieldIconCircle}>
                <Icon
                  family="material"
                  name="phone-android"
                  size={16}
                  color="#7E1528"
                />
              </View>
              <Text style={styles.fieldLabelText}>Registered Mobile or Email</Text>
            </View>

            {/* Input Box */}
            <View style={styles.inputBox}>
              <Icon
                family="material"
                name={isEmailInput ? 'email' : 'phone'}
                size={20}
                color="#7E1528"
                style={styles.inputLeftIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Enter email or mobile number"
                placeholderTextColor="#A3988C"
                keyboardType="email-address"
                autoCapitalize="none"
                value={identifier}
                onChangeText={(val) => {
                  setIdentifier(val);
                  if (error) setError('');
                }}
              />
            </View>

            {/* Receive code via row */}
            {!isEmailInput && (
              <View style={styles.channelRow}>
                <Text style={styles.channelLabel}>Receive code via:</Text>
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
                      size={15}
                      color={channel === 'sms' ? '#FFFFFF' : '#332724'}
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
                      size={16}
                      color={channel === 'whatsapp' ? '#FFFFFF' : '#332724'}
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
            )}

            {/* Send Verification Code Action Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleRequestResetOtp}
              disabled={loading}
              style={styles.actionBtnWrapper}
            >
              <LinearGradient
                colors={BUTTON_GRADIENT_COLORS}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionBtnGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <View style={styles.btnContentRow}>
                    <Text style={styles.actionBtnText}>
                      Send Verification Code
                    </Text>
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
          </View>

          {/* Bottom Lotus Flourish */}
          <Image
            source={localImages.divider}
            style={styles.bottomLotusDivider}
            resizeMode="contain"
          />

          {/* Remember Password / Sign In Footer Link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
            style={styles.footerLinkRow}
          >
            <View style={styles.footerLockCircle}>
              <Icon family="material" name="lock" size={13} color="#7E1528" />
            </View>
            <Text style={styles.footerText}>
              Remember your password?{' '}
              <Text style={styles.footerSignIn}>Sign In →</Text>
            </Text>
          </TouchableOpacity>
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
    paddingBottom: 4,
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  topHeaderTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 4,
    paddingBottom: 36,
    flexGrow: 1,
    justifyContent: 'center',
  },
  topLotusDivider: {
    width: 100,
    height: 14,
    alignSelf: 'center',
    marginBottom: 8,
    opacity: 0.85,
  },
  medallionWrapper: {
    alignSelf: 'center',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medallionOuterRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: '#ECC77B',
    backgroundColor: 'rgba(255, 248, 235, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  medallionInnerRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1.5,
    borderColor: '#DFBF7C',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingTitle: {
    fontSize: 24,
    fontFamily: typography.fontFamilySerif,
    fontWeight: '700',
    color: '#6B0E1E',
    textAlign: 'center',
    marginBottom: 6,
  },
  headingSubtitle: {
    fontSize: 13,
    color: '#55483D',
    textAlign: 'center',
    lineHeight: 18.5,
    paddingHorizontal: 12,
  },
  lotusDivider: {
    width: 120,
    height: 16,
    alignSelf: 'center',
    marginVertical: 10,
    opacity: 0.85,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
    gap: 8,
    alignSelf: 'center',
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    flex: 1,
    fontWeight: '500',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  fieldIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FDECE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#341118',
    letterSpacing: 0.2,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8DFD5',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 18,
  },
  inputLeftIcon: {
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#2A1F1D',
    paddingVertical: 0,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  channelLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#52121C',
  },
  channelOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  channelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    gap: 6,
    borderWidth: 1,
    borderColor: '#DFD5C8',
  },
  channelPillActive: {
    backgroundColor: '#6B0E1E',
    borderColor: '#6B0E1E',
  },
  channelPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#332724',
  },
  channelPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionBtnWrapper: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  actionBtnGradient: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  bottomLotusDivider: {
    width: 90,
    height: 14,
    alignSelf: 'center',
    marginVertical: 14,
    opacity: 0.85,
  },
  footerLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'center',
  },
  footerLockCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FDECE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#3D312E',
    fontWeight: '500',
  },
  footerSignIn: {
    color: '#6B0E1E',
    fontWeight: '700',
  },
});
