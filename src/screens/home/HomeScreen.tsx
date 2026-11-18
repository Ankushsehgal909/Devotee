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
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon } from '../../components/common/Icon';
import {
  CommonAppBackgroundScreen,
  LinearGradient,
} from '../../components/common';
import {
  PanchangSkeleton,
  PujaCardSkeleton,
  Skeleton,
} from '../../components/common/Skeleton';
import { localImages, siteImages, getPujaImageUrl } from '../../constants/images';
import { useAuthStore } from '../../store/useAuthStore';
import { useServices } from '../../api/services';
import { useDevoteeAccount, useBookings, usePanchang } from '../../api/customer';
import { PujaService } from '../../types';
import { resolveLocalizedText } from '../../utils/localization';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_CARD_WIDTH = SCREEN_WIDTH - 32;

const HERO_SLIDES = [
  {
    id: 'slide-1',
    image: siteImages.homeSlide1,
    title: 'Book Authentic\nVedic Pujas',
    subtitle: 'With Verified Pandits, Pure Samagri\n& Home Puja सुविधा',
    cta: 'Book a Puja',
    target: 'PujasTab',
  },
  {
    id: 'slide-2',
    image: siteImages.homeSlide2,
    title: 'Consecrated\nSamagri Kits',
    subtitle: '100% pure Katyayana Smriti certified\nhawan herbs & Gir Cow A2 Ghee',
    cta: 'Order Samagri',
    target: 'StoreTab',
  },
  {
    id: 'slide-3',
    image: siteImages.homeSlide3,
    title: 'Sacred Sankalp\n& Live Darshan',
    subtitle: 'Gotra, Nakshatra, and Rashi consecrated\nceremonies with live tracking',
    cta: 'Explore Directory',
    target: 'PanditsDirectory',
  },
];

const QUICK_SERVICES = [
  {
    id: 'puja-samagri',
    title: 'Puja Samagri',
    icon: 'shopping-basket',
    family: 'material-community',
    bg: '#FDF1F0',
    border: '#F6D9D7',
    iconColor: '#7E1528',
    targetTab: 'StoreTab',
  },
  {
    id: 'book-pandit',
    title: 'Book a Pandit',
    icon: 'account-outline',
    family: 'material-community',
    bg: '#FFF9ED',
    border: '#FCE6B7',
    iconColor: '#B4731A',
    target: 'PanditsDirectory',
  },
  {
    id: 'schedule-puja',
    title: 'Schedule Puja',
    icon: 'calendar-month-outline',
    family: 'material-community',
    bg: '#FFF4EB',
    border: '#FCDCC6',
    iconColor: '#C4691B',
    targetTab: 'PujasTab',
  },
  {
    id: 'vedic-guides',
    title: 'Vedic Guides',
    icon: 'book-open-outline',
    family: 'material-community',
    bg: '#F1F8F1',
    border: '#D8EDD3',
    iconColor: '#246D3F',
    target: 'FestivalCalendar',
  },
];

