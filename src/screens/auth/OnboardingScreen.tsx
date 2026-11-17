import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon } from '../../components/common/Icon';
import {
  CommonAppBackgroundScreen,
  LinearGradient,
} from '../../components/common';
import { localImages } from '../../constants/images';

type OnboardingProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Onboarding'
>;

const BUTTON_GRADIENT_COLORS = ['#9E1B32', '#6B0E1E'];

const SLIDES = [
  {
    image: localImages.welcome1,
    iconName: 'shield-check',
    title: 'Certified Gurukul\nPurohits',
    desc: 'Experienced, verified Acharyas from ancient Vedic traditions for authentic ritual conduct at your doorstep or online.',
  },
  {
    image: localImages.welcome2,
    iconName: 'star-four-points',
    title: 'Customized\nGotra Sankalp',
    desc: 'Seamless family tree integration that recites household Gotras, Nakshatras and Rashis for sacred divine blessings.',
  },
  {
    image: localImages.welcome3,
    iconName: 'hand-heart',
    title: '100% Consecrated\nSamagri',
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
    <CommonAppBackgroundScreen>
      {/* Top Bar with Skip Link */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.skipBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Upper Illustration Area with Floating Badge */}
        <View style={styles.illustrationWrapper}>
          <Image
            source={slide.image}
            style={styles.illustrationImage}
            resizeMode="contain"
          />

          {/* Floating Icon Badge overlapping bottom of illustration */}
          {/* <View style={styles.badgeCircle}>
            <Icon
              family="material-community"
              name={slide.iconName}
              size={28}
              color="#821427"
            />
          </View> */}
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{slide.title}</Text>

          {/* Golden Lotus Divider */}
          <Image
            source={localImages.divider}
            style={styles.lotusDivider}
            resizeMode="contain"
          />

          <Text style={styles.desc}>{slide.desc}</Text>

          {/* Pagination Dots */}
          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setCurrentSlide(i)}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.dot,
                    currentSlide === i ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.primaryButtonWrap}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={BUTTON_GRADIENT_COLORS}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButtonGradient}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>
                {currentSlide === SLIDES.length - 1
                  ? 'Begin Spiritual Journey'
                  : 'Continue'}
              </Text>
              <Icon
                family="material"
                name="arrow-forward"
                size={18}
                color={colors.white}
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </CommonAppBackgroundScreen>
  );
};

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    alignItems: 'flex-end',
  },
  skipBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  skipText: {
    fontSize: 14,
    color: '#4A0E18',
    fontWeight: '700',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  illustrationWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 28,
    marginTop: 8,
  },
  illustrationImage: {
    width: 290,
    height: 290,
  },
  badgeCircle: {
    position: 'absolute',
    bottom: -26,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#3A1505',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F2E8DC',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A0E18',
    textAlign: 'center',
    lineHeight: 30,
    fontFamily: typography.fontFamilySerif,
  },
  lotusDivider: {
    width: 95,
    height: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  desc: {
    fontSize: 13,
    color: '#665A50',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 310,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 22,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 22,
    backgroundColor: '#821427',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#D9C4B2',
  },
  bottomBar: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl,
    paddingTop: spacing.xs,
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
});
