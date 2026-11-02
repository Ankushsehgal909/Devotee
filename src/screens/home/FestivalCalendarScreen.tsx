import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { siteImages } from '../../constants/images';

interface FestivalItem {
  id: string;
  name: string;
  hindiName: string;
  date: string;
  tithi: string;
  month: string;
  fastingRule: string;
  significance: string;
  recommendedPuja: string;
  bannerImage: string;
}

const HINDU_FESTIVALS: FestivalItem[] = [
  {
    id: 'maha-shivratri',
    name: 'Maha Shivratri',
    hindiName: 'महाशिवरात्रि',
    date: 'March 2026',
    tithi: 'Phalguna Krishna Chaturdashi',
    month: 'Phalguna',
    fastingRule: 'Nirjala / Phalahar Vrat throughout Nishita Kaal',
    significance:
      'The cosmic wedding of Lord Shiva and Mata Parvati, celebrated with 4-prahar Maha Rudrabhishek and Bilva Patra arpan.',
    recommendedPuja: 'Maha Rudrabhishek with 11 Dravyas',
    bannerImage: siteImages.trendingPujaRudrabhishek,
  },
  {
    id: 'chaitra-navratri',
    name: 'Chaitra Navratri & Ram Navami',
    hindiName: 'चैत्र नवरात्रि एवं रामनवमी',
    date: 'April 2026',
    tithi: 'Chaitra Shukla Pratipada to Navami',
    month: 'Chaitra',
    fastingRule: '9-day Satvik Vrat, Akhand Jyot & Kanya Pujan',
    significance:
      'Sacred 9 nights honoring Navadurga culminating with the Maryada Purushottam Shri Ram Janmotsav.',
    recommendedPuja: 'Durga Saptashati Chandi Paath & Havan',
    bannerImage: siteImages.homeSlide1,
  },
  {
    id: 'hanuman-jayanti',
    name: 'Shri Hanuman Jayanti',
    hindiName: 'श्री हनुमान जयंती',
    date: 'April 2026',
    tithi: 'Chaitra Purnima',
    month: 'Chaitra',
    fastingRule: 'Sindoor Arpan, Sundarkand Paath and Brahmacharya Vrat',
    significance:
      'Celebration of the birth of Sankat Mochan Mahabali Hanuman. Bestows fearlessness, vitality, and eliminates planetary afflictions.',
    recommendedPuja: 'Akhand Sundarkand & 108 Hanuman Chalisa',
    bannerImage: siteImages.homeSlide3,
  },
  {
    id: 'guru-purnima',
    name: 'Guru Purnima (Vyasa Purnima)',
    hindiName: 'गुरु पूर्णिमा',
    date: 'July 2026',
    tithi: 'Ashadha Purnima',
    month: 'Ashadha',
    fastingRule: 'Guru Paduka Pujan, Satvik Ahara & Shastric Study',
    significance:
      'Honoring Maharishi Veda Vyasa and all spiritual preceptors of Sanatan Dharma who guide devotees towards Moksha.',
    recommendedPuja: 'Guru Paduka Pujan & Veda Parayanam',
    bannerImage: siteImages.homeAssetsVerticalsGurukulAcharyas,
  },
  {
    id: 'janmashtami',
    name: 'Shri Krishna Janmashtami',
    hindiName: 'श्री कृष्ण जन्माष्टमी',
    date: 'August 2026',
    tithi: 'Bhadrapada Krishna Ashtami (Rohini Nakshatra)',
    month: 'Bhadrapada',
    fastingRule: 'Nirjala Vrat till Midnight (Nishita Kaal) Janma Aarti',
    significance:
      'The divine advent of Bhagavan Shri Krishna in Mathura to protect Dharma and establish cosmic righteousness.',
    recommendedPuja: 'Laddu Gopal Panchamrit Snan & Vishnu Sahasranama',
    bannerImage: siteImages.homeSlide2,
  },
  {
    id: 'sharad-navratri',
    name: 'Sharad Navratri & Vijayadashami',
    hindiName: 'शारदीय नवरात्रि एवं विजयदशमी',
    date: 'October 2026',
    tithi: 'Ashwin Shukla Pratipada to Dashami',
    month: 'Ashwin',
    fastingRule: 'Navaratri Kalash Sthapana, Ghatasthapana & Havana',
    significance:
      'Triumph of Mahishasuramardini Durga over cosmic ignorance and Shri Rama over Ravana on Vijayadashami.',
    recommendedPuja: 'Maha Navami Havan & Shata Chandi Yagya',
    bannerImage: siteImages.homeSlide1,
  },
  {
    id: 'diwali',
    name: 'Deepavali & Lakshmi Pujan',
    hindiName: 'दीपावली एवं महालक्ष्मी पूजन',
    date: 'November 2026',
    tithi: 'Kartika Amavasya (Pradosh Kaal)',
    month: 'Kartika',
    fastingRule: 'Pradosh Kaal Fasting till Mahalakshmi Aradhana',
    significance:
      'The festival of lights welcoming Mahalakshmi, Ganesha and Kuber into homes for wealth, enlightenment, and health.',
    recommendedPuja: 'Shri Suktam & Kanakadhara Mahalakshmi Havan',
    bannerImage: siteImages.trendingPujaLaxmiKuber,
  },
];

