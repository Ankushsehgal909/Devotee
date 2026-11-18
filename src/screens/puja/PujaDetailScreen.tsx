import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { PujaStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon } from '../../components/common/Icon';
import { LinearGradient } from '../../components/common/LinearGradient';
import { CommonAppBackgroundScreen } from '../../components/common/CommonAppBackgroundScreen';
import {
  Skeleton,
  SkeletonLine,
  SkeletonCircle,
} from '../../components/common/Skeleton';
import { useService } from '../../api/services';
import { resolveLocalizedText } from '../../utils/localization';
import { getPujaImageUrl, siteImages } from '../../constants/images';

type PujaDetailRouteProp = RouteProp<PujaStackParamList, 'PujaDetail'>;

interface CeremonyModeOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  family: 'material-community' | 'material';
}

const CEREMONY_MODES: CeremonyModeOption[] = [
  {
    id: 'online',
    title: 'Live Online',
    subtitle: 'Interactive via Video',
    icon: 'video-outline',
    family: 'material-community',
  },
  {
    id: 'home_visit',
    title: 'Doorstep Visit',
    subtitle: 'At your home with Vedic team',
    icon: 'home',
    family: 'material-community',
  },
  {
    id: 'temple',
    title: 'Temple Visit',
    subtitle: 'Conducted at a sacred temple',
    icon: 'temple-hindu',
    family: 'material-community',
  },
];

