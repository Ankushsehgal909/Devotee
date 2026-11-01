import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';

type OnboardingProp = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

const SLIDES = [
  {
    iconName: 'shield-check',
    title: 'Certified Gurukul Purohits',
    desc: 'Experienced, verified Acharyas from ancient Vedic traditions for authentic ritual conduct at your doorstep or online.',
  },
  {
    iconName: 'star-four-points',
    title: 'Customized Gotra Sankalp',
    desc: 'Seamless family tree integration that recites household Gotras, Nakshatras and Rashis for sacred divine blessings.',
  },
  {
    iconName: 'hand-heart',
    title: '100% Consecrated Samagri',
    desc: 'Purity-certified A2 Gir Cow Ghee, lab-tested Hawan herbs, pure copper and brass items delivered to your altar.',
  },
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingProp>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.skipBtn}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Icon
            family="material-community"
            name={slide.iconName}
            size={44}
            color={colors.primary}
          />
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.desc}>{slide.desc}</Text>

        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                currentSlide === i ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.bottomBar}>
        <Button
          title={currentSlide === SLIDES.length - 1 ? 'Begin Spiritual Journey' : 'Continue'}
          onPress={handleNext}
          rightIcon={<Icon family="material" name="chevron-right" size={20} color="#FFFFFF" />}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSand,
  },
  topBar: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    alignItems: 'flex-end',
  },
  skipBtn: {
    padding: spacing.xs,
  },
  skipText: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryMuted,
    borderWidth: 2,
    borderColor: colors.borderWarm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  desc: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: colors.borderWarm,
  },
  bottomBar: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xl,
  },
});
