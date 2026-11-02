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
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Icon } from '../../components/common/Icon';
import { Header } from '../../components/common/Header';
import { resetPasswordApi } from '../../api/auth';

type ResetPasswordRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;
type ResetPasswordNavProp = NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC = () => {
  const route = useRoute<ResetPasswordRouteProp>();
  const navigation = useNavigation<ResetPasswordNavProp>();
  const { resetToken, identifier } = route.params;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await resetPasswordApi({
        resetToken,
        newPassword: password,
      });

      Alert.alert(
        'Password Reset Successful',
        'Your password has been securely updated. You can now sign in with your new credentials.',
        [
          {
            text: 'Sign In Now',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please request a new reset code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <Header
        title="Set New Password"
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
              <Icon family="material" name="check-circle" size={36} color={colors.primary} />
            </View>
          </View>

          <View style={styles.introBox}>
            <Text style={styles.heading}>Create New Password</Text>
            <Text style={styles.subheading}>
              {identifier
                ? `Create a strong password for account linked to ${identifier}`
                : 'Create a strong password of at least 8 characters'}
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
              label="New Password"
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
              label="Confirm New Password"
              placeholder="Re-enter new password"
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

            <Button
              title="Update Password"
              onPress={handleResetPassword}
              loading={loading}
              rightIcon={
                <Icon family="material" name="check" size={18} color={colors.white} />
              }
              size="lg"
              style={styles.actionBtn}
            />
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
  actionBtn: {
    marginTop: spacing.xs,
  },
});
