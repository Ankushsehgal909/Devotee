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
import { requestOtpApi, normalizeIdentifier } from '../../api/auth';

type ForgotPasswordNavProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

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
      setError(err.message || 'Unable to send password reset code. Please check your identifier.');
    } finally {
      setLoading(false);
    }
  };

  const isEmailInput = identifier.includes('@');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <Header
        title="Forgot Password"
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
        >
          <View style={styles.iconWrap}>
            <View style={styles.iconCircle}>
              <Icon family="material" name="lock-reset" size={36} color={colors.primary} />
            </View>
          </View>

          <View style={styles.introBox}>
            <Text style={styles.heading}>Reset Your Password</Text>
            <Text style={styles.subheading}>
              Enter your registered mobile number or email address. We will send you a 6-digit verification code to securely create a new password.
            </Text>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBox}>
              <Icon family="material" name="error-outline" size={18} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.formCard}>
            <Input
              label="Registered Mobile or Email"
              placeholder="9876543210 or name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={identifier}
              onChangeText={(val) => {
                setIdentifier(val);
                if (error) setError('');
              }}
              leftIcon={
                <Icon
                  family="material"
                  name={isEmailInput ? 'email' : 'phone'}
                  size={18}
                  color={colors.primary}
                />
              }
            />

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
            )}

            <Button
              title="Send Verification Code"
              onPress={handleRequestResetOtp}
              loading={loading}
              rightIcon={
                <Icon family="material" name="arrow-forward" size={18} color={colors.white} />
              }
              size="lg"
              style={styles.actionBtn}
            />

            <View style={styles.loginWrap}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
              >
                <Text style={styles.backLink}>Remember your password? Sign In</Text>
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
  introBox: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heading: {
    ...typography.h3,
    color: colors.primaryDark,
    fontFamily: typography.fontFamilySerif,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subheading: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
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
  actionBtn: {
    marginTop: spacing.xs,
  },
  loginWrap: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  backLink: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
});
