import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { PanchangSkeleton, PujaCardSkeleton } from '../../components/common/Skeleton';
import { useAuthStore } from '../../store/useAuthStore';
import { useServices } from '../../api/services';
import { usePanchang, useBookings, useDevoteeAccount } from '../../api/customer';
import { PujaService } from '../../types';
import { resolveLocalizedText } from '../../utils/localization';
import { siteImages, getPujaImageUrl } from '../../constants/images';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HERO_SLIDES = [
  {
    id: 'slide-1',
    image: siteImages.homeSlide1,
    title: 'Certified Gurukul Acharyas',
    subtitle: 'Veda Murti Pandits from Kashi & Haridwar for authentic doorstep vidhis.',
    cta: 'Book Vedic Puja',
    target: 'PujasTab',
  },
  {
    id: 'slide-2',
    image: siteImages.homeSlide2,
    title: 'Consecrated Samagri Kits',
    subtitle: '100% pure Katyayana Smriti certified hawan herbs & Gir Cow A2 Ghee.',
    cta: 'Order Pure Samagri',
    target: 'StoreTab',
  },
  {
    id: 'slide-3',
    image: siteImages.homeSlide3,
    title: 'Sacred Sankalp & Live Darshan',
    subtitle: 'Gotra, Nakshatra, and Rashi consecrated ceremonies with live tracking.',
    cta: 'Explore Directory',
    target: 'PanditsDirectory',
  },
];

const SACRED_VERTICALS = [
  {
    id: 'home-pujas',
    title: 'Home Pujas',
    image: siteImages.homeAssetsVerticalsHomePujas,
    target: 'PujasTab',
  },
  {
    id: 'gurukul-acharyas',
    title: 'Acharyas',
    image: siteImages.homeAssetsVerticalsGurukulAcharyas,
    target: 'PanditsDirectory',
  },
  {
    id: 'maha-anushthan',
    title: 'Maha Yajna',
    image: siteImages.homeAssetsVerticalsMahaAnushthan,
    target: 'PujasTab',
  },
  {
    id: 'pure-samagri',
    title: 'Pure Samagri',
    image: siteImages.homeAssetsVerticalsSacredSamagri,
    target: 'StoreTab',
  },
  {
    id: 'teerth-pujas',
    title: 'Teerth Pujas',
    image: siteImages.homeAssetsVerticalsTeerthEpujas,
    target: 'PujasTab',
  },
];