export const HomeScreen: React.FC = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const [activeSlide, setActiveSlide] = useState(0);

  // Live API hooks
  const { data: serverUser } = useDevoteeAccount();
  const { data: panchang, isLoading: isPanchangLoading } = usePanchang();
  const { data: services, isLoading: isServicesLoading } = useServices({ limit: 10 });
  const { data: bookings } = useBookings({ limit: 1 });

  const activeBooking = bookings && bookings.length > 0 ? bookings[0] : null;

  return (
    <CommonAppBackgroundScreen
      safeAreaEdges={['top', 'left', 'right']}
      resizeMode="stretch"
    >
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        {/* Left: Hamburger menu */}
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => navigation.navigate('AccountTab')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Icon family="material" name="menu" size={24} color="#1E1E24" />
        </TouchableOpacity>

        {/* Center: Brand Identity */}
        <View style={styles.brandContainer}>
          <Image
            source={localImages.om}
            style={styles.brandOmLogo}
            resizeMode="contain"
          />
          <View style={styles.brandTextCol}>
            <Text style={styles.brandTitle}>VedSarthi</Text>
            <Text style={styles.brandSubtitle}>Your Vedic Companion</Text>
          </View>
        </View>

        {/* Right: Notification bell & Search */}
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.navigate('FestivalCalendar')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <View style={styles.notificationWrap}>
              <Icon
                family="material-community"
                name="bell-outline"
                size={23}
                color="#1E1E24"
              />
              <View style={styles.notificationDot} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.navigate('PujasTab')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Icon family="material" name="search" size={25} color="#1E1E24" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Hero Banner Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={e => {
              const slide = Math.round(
                e.nativeEvent.contentOffset.x / HERO_CARD_WIDTH,
              );
              if (slide !== activeSlide && slide >= 0 && slide < HERO_SLIDES.length) {
                setActiveSlide(slide);
              }
            }}
            scrollEventThrottle={16}
          >
            {HERO_SLIDES.map(slide => (
              <View key={slide.id} style={styles.heroCard}>
                <Image
                  source={{ uri: slide.image }}
                  style={styles.heroCardImage}
                  resizeMode="cover"
                />
                <View style={styles.heroGradientOverlay}>
                  <View style={styles.heroLeftCol}>
                    <Text style={styles.heroTitle}>{slide.title}</Text>
                    <Text style={styles.heroSubtitle}>{slide.subtitle}</Text>
                    <Image
                      source={localImages.divider}
                      style={styles.heroLotusDivider}
                      resizeMode="contain"
                    />
                    <TouchableOpacity
                      style={styles.heroCtaWrap}
                      onPress={() => {
                        if (slide.target === 'PanditsDirectory') {
                          navigation.navigate('PanditsDirectory');
                        } else {
                          navigation.navigate(slide.target);
                        }
                      }}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={['#9E1B32', '#6B0E1E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCtaGradient}
                      >
                        <Text style={styles.heroCtaText}>{slide.cta}</Text>
                        <Icon
                          family="material"
                          name="arrow-forward"
                          size={14}
                          color={colors.white}
                        />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Carousel Pagination Dots */}
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

        {/* Section 2: Explore by Occasion (Live from API) */}
        <View style={styles.occasionSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <Icon
                family="material-community"
                name="spa-outline"
                size={20}
                color="#C49A45"
              />
              <Text style={styles.sectionTitle}>Explore by Occasion</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('PujasTab')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All &gt;</Text>
            </TouchableOpacity>
          </View>

          {isServicesLoading ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.occasionsScroll}
            >
              {[1, 2, 3, 4].map(k => (
                <View key={k} style={styles.occasionSkeletonCard}>
                  <Skeleton width="100%" height="100%" borderRadius={14} />
                </View>
              ))}
            </ScrollView>
          ) : services && services.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.occasionsScroll}
            >
              {services.slice(0, 6).map((service: PujaService, idx: number) => {
                const title = resolveLocalizedText(service.title, 'Vedic Vidhi');
                const imageUrl = service.imageUrl || getPujaImageUrl(service, idx);
                return (
                  <TouchableOpacity
                    key={service.id}
                    style={styles.occasionCard}
                    onPress={() =>
                      navigation.navigate('PujasTab', {
                        screen: 'PujaDetail',
                        params: { serviceId: service.id },
                      })
                    }
                    activeOpacity={0.88}
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.occasionImage}
                      resizeMode="cover"
                    />
                    <View style={styles.occasionGradientOverlay}>
                      <Text style={styles.occasionCardTitle} numberOfLines={2}>
                        {title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : null}
        </View>

        {/* Active Booking Banner (from Live API if present) */}
        {activeBooking && (
          <TouchableOpacity
            style={styles.activeBookingCard}
            onPress={() =>
              navigation.navigate('PujasTab', {
                screen: 'BookingDetail',
                params: { bookingId: activeBooking.id },
              })
            }
            activeOpacity={0.88}
          >
            <View style={styles.bookingHeader}>
              <View style={styles.activeDot} />
              <Text style={styles.activeBookingTitle}>
                Upcoming Vedic Ceremony
              </Text>
            </View>
            <Text style={styles.bookingServiceName}>
              {resolveLocalizedText(
                activeBooking.serviceName,
                'Sacred Vedic Ceremony',
              )}
            </Text>
            {activeBooking.attendanceCode && (
              <Text style={styles.bookingCodeText}>
                Attendance Code:{' '}
                <Text style={styles.codeBold}>
                  {String(activeBooking.attendanceCode)}
                </Text>
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Section 3: "Not Sure Which Puja to Do?" Banner */}
        <View style={styles.guidanceCard}>
          <View style={styles.guidanceLotusBadge}>
            <Icon
              family="material-community"
              name="spa-outline"
              size={24}
              color="#C49A45"
            />
          </View>
          <View style={styles.guidanceTextCol}>
            <Text style={styles.guidanceTitle}>Not Sure Which Puja to Do?</Text>
            <Text style={styles.guidanceSubtitle}>
              Get a personalized recommendation from our Vedic experts.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.guidanceBtn}
            onPress={() => navigation.navigate('PanditsDirectory')}
            activeOpacity={0.7}
          >
            <Text style={styles.guidanceBtnText}>Get Guidance</Text>
            <Icon family="material" name="arrow-forward" size={13} color="#7E1528" />
          </TouchableOpacity>
        </View>

        {/* Section 4: Upcoming Auspicious Days (Live from Panchang API) */}
        {isPanchangLoading ? (
          <PanchangSkeleton style={styles.auspiciousCard} />
        ) : panchang ? (
          <View style={styles.auspiciousCard}>
            <View style={styles.auspiciousHeader}>
              <View style={styles.auspiciousHeaderLeft}>
                <Icon
                  family="material-community"
                  name="calendar-month-outline"
                  size={18}
                  color="#1D5D3A"
                />
                <Text style={styles.auspiciousHeaderTitle}>
                  Daily Auspicious Panchang
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('FestivalCalendar')}
                activeOpacity={0.7}
              >
                <Text style={styles.viewCalendarText}>Festival Calendar &gt;</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.auspiciousRow}>
              {/* Daily Tithi & Nakshatra */}
              <View style={styles.auspiciousItem}>
                <View style={styles.dateBlock}>
                  <Icon
                    family="material-community"
                    name="weather-sunny"
                    size={22}
                    color="#D97706"
                  />
                  <Text style={styles.dateMonth}>{panchang.paksha || 'Shukla'}</Text>
                </View>
                <View style={styles.dateInfo}>
                  <Text style={styles.eventTitle}>
                    {resolveLocalizedText(panchang.tithi, 'Shukla Tithi')}
                  </Text>
                  <Text style={styles.eventSubtitle} numberOfLines={1}>
                    {resolveLocalizedText(panchang.nakshatra, 'Rohini')} Nakshatra
                  </Text>
                </View>
              </View>

              <View style={styles.auspiciousDivider} />

              {/* Shubh Muhurat */}
              <View style={styles.auspiciousItem}>
                <View style={styles.dateBlock}>
                  <Icon
                    family="material-community"
                    name="clock-outline"
                    size={22}
                    color="#15803D"
                  />
                  <Text style={styles.dateMonth}>Muhurat</Text>
                </View>
                <View style={styles.dateInfo}>
                  <Text style={styles.eventTitle}>Abhijit Muhurat</Text>
                  <Text style={styles.eventSubtitle} numberOfLines={1}>
                    {resolveLocalizedText(
                      panchang.abhijitMuhurat,
                      '11:45 AM - 12:30 PM',
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {/* Section 5: Quick Devotional Services (4 Navigation Pills) */}
        <View style={styles.quickServicesGrid}>
          {QUICK_SERVICES.map(service => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.quickServiceCard,
                { backgroundColor: service.bg, borderColor: service.border },
              ]}
              onPress={() => {
                if (service.targetTab) {
                  navigation.navigate(service.targetTab);
                } else if (service.target) {
                  navigation.navigate(service.target);
                }
              }}
              activeOpacity={0.8}
            >
              <View style={styles.quickServiceIconWrap}>
                <Icon
                  family={service.family as any}
                  name={service.icon}
                  size={24}
                  color={service.iconColor}
                />
              </View>
              <Text style={styles.quickServiceText}>{service.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section 6: Popular Pujas & Rituals (Live from API) */}
        <View style={styles.popularSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <Icon
                family="material-community"
                name="spa-outline"
                size={20}
                color="#C49A45"
              />
              <Text style={styles.sectionTitle}>Popular Pujas & Rituals</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('PujasTab')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All &gt;</Text>
            </TouchableOpacity>
          </View>

          {isServicesLoading ? (
            <View style={styles.skeletonList}>
              <PujaCardSkeleton />
              <PujaCardSkeleton />
            </View>
          ) : services && services.length > 0 ? (
            <View style={styles.popularList}>
              {services.slice(0, 4).map((service: PujaService, idx: number) => {
                const title = resolveLocalizedText(
                  service.title,
                  'Sacred Vedic Vidhi',
                );
                const subtitle = resolveLocalizedText(
                  service.subtitle || service.description,
                  'Authentic Vedic ceremony adhering to Shastric vidhis.',
                );
                const price = service.priceMinor
                  ? (service.priceMinor / 100).toLocaleString('en-IN')
                  : '3,500';
                const duration = service.durationMinutes
                  ? `~ ${Math.round(service.durationMinutes / 60)} Hours`
                  : '~ 2 Hours';
                const imageUrl = service.imageUrl || getPujaImageUrl(service, idx);
                const tag =
                  idx === 0
                    ? { label: 'Bestseller', icon: 'fire', type: 'bestseller' }
                    : idx === 1
                    ? { label: 'Trending', icon: 'star', type: 'trending' }
                    : { label: 'Recommended', icon: 'thumb-up', type: 'recommended' };

                return (
                  <TouchableOpacity
                    key={service.id}
                    style={styles.popularCard}
                    onPress={() =>
                      navigation.navigate('PujasTab', {
                        screen: 'PujaDetail',
                        params: { serviceId: service.id },
                      })
                    }
                    activeOpacity={0.88}
                  >
                    <View style={styles.popularImageContainer}>
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.popularImage}
                        resizeMode="cover"
                      />
                      <View
                        style={[
                          styles.popularTagPill,
                          tag.type === 'bestseller' && styles.tagBestseller,
                          tag.type === 'trending' && styles.tagTrending,
                          tag.type === 'recommended' && styles.tagRecommended,
                        ]}
                      >
                        <Icon
                          family="material-community"
                          name={tag.icon}
                          size={11}
                          color={
                            tag.type === 'bestseller'
                              ? '#B3261E'
                              : tag.type === 'trending'
                              ? '#B4731A'
                              : '#7A5E35'
                          }
                        />
                        <Text
                          style={[
                            styles.popularTagText,
                            tag.type === 'bestseller' && styles.textBestseller,
                            tag.type === 'trending' && styles.textTrending,
                            tag.type === 'recommended' && styles.textRecommended,
                          ]}
                        >
                          {tag.label}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.popularInfo}>
                      <Text style={styles.popularTitle} numberOfLines={1}>
                        {title}
                      </Text>
                      <Text style={styles.popularDesc} numberOfLines={1}>
                        {subtitle}
                      </Text>
                      <View style={styles.popularMetaRow}>
                        <View style={styles.metaItem}>
                          <Icon
                            family="material-community"
                            name="clock-outline"
                            size={13}
                            color="#786F66"
                          />
                          <Text style={styles.metaText}>{duration}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Icon
                            family="material-community"
                            name="account-outline"
                            size={13}
                            color="#786F66"
                          />
                          <Text style={styles.metaText}>
                            {idx === 1 ? '2 Pandits' : '1 Pandit'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.popularBottomRow}>
                        <Text style={styles.popularPriceText}>
                          From{' '}
                          <Text style={styles.popularPriceBold}>₹{price}</Text>
                        </Text>
                        <View style={styles.chevronButton}>
                          <Icon
                            family="material"
                            name="chevron-right"
                            size={18}
                            color="#A89481"
                          />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Icon
                family="material-community"
                name="book-open-page-variant"
                size={32}
                color={colors.textMuted}
              />
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
            </View>
          )}
        </View>
      </ScrollView>
    </CommonAppBackgroundScreen>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  headerIconButton: {
    padding: 6,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandOmLogo: {
    width: 38,
    height: 38,
  },
  brandTextCol: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#7A6E63',
    fontWeight: '500',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notificationWrap: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 1,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#C5221F',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 36,
  },
  carouselContainer: {
    marginBottom: 16,
  },
  heroCard: {
    width: HERO_CARD_WIDTH,
    height: 195,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#2A0E14',
  },
  heroCardImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  heroGradientOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(28, 12, 10, 0.72)',
    paddingHorizontal: 18,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  heroLeftCol: {
    maxWidth: HERO_CARD_WIDTH * 0.65,
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: typography.fontFamilySerif,
    lineHeight: 25,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 11,
    color: '#F6E5D3',
    lineHeight: 15,
    marginBottom: 6,
  },
  heroLotusDivider: {
    width: 80,
    height: 14,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  heroCtaWrap: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroCtaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  heroCtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  carouselPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1C7BA',
  },
  paginationDotActive: {
    width: 18,
    backgroundColor: '#7E1528',
    borderRadius: 4,
  },
  occasionSection: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2B1419',
    fontFamily: typography.fontFamilySerif,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7E1528',
  },
  occasionsScroll: {
    gap: 10,
    paddingRight: 4,
  },
  occasionSkeletonCard: {
    width: 108,
    height: 128,
    borderRadius: 14,
    overflow: 'hidden',
  },
  occasionCard: {
    width: 108,
    height: 128,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E1513',
  },
  occasionImage: {
    width: '100%',
    height: '100%',
  },
  occasionGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  occasionCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 14,
  },
  activeBookingCard: {
    backgroundColor: '#FFFBF5',
    borderWidth: 1,
    borderColor: '#EFE4D6',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  activeBookingTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  bookingServiceName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2B1419',
    marginBottom: 4,
  },
  bookingCodeText: {
    fontSize: 12,
    color: '#736B63',
  },
  codeBold: {
    fontWeight: '800',
    color: '#7E1528',
  },
  guidanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBF5',
    borderWidth: 1,
    borderColor: '#EFE4D6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 14,
    gap: 10,
  },
  guidanceLotusBadge: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#FDF2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidanceTextCol: {
    flex: 1,
  },
  guidanceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2B1419',
    marginBottom: 2,
  },
  guidanceSubtitle: {
    fontSize: 11,
    color: '#736B63',
    lineHeight: 15,
  },
  guidanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#7E1528',
    backgroundColor: '#FFFFFF',
  },
  guidanceBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7E1528',
  },
  auspiciousCard: {
    backgroundColor: '#FFFBF5',
    borderWidth: 1,
    borderColor: '#EFE4D6',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  auspiciousHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  auspiciousHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  auspiciousHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B5E38',
  },
  viewCalendarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7E1528',
  },
  auspiciousRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  auspiciousItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateBlock: {
    alignItems: 'center',
    minWidth: 32,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '700',
    color: '#786F66',
    marginTop: 2,
  },
  dateInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#241F1A',
  },
  eventSubtitle: {
    fontSize: 11,
    color: '#736B63',
    lineHeight: 14,
  },
  auspiciousDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E6DACD',
    marginHorizontal: 10,
  },
  quickServicesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 18,
  },
  quickServiceCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  quickServiceIconWrap: {
    marginBottom: 6,
  },
  quickServiceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#241F1A',
    textAlign: 'center',
  },
  popularSection: {
    marginBottom: 16,
  },
  skeletonList: {
    gap: 12,
  },
  popularList: {
    gap: 10,
  },
  popularCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE6DC',
    borderRadius: 16,
    padding: 10,
    elevation: 1,
    shadowColor: '#3A1505',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    gap: 12,
  },
  popularImageContainer: {
    width: 116,
    height: 88,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#2A1810',
  },
  popularImage: {
    width: '100%',
    height: '100%',
  },
  popularTagPill: {
    position: 'absolute',
    top: 5,
    left: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagBestseller: {
    backgroundColor: '#FFE8E8',
  },
  tagTrending: {
    backgroundColor: '#FFF2D6',
  },
  tagRecommended: {
    backgroundColor: '#F5EFE6',
  },
  popularTagText: {
    fontSize: 9,
    fontWeight: '700',
  },
  textBestseller: {
    color: '#B3261E',
  },
  textTrending: {
    color: '#B4731A',
  },
  textRecommended: {
    color: '#7A5E35',
  },
  popularInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  popularTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#241F1A',
    marginBottom: 2,
  },
  popularDesc: {
    fontSize: 11,
    color: '#736B63',
    marginBottom: 4,
  },
  popularMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#786F66',
  },
  popularBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  popularPriceText: {
    fontSize: 11,
    color: '#736B63',
  },
  popularPriceBold: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7E1528',
  },
  chevronButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F9F4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE6DC',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#241F1A',
    marginTop: 8,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#736B63',
    textAlign: 'center',
    marginBottom: 14,
  },
  emptyBtn: {
    backgroundColor: '#7E1528',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