export const FestivalCalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Countdown timer for next major festival (Maha Shivratri Rudra Mahotsav)
  const targetDate = new Date('2026-11-15T00:00:00').getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 6,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const renderFestival = ({ item }: { item: FestivalItem }) => {
    return (
      <Card style={styles.festivalCard}>
        <View style={styles.bannerContainer}>
          <Image source={{ uri: item.bannerImage }} style={styles.bannerImg} />
          <View style={styles.dateTag}>
            <Icon family="material" name="event" size={12} color="#FFFFFF" />
            <Text style={styles.dateTagText}>{item.date}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.festivalName}>{item.name}</Text>
              <Text style={styles.hindiName}>{item.hindiName}</Text>
            </View>
            <Badge label={item.month} variant="sacred" />
          </View>

          <View style={styles.tithiRow}>
            <Icon family="material-community" name="moon-waning-crescent" size={16} color={colors.primary} />
            <Text style={styles.tithiText}>Shubh Tithi: {item.tithi}</Text>
          </View>

          <Text style={styles.significanceText}>{item.significance}</Text>

          <View style={styles.vratBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon family="material-community" name="food-apple" size={14} color={colors.goldAccent} />
              <Text style={styles.vratTitle}>Vrat & Fasting Rules:</Text>
            </View>
            <Text style={styles.vratText}>{item.fastingRule}</Text>
          </View>

          <View style={styles.footerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pujaLabel}>Prescribed Shastric Vidhi:</Text>
              <Text style={styles.pujaName}>{item.recommendedPuja}</Text>
            </View>
            <TouchableOpacity
              style={styles.bookPujaBtn}
              onPress={() => navigation.navigate('PujasTab', { screen: 'PujaCatalog' })}
            >
              <Icon family="material-community" name="fire" size={16} color="#FFFFFF" />
              <Text style={styles.bookPujaText}>Book Puja</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Hindu Festival Calendar" />

      <FlatList
        data={HINDU_FESTIVALS}
        keyExtractor={(item) => item.id}
        renderItem={renderFestival}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Live Upcoming Mahotsav Countdown */}
            <Card style={styles.countdownCard}>
              <View style={styles.countdownHeader}>
                <Badge label="UPCOMING MAHOTSAV" variant="sacred" />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon family="material" name="local-fire-department" size={16} color={colors.goldAccent} />
                  <Text style={styles.countdownMahotsavName}>Maha Shivratri</Text>
                </View>
              </View>

              <View style={styles.timerGrid}>
                <View style={styles.timerCell}>
                  <Text style={styles.timerVal}>{timeLeft.days}</Text>
                  <Text style={styles.timerLabel}>Days</Text>
                </View>
                <Text style={styles.timerSeparator}>:</Text>
                <View style={styles.timerCell}>
                  <Text style={styles.timerVal}>{String(timeLeft.hours).padStart(2, '0')}</Text>
                  <Text style={styles.timerLabel}>Hours</Text>
                </View>
                <Text style={styles.timerSeparator}>:</Text>
                <View style={styles.timerCell}>
                  <Text style={styles.timerVal}>{String(timeLeft.minutes).padStart(2, '0')}</Text>
                  <Text style={styles.timerLabel}>Mins</Text>
                </View>
                <Text style={styles.timerSeparator}>:</Text>
                <View style={styles.timerCell}>
                  <Text style={styles.timerVal}>{String(timeLeft.seconds).padStart(2, '0')}</Text>
                  <Text style={styles.timerLabel}>Secs</Text>
                </View>
              </View>

              <View style={styles.offerBanner}>
                <Icon family="material" name="local-offer" size={16} color={colors.primary} />
                <Text style={styles.offerText}>
                  Use code <Text style={{ fontWeight: '800' }}>SHIVA15</Text> for 15% off all festival pujas & kits
                </Text>
              </View>
            </Card>

            <Card variant="warm" style={styles.headerBanner}>
              <Text style={styles.headerTitle}>Sanatan Parva & Shubh Tithis</Text>
              <Text style={styles.headerSubtitle}>
                Explore upcoming Vedic festivals, calculate Shubh Muhurats, and book authentic temple ceremonies conducted by certified Gurukul Acharyas.
              </Text>
            </Card>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSand,
  },
  listContent: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  countdownCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.goldAccent,
  },
  countdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  countdownMahotsavName: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  timerGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: spacing.xs,
  },
  timerCell: {
    backgroundColor: colors.bgCream,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    borderRadius: borderRadius.md,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    minWidth: 54,
  },
  timerVal: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '800',
  },
  timerLabel: {
    ...typography.captionSmall,
    fontSize: 9,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  timerSeparator: {
    ...typography.h3,
    color: colors.goldAccent,
    fontWeight: '700',
  },
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSand,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    marginTop: spacing.sm,
    gap: 6,
  },
  offerText: {
    ...typography.captionSmall,
    color: colors.primaryDark,
  },
  headerBanner: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  headerTitle: {
    ...typography.h4,
    color: colors.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  festivalCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  bannerContainer: {
    position: 'relative',
    height: 140,
    width: '100%',
    backgroundColor: colors.bgCream,
  },
  bannerImg: {
    width: '100%',
    height: '100%',
  },
  dateTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(180, 83, 9, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  dateTagText: {
    ...typography.captionSmall,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
  },
  cardContent: {
    padding: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  festivalName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  hindiName: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  tithiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  tithiText: {
    ...typography.captionSmall,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  significanceText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  vratBox: {
    backgroundColor: colors.bgCream,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  vratTitle: {
    ...typography.captionSmall,
    fontWeight: '700',
    color: colors.primary,
  },
  vratText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderWarm,
    paddingTop: spacing.sm,
  },
  pujaLabel: {
    ...typography.captionSmall,
    color: colors.textMuted,
  },
  pujaName: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bookPujaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.md,
  },
  bookPujaText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