export const HomeScreen: React.FC = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const [activeSlide, setActiveSlide] = useState(0);

  // Real API data hooks
  const { data: serverUser } = useDevoteeAccount();
  const { data: panchang, isLoading: isPanchangLoading } = usePanchang();
  const { data: services, isLoading: isServicesLoading } = useServices({ limit: 6 });
  const { data: bookings } = useBookings({ limit: 1 });

  const activeBooking = bookings && bookings.length > 0 ? bookings[0] : null;

  const devoteeName = resolveLocalizedText(serverUser?.name || user?.name, 'Devotee');
  const devoteeGotra = resolveLocalizedText(serverUser?.gotra || user?.gotra, 'Kashyap');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Devotee Navigation Bar */}
      <View style={styles.topNav}>
        <View>
          <Text style={styles.greetingText}>Namaste, {devoteeName}</Text>
          <Text style={styles.gotraText}>{devoteeGotra} Gotra | Sanatan Devotee</Text>
        </View>
        <View style={styles.topNavActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('FestivalCalendar')}
          >
            <Icon family="material-community" name="calendar-month-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('StoreTab', { screen: 'CartScreen' })}
          >
            <Icon family="material-community" name="shopping-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Banner Carousel Slider */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - spacing.screenPadding * 2));
              setActiveSlide(slide);
            }}
            scrollEventThrottle={16}
          >
            {HERO_SLIDES.map((slide) => (
              <View key={slide.id} style={styles.heroSlide}>
                <Image
                  source={{ uri: slide.image }}
                  style={styles.heroSlideImage}
                  resizeMode="cover"
                />
                <View style={styles.heroSlideOverlay}>
                  <Text style={styles.heroSlideTitle}>{slide.title}</Text>
                  <Text style={styles.heroSlideSubtitle} numberOfLines={2}>
                    {slide.subtitle}
                  </Text>
                  <TouchableOpacity
                    style={styles.heroSlideCta}
                    onPress={() => {
                      if (slide.target === 'PanditsDirectory') {
                        navigation.navigate('PanditsDirectory');
                      } else {
                        navigation.navigate(slide.target);
                      }
                    }}
                  >
                    <Text style={styles.heroSlideCtaText}>{slide.cta}</Text>
                    <Icon family="material" name="arrow-forward" size={14} color={colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.carouselPagination}>
            {HERO_SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.paginationDot,
                  activeSlide === i && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Sacred Verticals Horizontal Strip (Like Web) */}
        <View style={styles.verticalsSection}>
          <Text style={styles.verticalsHeader}>Sacred Sanatan Offerings</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.verticalsRow}
          >
            {SACRED_VERTICALS.map((vert) => (
              <TouchableOpacity
                key={vert.id}
                style={styles.verticalCard}
                onPress={() => {
                  if (vert.target === 'PanditsDirectory') {
                    navigation.navigate('PanditsDirectory');
                  } else {
                    navigation.navigate(vert.target);
                  }
                }}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: vert.image }}
                  style={styles.verticalImage}
                  resizeMode="cover"
                />
                <View style={styles.verticalOverlay}>
                  <Text style={styles.verticalText}>{vert.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Daily Panchang Strip from live API or Skeleton */}
        {isPanchangLoading ? (
          <PanchangSkeleton style={styles.panchangCard} />
        ) : (
          <Card variant="warm" style={styles.panchangCard}>
            <View style={styles.panchangRow}>
              <View style={styles.panchangLeft}>
                <View style={styles.panchangIcon}>
                  <Icon family="material-community" name="weather-sunny" size={20} color={colors.goldAccent} />
                </View>
                <View>
                  <Text style={styles.panchangTithi}>{resolveLocalizedText(panchang?.tithi, 'Shukla Ashtami')}</Text>
                  <Text style={styles.panchangNakshatra}>
                    {resolveLocalizedText(panchang?.nakshatra, 'Rohini')} Nakshatra | {resolveLocalizedText(panchang?.paksha, 'Shukla')} Paksha
                  </Text>
                </View>
              </View>
              <Badge label="Shubh Day" variant="gold" />
            </View>
            <View style={styles.panchangDivider} />
            <View style={styles.muhuratRow}>
              <View style={styles.muhuratItem}>
                <Icon family="material" name="schedule" size={14} color={colors.success} />
                <Text style={styles.muhuratText}>
                  Abhijit: {resolveLocalizedText(panchang?.abhijitMuhurat, '11:45 AM - 12:30 PM')}
                </Text>
              </View>
              <View style={styles.muhuratItem}>
                <Text style={styles.muhuratRed}>
                  Rahu: {resolveLocalizedText(panchang?.rahuKaalam, '04:15 PM - 05:35 PM')}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Active Booking Pulse (from live API) */}
        {activeBooking && (
          <Card
            style={styles.activeBookingCard}
            onPress={() =>
              navigation.navigate('PujasTab', {
                screen: 'BookingDetail',
                params: { bookingId: activeBooking.id },
              })
            }
          >
            <View style={styles.bookingHeader}>
              <View style={styles.activeIndicatorRow}>
                <View style={styles.activeDot} />
                <Text style={styles.activeBookingTitle}>Upcoming Vedic Ceremony</Text>
              </View>
              <Badge label="Confirmed" variant="success" />
            </View>
            <Text style={styles.bookingServiceName}>
              {resolveLocalizedText(activeBooking.serviceName, 'Sacred Vedic Ceremony')}
            </Text>
            {activeBooking.attendanceCode && (
              <View style={styles.attendanceWrap}>
                <Text style={styles.bookingDetails}>
                  Attendance Code: <Text style={styles.codeText}>{String(activeBooking.attendanceCode)}</Text>
                </Text>
                <Text style={styles.codeTapNotice}>Tap to view ceremony command center →</Text>
              </View>
            )}
            <Text style={styles.bookingSubtext}>
              Share this 6-digit verification code with the Acharya upon arrival.
            </Text>
          </Card>
        )}

        {/* Quick Devotional Actions */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('PujasTab')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FDF2F8' }]}>
              <Icon family="material-community" name="fire" size={24} color={colors.primary} />
            </View>
            <Text style={styles.quickActionText}>Book Puja</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('PanditsDirectory')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FFFBEB' }]}>
              <Icon family="material-community" name="account-group" size={24} color={colors.goldAccent} />
            </View>
            <Text style={styles.quickActionText}>Acharyas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('MalaTab')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Icon family="material-community" name="om" size={24} color={colors.goldAccent} />
            </View>
            <Text style={styles.quickActionText}>Japam Mala</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('StoreTab')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#F0FDF4' }]}>
              <Icon family="material-community" name="shopping-outline" size={24} color={colors.success} />
            </View>
            <Text style={styles.quickActionText}>Pure Samagri</Text>
          </TouchableOpacity>
        </View>

        {/* Trending Vedic Pujas from API with Photos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Sacred Pujas</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PujasTab')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {isServicesLoading ? (
          <View>
            <PujaCardSkeleton style={styles.serviceCard} />
            <PujaCardSkeleton style={styles.serviceCard} />
          </View>
        ) : services && services.length > 0 ? (
          services.slice(0, 3).map((service: PujaService, idx: number) => {
            const serviceTitle = resolveLocalizedText(service.title, 'Sacred Vedic Vidhi');
            const serviceSubtitle = resolveLocalizedText(
              service.subtitle || service.description,
              'Authentic Vedic ceremony adhering to Shastric vidhis.'
            );
            const categoryLabel = resolveLocalizedText(service.category, 'Vedic Vidhi');
            const price = service.priceMinor ? service.priceMinor / 100 : 3500;
            const imageUrl = service.imageUrl || getPujaImageUrl(service, idx);

            return (
              <Card
                key={service.id}
                style={styles.serviceCard}
                onPress={() =>
                  navigation.navigate('PujasTab', {
                    screen: 'PujaDetail',
                    params: { serviceId: service.id },
                  })
                }
              >
                {/* Photographic Header */}
                <View style={styles.serviceImageWrap}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.serviceImage}
                    resizeMode="cover"
                  />
                  <View style={styles.serviceCategoryBadge}>
                    <Text style={styles.serviceCategoryText}>{categoryLabel}</Text>
                  </View>
                  <View style={styles.servicePriceBadge}>
                    <Text style={styles.servicePrice}>₹{price}</Text>
                  </View>
                </View>

                <View style={styles.serviceBody}>
                  <Text style={styles.serviceTitle}>{serviceTitle}</Text>
                  <Text style={styles.serviceSubtitle} numberOfLines={2}>
                    {serviceSubtitle}
                  </Text>
                  <View style={styles.serviceFooter}>
                    <Text style={styles.serviceDuration}>~{service.durationMinutes || 120} mins | Authentic Vidhi</Text>
                    <View style={styles.bookCta}>
                      <Text style={styles.bookCtaText}>Select Vidhi</Text>
                      <Icon family="material" name="chevron-right" size={16} color={colors.primary} />
                    </View>
                  </View>
                </View>
              </Card>
            );
          })
        ) : (
          <Card style={styles.emptyCard}>
            <Icon family="material-community" name="book-open-page-variant" size={32} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Sacred Offerings</Text>
            <Text style={styles.emptySubtext}>
              Explore our full directory of certified Acharyas and Vedic ritual vidhis.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('PujasTab')}
            >
              <Text style={styles.emptyBtnText}>Explore Puja Catalog</Text>
            </TouchableOpacity>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSand,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderWarm,
    backgroundColor: colors.bgSand,
  },
  greetingText: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  gotraText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  topNavActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  carouselContainer: {
    marginBottom: spacing.lg,
  },
  heroSlide: {
    width: SCREEN_WIDTH - spacing.screenPadding * 2,
    height: 180,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.primaryDark,
  },
  heroSlideImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  heroSlideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 17, 16, 0.45)',
    padding: spacing.lg,
    justifyContent: 'flex-end',
  },
  heroSlideTitle: {
    ...typography.h3,
    color: colors.white,
    fontFamily: typography.fontFamilySerif,
    marginBottom: 4,
  },
  heroSlideSubtitle: {
    ...typography.bodySmall,
    color: '#FDE68A',
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  heroSlideCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  heroSlideCtaText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  carouselPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderWarm,
  },
  paginationDotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
  verticalsSection: {
    marginBottom: spacing.lg,
  },
  verticalsHeader: {
    ...typography.h4,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamilySerif,
  },
  verticalsRow: {
    gap: spacing.sm,
  },
  verticalCard: {
    width: 105,
    height: 105,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  verticalImage: {
    width: '100%',
    height: '100%',
  },
  verticalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
    padding: 6,
  },
  verticalText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: '700',
    textAlign: 'center',
  },
  panchangCard: {
    marginBottom: spacing.lg,
  },
  panchangRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panchangLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  panchangIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panchangTithi: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  panchangNakshatra: {
    ...typography.caption,
    color: colors.textMuted,
  },
  panchangDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: spacing.sm,
  },
  muhuratRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  muhuratItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  muhuratText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  muhuratRed: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '600',
  },
  activeBookingCard: {
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  activeIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  activeBookingTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  bookingServiceName: {
    ...typography.h4,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  attendanceWrap: {
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  bookingDetails: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  codeText: {
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
  },
  codeTapNotice: {
    ...typography.captionSmall,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  bookingSubtext: {
    ...typography.caption,
    color: colors.textMuted,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: 8,
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quickActionText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primaryDark,
    fontFamily: typography.fontFamilySerif,
  },
  viewAllText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
  serviceCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  serviceImageWrap: {
    height: 140,
    width: '100%',
    position: 'relative',
    backgroundColor: '#EAE6E1',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  serviceCategoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  serviceCategoryText: {
    ...typography.captionSmall,
    fontWeight: '700',
    color: colors.primary,
  },
  servicePriceBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  servicePrice: {
    ...typography.bodySmall,
    fontWeight: '800',
    color: colors.goldAccent,
  },
  serviceBody: {
    padding: spacing.cardPadding,
  },
  serviceTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  serviceSubtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: spacing.sm,
  },
  serviceDuration: {
    ...typography.caption,
    color: colors.textMuted,
  },
  bookCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  bookCtaText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h4,
    marginTop: spacing.sm,
    color: colors.textPrimary,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  emptyBtnText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '700',
  },
});
