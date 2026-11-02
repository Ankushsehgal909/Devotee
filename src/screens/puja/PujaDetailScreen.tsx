import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { PujaStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { Skeleton, SkeletonLine, SkeletonCircle } from '../../components/common/Skeleton';
import { useService } from '../../api/services';
import { resolveLocalizedText } from '../../utils/localization';
import { getPujaImageUrl } from '../../constants/images';

type PujaDetailRouteProp = RouteProp<PujaStackParamList, 'PujaDetail'>;

export const PujaDetailScreen: React.FC = () => {
  const route = useRoute<PujaDetailRouteProp>();
  const navigation = useNavigation<any>();
  const { serviceId } = route.params;

  // Real API hook
  const { data: service, isLoading } = useService(serviceId);
  const [selectedMode, setSelectedMode] = useState<string>('home_visit');

  if (isLoading || !service) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Header title="Vedic Puja Details" showBack />
        <View style={styles.detailSkeletonContainer}>
          {/* Hero Banner Skeleton */}
          <View style={styles.heroSkeleton}>
            <Skeleton width={100} height={20} borderRadius={borderRadius.full} style={{ marginBottom: spacing.sm }} />
            <SkeletonLine width="85%" height={24} style={{ marginBottom: spacing.xs }} />
            <SkeletonLine width="95%" height={14} style={{ marginBottom: spacing.xs }} />
            <SkeletonLine width="60%" height={14} />
          </View>
          {/* Mode Selector Skeleton */}
          <View style={[styles.section, { marginTop: spacing.md }]}>
            <SkeletonLine width={160} height={16} style={{ marginBottom: spacing.sm }} />
            <View style={styles.modeGrid}>
              <View style={[styles.modeCard, { padding: spacing.lg }]}>
                <SkeletonCircle size={24} style={{ marginBottom: spacing.xs }} />
                <SkeletonLine width={80} height={14} />
              </View>
              <View style={[styles.modeCard, { padding: spacing.lg }]}>
                <SkeletonCircle size={24} style={{ marginBottom: spacing.xs }} />
                <SkeletonLine width={80} height={14} />
              </View>
            </View>
          </View>
          {/* Checklist Skeleton */}
          <View style={[styles.section, { marginTop: spacing.md }]}>
            <SkeletonLine width={180} height={16} style={{ marginBottom: spacing.sm }} />
            <Card style={styles.checklistCard}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={[styles.checklistItem, { gap: 10 }]}>
                  <SkeletonCircle size={16} />
                  <SkeletonLine width="80%" height={14} />
                </View>
              ))}
            </Card>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const availableModes = service.availableModes && service.availableModes.length > 0
    ? service.availableModes
    : ['home_visit', 'online'];

  const rituals = service.ritualsIncluded && service.ritualsIncluded.length > 0
    ? service.ritualsIncluded
    : [
        'Ganesh Pujan and Swasti Vachan',
        'Kalash Sthapana and Navagraha Avahan',
        'Abhishek and Mool Mantra Chanting',
        'Sacred Hawan with 108 Ahutis',
        'Maha Mangal Aarti and Ashirvad',
      ];

  const weBring = service.samagriProvidedByUs && service.samagriProvidedByUs.length > 0
    ? service.samagriProvidedByUs
    : [
        'Pure Gir Cow A2 Ghee (500g)',
        'Certified Hawan Samagri with sacred herbs',
        'Navagraha Samidha sticks',
        'Roli, Akshat, Chandan, Janeu, Kalava',
      ];

  const devoteeArranges = service.samagriDevoteeArranges && service.samagriDevoteeArranges.length > 0
    ? service.samagriDevoteeArranges
    : [
        'Fresh flowers and Tulsi leaves',
        'Fresh fruits (5 varieties) and 5 Pan leaves',
        'Raw cow milk (250ml) and Gangajal',
      ];

  const serviceTitle = resolveLocalizedText(service.title, 'Vedic Puja Details');
  const serviceSubtitle = resolveLocalizedText(
    service.subtitle || service.description,
    'Authentic Vedic ceremony adhering to Shastric vidhis.'
  );
  const significanceText = resolveLocalizedText(service.significance, '');
  const categoryLabel = resolveLocalizedText(service.category, 'Vedic Ceremony');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title={serviceTitle} showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Divine Hero Header Banner with Image */}
        <View style={styles.heroBannerWrap}>
          <Image
            source={{ uri: service.imageUrl || getPujaImageUrl(service) }}
            style={styles.heroBannerImage}
            resizeMode="cover"
          />
          <View style={styles.heroBannerOverlay}>
            <View style={styles.heroBadgeRow}>
              <Badge label={categoryLabel} variant="gold" />
              <View style={styles.ratingBadge}>
                <Icon family="material" name="star" size={14} color={colors.goldAccent} />
                <Text style={styles.ratingText}>{service.rating || 4.9} ({service.reviewCount || 108} reviews)</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>{serviceTitle}</Text>
            <Text style={styles.heroSubtitle}>{serviceSubtitle}</Text>
            <View style={styles.durationRow}>
              <Icon family="material" name="schedule" size={14} color="#FDE68A" />
              <Text style={styles.durationText}>Duration: ~{service.durationMinutes || 120} Minutes (Complete Vidhi)</Text>
            </View>
          </View>
        </View>

        {/* Ceremony Mode Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Select Ceremony Mode</Text>
          <View style={styles.modeGrid}>
            {availableModes.map((mode) => {
              const isSelected = selectedMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setSelectedMode(mode)}
                  style={[styles.modeCard, isSelected && styles.modeCardSelected]}
                >
                  <Icon
                    family="material"
                    name={mode === 'home_visit' ? 'home' : 'videocam'}
                    size={22}
                    color={isSelected ? colors.primary : colors.textMuted}
                  />
                  <Text style={[styles.modeTitle, isSelected && styles.modeTitleSelected]}>
                    {mode === 'home_visit' ? 'Doorstep Visit' : 'Live Online'}
                  </Text>
                  <Text style={styles.modeDesc}>
                    {mode === 'home_visit' ? 'Acharya comes to home' : 'Interactive 1:1 HD'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Significance */}
        {significanceText ? (
          <Card variant="warm" style={styles.section}>
            <View style={styles.significanceHeader}>
              <Icon family="material-community" name="book-open-page-variant" size={18} color={colors.goldAccent} />
              <Text style={styles.significanceTitle}>Vedic Significance and Benefits</Text>
            </View>
            <Text style={styles.significanceBody}>{significanceText}</Text>
          </Card>
        ) : null}

        {/* Rituals Included Checklist */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Sacred Rituals Included ({rituals.length})</Text>
          <Card style={styles.checklistCard}>
            {rituals.map((ritual, idx) => (
              <View key={idx} style={styles.checklistItem}>
                <Icon family="material" name="check-circle" size={16} color={colors.success} style={styles.checkIcon} />
                <Text style={styles.checklistText}>{ritual}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Samagri Responsibilities Split */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Samagri and Preparations</Text>
          <Card style={styles.samagriCard}>
            <View style={styles.samagriCol}>
              <View style={styles.samagriHeader}>
                <Icon family="material-community" name="package-variant" size={16} color={colors.primary} />
                <Text style={styles.samagriColTitle}>What VedSarthi Brings</Text>
              </View>
              {weBring.map((item, i) => (
                <Text key={i} style={styles.samagriItem}>- {item}</Text>
              ))}
            </View>

            <View style={styles.samagriDivider} />

            <View style={styles.samagriCol}>
              <View style={styles.samagriHeader}>
                <Icon family="material" name="schedule" size={16} color={colors.goldAccent} />
                <Text style={styles.samagriColTitle}>Devotee Arranges at Home</Text>
              </View>
              {devoteeArranges.map((item, i) => (
                <Text key={i} style={styles.samagriItem}>- {item}</Text>
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceTag}>Total Dakshina</Text>
          <Text style={styles.priceVal}>₹{service.priceMinor ? service.priceMinor / 100 : 3500}</Text>
          <Text style={styles.advanceNote}>
            Advance: 25% (₹{service.priceMinor ? (service.priceMinor * 0.25) / 100 : 875})
          </Text>
        </View>
        <Button
          title="Select Shubh Muhurat"
          onPress={() => {
            navigation.navigate('PujaCheckout', { serviceId: service.id || serviceId });
          }}
          rightIcon={<Icon family="material" name="calendar-today" size={18} color="#FFFFFF" />}
          size="lg"
          style={styles.bookActionBtn}
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
  detailSkeletonContainer: {
    padding: spacing.screenPadding,
  },
  heroSkeleton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderWarm,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroBannerWrap: {
    width: '100%',
    minHeight: 220,
    position: 'relative',
    backgroundColor: colors.primaryDark,
  },
  heroBannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.35,
  },
  heroBannerOverlay: {
    padding: spacing.screenPadding,
    paddingVertical: spacing.xl,
  },
  heroBanner: {
    backgroundColor: colors.primary,
    padding: spacing.screenPadding,
    paddingVertical: spacing.xl,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
  },
  ratingText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  heroTitle: {
    ...typography.h2,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    ...typography.bodyMedium,
    color: '#FDE68A',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: spacing.screenPadding,
    marginTop: spacing.lg,
  },
  sectionHeading: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  modeGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  modeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  modeTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 6,
  },
  modeTitleSelected: {
    color: colors.primary,
  },
  modeDesc: {
    ...typography.captionSmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  significanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  significanceTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  significanceBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  checklistCard: {
    paddingVertical: spacing.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderWarm,
  },
  checkIcon: {
    marginRight: 8,
  },
  checklistText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
  },
  samagriCard: {
    padding: spacing.md,
  },
  samagriCol: {
    marginBottom: spacing.sm,
  },
  samagriHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  samagriColTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  samagriItem: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    marginLeft: 6,
  },
  samagriDivider: {
    height: 1,
    backgroundColor: colors.borderWarm,
    marginVertical: spacing.sm,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.borderWarm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
  },
  priceTag: {
    ...typography.captionSmall,
    color: colors.textMuted,
  },
  priceVal: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '800',
  },
  advanceNote: {
    ...typography.captionSmall,
    color: colors.success,
    fontWeight: '600',
  },
  bookActionBtn: {
    flex: 1,
    marginLeft: spacing.lg,
  },
});