export const PujaDetailScreen: React.FC = () => {
  const route = useRoute<PujaDetailRouteProp>();
  const navigation = useNavigation<any>();
  const { serviceId } = route.params;

  // Real API hook
  const { data: service, isLoading } = useService(serviceId);
  const [selectedMode, setSelectedMode] = useState<string>('home_visit');

  if (isLoading || !service) {
    return (
      <CommonAppBackgroundScreen
        safeAreaEdges={['top', 'left', 'right']}
        resizeMode="stretch"
      >
        <View style={styles.topHeader}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon family="material" name="arrow-back" size={22} color="#6B0E1E" />
          </TouchableOpacity>
          <Text style={styles.topHeaderTitle} numberOfLines={1}>
            Vedic Puja Details
          </Text>
        </View>

        <View style={styles.detailSkeletonContainer}>
          <View style={styles.heroSkeleton}>
            <Skeleton
              width={100}
              height={20}
              borderRadius={borderRadius.full}
              style={{ marginBottom: spacing.sm }}
            />
            <SkeletonLine
              width="85%"
              height={24}
              style={{ marginBottom: spacing.xs }}
            />
            <SkeletonLine
              width="95%"
              height={14}
              style={{ marginBottom: spacing.xs }}
            />
            <SkeletonLine width="60%" height={14} />
          </View>

          <View style={[styles.skeletonSection, { marginTop: spacing.md }]}>
            <SkeletonLine
              width={160}
              height={16}
              style={{ marginBottom: spacing.sm }}
            />
            <View style={styles.modeGrid}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={[styles.modeCardSkeleton, { padding: spacing.md }]}>
                  <SkeletonCircle size={24} style={{ marginBottom: spacing.xs }} />
                  <SkeletonLine width={60} height={12} />
                </View>
              ))}
            </View>
          </View>
        </View>
      </CommonAppBackgroundScreen>
    );
  }

  const rituals =
    service.ritualsIncluded && service.ritualsIncluded.length > 0
      ? service.ritualsIncluded
      : [
          'Sankalp Puja and Shuddhi Vidhana',
          'Kalash Sthapana and Navagraha Pujan',
          'Maha Mrityunjaya Jaap (as per chosen count)',
          'Ayushya Homa with Vedic Mantras',
          'Purnahuti, Aarti and Ashirvad',
        ];

  const weBring =
    service.samagriProvidedByUs && service.samagriProvidedByUs.length > 0
      ? service.samagriProvidedByUs
      : [
          'Pure Gir Cow A2 Ghee (250ml)',
          'Certified Havan Samagri with sacred herbs',
          'Navagraha Samagri set',
          'Puja Vessels (Kund, Spoon, Kalash, etc.)',
        ];

  const devoteeArranges =
    service.samagriDevoteeArranges && service.samagriDevoteeArranges.length > 0
      ? service.samagriDevoteeArranges
      : [
          'Fresh flowers and Tulsi leaves',
          'Fruits, sweets (as per sankalp) and clean water',
          'A clean and peaceful space for the ritual',
        ];

  const serviceTitle = resolveLocalizedText(
    service.title,
    'Maha Mrityunjaya Jaap & Ayushya Homa'
  );
  const serviceSubtitle = resolveLocalizedText(
    service.subtitle || service.description,
    'Rigvedic Mahamrityunjaya chanting with options for 11,000, 21,000, or 1.25 Lakh chants for conquering untimely death, severe ailments, and negative planetary afflictions.'
  );
  const significanceText = resolveLocalizedText(
    service.significance,
    'A powerful Vedic ritual for longevity (Ayushya), protection from untimely death, and relief from severe health issues.'
  );
  const categoryLabel = resolveLocalizedText(service.category, 'Anushthan');

  // Dakshina calculation
  const dakshinaAmount = service.priceMinor
    ? service.priceMinor / 100
    : typeof (service as any).dakshina === 'number'
    ? (service as any).dakshina
    : 550000;
  const advanceAmount = Math.round(dakshinaAmount * 0.2);

  // Duration text
  const durationText = service.durationMinutes
    ? `${Math.round(service.durationMinutes / 60)} Hours`
    : '3-6 Hours';

  const heroImageUri = service.imageUrl || getPujaImageUrl(service) || siteImages.homeAssetsVerticalsHomePujas;

  return (
    <CommonAppBackgroundScreen
      safeAreaEdges={['top', 'left', 'right']}
      resizeMode="stretch"
    >
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon family="material" name="arrow-back" size={22} color="#6B0E1E" />
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle} numberOfLines={1}>
          {serviceTitle}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Divine Hero Header Card */}
        <View style={styles.heroCard}>
          <Image
            source={{ uri: heroImageUri }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Dark Sacred Gradient Overlay */}
          <LinearGradient
            colors={['rgba(25, 6, 10, 0.9)', 'rgba(40, 10, 16, 0.78)', 'rgba(20, 5, 8, 0.45)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.heroContent}>
            {/* Top Badges Row */}
            <View style={styles.heroBadgeRow}>
              <View style={styles.categoryBadge}>
                <Icon
                  family="material-community"
                  name="fire"
                  size={12}
                  color="#C5221F"
                />
                <Text style={styles.categoryBadgeText}>{categoryLabel}</Text>
              </View>

              <View style={styles.ratingBadge}>
                <Icon
                  family="material"
                  name="star"
                  size={12}
                  color="#F59E0B"
                />
                <Text style={styles.ratingBadgeText}>
                  {service.rating || '4.5'} ({service.reviewCount ? service.reviewCount.toLocaleString() : '1,318'} reviews)
                </Text>
              </View>
            </View>

            {/* Service Title */}
            <Text style={styles.heroTitle} numberOfLines={2}>
              {serviceTitle}
            </Text>

            {/* Service Description */}
            <Text style={styles.heroSubtitle} numberOfLines={3}>
              {serviceSubtitle}
            </Text>

            {/* Duration Row */}
            <View style={styles.durationRow}>
              <Icon
                family="material-community"
                name="clock-outline"
                size={13}
                color="#FFFFFF"
              />
              <Text style={styles.durationText}>
                Duration: ~ {durationText} (based on Vidhi)
              </Text>
            </View>
          </View>
        </View>

        {/* Ceremony Mode Selector */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionHeading}>Select Ceremony Mode</Text>
        </View>

        <View style={styles.modeGrid}>
          {CEREMONY_MODES.map((mode) => {
            const isSelected = selectedMode === mode.id;
            return (
              <TouchableOpacity
                key={mode.id}
                activeOpacity={0.8}
                onPress={() => setSelectedMode(mode.id)}
                style={[
                  styles.modeCard,
                  isSelected && styles.modeCardSelected,
                ]}
              >
                {/* Checkmark circle badge for selected mode */}
                {isSelected && (
                  <View style={styles.modeCheckmarkBadge}>
                    <Icon
                      family="material"
                      name="check"
                      size={10}
                      color="#FFFFFF"
                    />
                  </View>
                )}

                <Icon
                  family={mode.family}
                  name={mode.icon}
                  size={24}
                  color={isSelected ? '#7E1528' : '#7E1528'}
                />
                <Text
                  style={[
                    styles.modeTitle,
                    isSelected && styles.modeTitleSelected,
                  ]}
                  numberOfLines={1}
                >
                  {mode.title}
                </Text>
                <Text
                  style={[
                    styles.modeSubtitle,
                    isSelected && styles.modeSubtitleSelected,
                  ]}
                  numberOfLines={2}
                >
                  {mode.subtitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Vedic Significance and Benefits Card */}
        {Boolean(significanceText) && (
          <View style={styles.significanceCard}>
            {/* Sacred Om Watermark */}
            <Text style={styles.omWatermark} pointerEvents="none">
              ॐ
            </Text>

            <View style={styles.significanceHeaderRow}>
              <Icon
                family="material-community"
                name="book-open-page-variant"
                size={16}
                color="#7E1528"
              />
              <Text style={styles.significanceTitle}>
                Vedic Significance and Benefits
              </Text>
            </View>
            <Text style={styles.significanceBody}>{significanceText}</Text>
          </View>
        )}

        {/* Sacred Rituals Included Section */}
        <View style={styles.ritualsHeaderRow}>
          <Text style={styles.sectionHeading}>
            Sacred Rituals Included ({rituals.length})
          </Text>
          <View style={styles.ritualsBadge}>
            <Text style={styles.ritualsBadgeText}>{rituals.length} Items</Text>
          </View>
        </View>

        <View style={styles.ritualsCard}>
          {/* Subtle flare watermark in bottom corner */}
          <View style={styles.watermarkFlare} pointerEvents="none">
            <Icon
              family="material-community"
              name="flare"
              size={52}
              color="#D8C4A8"
            />
          </View>

          {rituals.map((ritual, idx) => (
            <View key={idx} style={styles.ritualRow}>
              <Icon
                family="material"
                name="check-circle"
                size={15}
                color="#16A34A"
              />
              <Text style={styles.ritualText}>{ritual}</Text>
            </View>
          ))}
        </View>

        {/* Samagri and Preparations Section */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionHeading}>Samagri and Preparrations</Text>
        </View>

        {/* Sub-card 1: What VedSarthi Brings */}
        <View style={styles.weBringCard}>
          <View style={styles.samagriLeftCol}>
            <View style={styles.samagriHeaderRow}>
              <Icon
                family="material-community"
                name="package-variant"
                size={16}
                color="#7E1528"
              />
              <Text style={styles.weBringTitle}>What VedSarthi Brings</Text>
            </View>
            {weBring.map((item, idx) => (
              <Text key={idx} style={styles.samagriBullet}>
                • {item}
              </Text>
            ))}
          </View>
          <Image
            source={{ uri: siteImages.homeAssetsVerticalsSacredSamagri }}
            style={styles.samagriThumb}
            resizeMode="cover"
          />
        </View>

        {/* Sub-card 2: Devotee Arranges at Home */}
        <View style={styles.devoteeArrangesCard}>
          <View style={styles.samagriLeftCol}>
            <View style={styles.samagriHeaderRow}>
              <Icon
                family="material-community"
                name="flower-tulip-outline"
                size={16}
                color="#D97706"
              />
              <Text style={styles.devoteeArrangesTitle}>
                Devotee Arranges at Home
              </Text>
            </View>
            {devoteeArranges.map((item, idx) => (
              <Text key={idx} style={styles.samagriBullet}>
                • {item}
              </Text>
            ))}
          </View>
          <Image
            source={{ uri: siteImages.homeAssetsPujaSamagri1 }}
            style={styles.samagriThumb}
            resizeMode="cover"
          />
        </View>
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceTag}>Ritual Dakshina</Text>
          <Text style={styles.priceVal}>
            ₹{dakshinaAmount.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.advanceNote}>
            Advance: ₹{advanceAmount.toLocaleString('en-IN')} (20%)
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.bookActionBtn}
          onPress={() => {
            navigation.navigate('PujaCheckout', {
              serviceId: service.id || serviceId,
            });
          }}
        >
          <Text style={styles.bookActionText}>Select Shubh Muhurat</Text>
          <Icon
            family="material-community"
            name="calendar-month"
            size={16}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </CommonAppBackgroundScreen>
  );
};

const styles = StyleSheet.create({
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
    fontSize: 17,
    fontWeight: '700',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroCard: {
    height: 198,
    marginHorizontal: spacing.screenPadding,
    marginTop: 6,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroContent: {
    ...StyleSheet.absoluteFill,
    padding: 14,
    justifyContent: 'space-between',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7E1528',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  ratingBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: typography.fontFamilySerif,
    marginTop: 4,
  },
  heroSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.92)',
    lineHeight: 15,
    marginTop: 2,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  durationText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  sectionHeaderWrap: {
    marginHorizontal: spacing.screenPadding,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C1810',
  },
  modeGrid: {
    flexDirection: 'row',
    marginHorizontal: spacing.screenPadding,
    gap: 8,
  },
  modeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE4D6',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  modeCardSelected: {
    backgroundColor: '#FFF5F5',
    borderColor: '#7E1528',
    borderWidth: 1.5,
  },
  modeCheckmarkBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#7E1528',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  modeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2C1810',
    marginTop: 6,
    textAlign: 'center',
  },
  modeTitleSelected: {
    color: '#7E1528',
  },
  modeSubtitle: {
    fontSize: 10,
    color: '#7A6E63',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 13,
  },
  modeSubtitleSelected: {
    color: '#7E1528',
  },
  significanceCard: {
    backgroundColor: '#FFFDF7',
    borderWidth: 1,
    borderColor: '#F3E6D8',
    borderRadius: 14,
    marginHorizontal: spacing.screenPadding,
    marginTop: 12,
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  omWatermark: {
    position: 'absolute',
    right: 12,
    top: 2,
    fontSize: 52,
    color: '#D97706',
    opacity: 0.12,
    fontWeight: '700',
  },
  significanceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  significanceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7E1528',
  },
  significanceBody: {
    fontSize: 11.5,
    color: '#4A4642',
    lineHeight: 16.5,
    paddingRight: 24,
  },
  ritualsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.screenPadding,
    marginTop: 16,
    marginBottom: 8,
  },
  ritualsBadge: {
    backgroundColor: '#FCEFEF',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  ritualsBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7E1528',
  },
  ritualsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE4D6',
    borderRadius: 14,
    marginHorizontal: spacing.screenPadding,
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  watermarkFlare: {
    position: 'absolute',
    right: 4,
    bottom: -6,
    opacity: 0.18,
  },
  ritualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4.5,
  },
  ritualText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#2C1810',
    flex: 1,
  },
  weBringCard: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#F5DCDD',
    borderRadius: 14,
    marginHorizontal: spacing.screenPadding,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  devoteeArrangesCard: {
    backgroundColor: '#FFFDF7',
    borderWidth: 1,
    borderColor: '#F3E6D8',
    borderRadius: 14,
    marginHorizontal: spacing.screenPadding,
    marginTop: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  samagriLeftCol: {
    flex: 1,
    paddingRight: 10,
  },
  samagriHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  weBringTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#7E1528',
  },
  devoteeArrangesTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#92400E',
  },
  samagriBullet: {
    fontSize: 11,
    color: '#4A4642',
    lineHeight: 16,
    marginBottom: 1,
  },
  samagriThumb: {
    width: 78,
    height: 68,
    borderRadius: 10,
    backgroundColor: '#EADFCF',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFE4D6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: 12,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  priceTag: {
    fontSize: 11,
    color: '#7A6E63',
  },
  priceVal: {
    fontSize: 18,
    fontFamily: typography.fontFamilySerif,
    fontWeight: '700',
    color: '#1A1110',
    marginTop: 1,
  },
  advanceNote: {
    fontSize: 10.5,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 1,
  },
  bookActionBtn: {
    backgroundColor: '#7E1528',
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#7E1528',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bookActionText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
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
  skeletonSection: {
    marginTop: spacing.md,
  },
  modeCardSkeleton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderWarm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
});
