import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Share,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon } from '../../components/common/Icon';
import { CommonAppBackgroundScreen } from '../../components/common/CommonAppBackgroundScreen';
import { LinearGradient } from '../../components/common/LinearGradient';
import { localImages, siteImages } from '../../constants/images';

export interface FestivalItem {
  id: string;
  name: string;
  hindiName: string;
  date: string;
  tithi: string;
  month: string;
  category: 'major' | 'vrat' | 'jayanti' | 'purnima';
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
    date: '15 Feb 2026',
    tithi: 'Phalguna Krishna Chaturdashi',
    month: 'Phalguna',
    category: 'major',
    fastingRule: 'Nirjala or Phalahar Vrat through Nishita Kaal with 4-prahar puja.',
    significance:
      'The cosmic wedding of Lord Shiva and Mata Parvati. Devotees perform continuous Bilva Patra and Panchamrit Abhishek to dissolve karmic bonds.',
    recommendedPuja: 'Maha Rudrabhishek with 11 Sacred Dravyas',
    bannerImage: siteImages.trendingPujaRudrabhishek,
  },
  {
    id: 'holi-holika',
    name: 'Holika Dahan & Holi',
    hindiName: 'होलिका दहन एवं होली',
    date: '3 Mar 2026',
    tithi: 'Phalguna Purnima',
    month: 'Phalguna',
    category: 'major',
    fastingRule: 'Evening Satvik Ahara after Holika Agni Pujan and offering barley spikes.',
    significance:
      'Symbolizes the triumph of Bhakti (Bhakt Prahlada) over evil and the celebration of divine love in Braj with Radha-Krishna.',
    recommendedPuja: 'Narasimha Kavach Havan & Radha Krishna Archana',
    bannerImage: siteImages.homeSlide3,
  },
  {
    id: 'chaitra-navratri',
    name: 'Chaitra Navratri & Ram Navami',
    hindiName: 'चैत्र नवरात्रि एवं श्रीरामनवमी',
    date: '19 Mar - 27 Mar 2026',
    tithi: 'Chaitra Shukla Pratipada to Navami',
    month: 'Chaitra',
    category: 'major',
    fastingRule: '9-day Satvik Vrat, Akhand Deepam, Kanya Pujan on Ashtami/Navami.',
    significance:
      'Honors the 9 cosmic forms of Maa Durga and marks the divine advent of Maryada Purushottam Bhagavan Shri Ram in Ayodhya.',
    recommendedPuja: 'Durga Saptashati Chandi Paath & Ramcharitmanas Paath',
    bannerImage: siteImages.homeSlide1,
  },
  {
    id: 'hanuman-jayanti',
    name: 'Shri Hanuman Jayanti',
    hindiName: 'श्री हनुमान जन्मोत्सव',
    date: '2 Apr 2026',
    tithi: 'Chaitra Purnima',
    month: 'Chaitra',
    category: 'jayanti',
    fastingRule: 'Sindoor and Jasmine oil arpan, Brahmacharya vrat and Phalahar.',
    significance:
      'Celebrates the appearance of Mahabali Hanuman, supreme devotee of Shri Rama. Eliminates fears, health afflictions, and Shani dosha.',
    recommendedPuja: 'Akhand Sundarkand & 108 Hanuman Chalisa Samput Paath',
    bannerImage: siteImages.homeAssetsVerticalsTeerthEpujas,
  },
  {
    id: 'akshaya-tritiya',
    name: 'Akshaya Tritiya (Akha Teej)',
    hindiName: 'अक्षय तृतीया',
    date: '19 Apr 2026',
    tithi: 'Vaishakha Shukla Tritiya',
    month: 'Vaishakha',
    category: 'purnima',
    fastingRule: 'Ganga Snan, Annadaan, Gold/Dravya Daan with Satvik fasting.',
    significance:
      'The day of imperishable merit where noble deeds and japa yield eternal results. Commemorates the descent of Maa Ganga and birth of Parashurama.',
    recommendedPuja: 'Kanakadhara Mahalakshmi & Kuber Dhan Varsha Yagya',
    bannerImage: siteImages.trendingPujaLaxmiKuber,
  },
  {
    id: 'guru-purnima',
    name: 'Guru Purnima (Vyasa Purnima)',
    hindiName: 'गुरु पूर्णिमा',
    date: '28 Jul 2026',
    tithi: 'Ashadha Purnima',
    month: 'Ashadha',
    category: 'purnima',
    fastingRule: 'Guru Paduka Pujan, silence (Maun Vrat) during morning hours, Satvik fruit diet.',
    significance:
      'Dedicated to Maharishi Veda Vyasa and all spiritual preceptors of Sanatan Dharma who guide devotees from darkness to enlightenment.',
    recommendedPuja: 'Guru Paduka Pujan & Veda Parayanam',
    bannerImage: siteImages.homeAssetsVerticalsGurukulAcharyas,
  },
  {
    id: 'nag-panchami',
    name: 'Nag Panchami',
    hindiName: 'नाग पंचमी',
    date: '17 Aug 2026',
    tithi: 'Shravana Shukla Panchami',
    month: 'Shravana',
    category: 'vrat',
    fastingRule: 'Kheer and milk offerings, avoidance of fried food and plowing earth.',
    significance:
      'Worship of the divine Serpent deities guarding Lord Vishnu and Lord Shiva. Relieves Kaal Sarp Dosha and snake phobias.',
    recommendedPuja: 'Maha Kaal Sarp Shanti & Ashta Nag Stotra Havan',
    bannerImage: siteImages.homeAssetsVerticalsMahaAnushthan,
  },
  {
    id: 'raksha-bandhan',
    name: 'Raksha Bandhan & Shravani Purnima',
    hindiName: 'रक्षाबंधन एवं श्रावणी उपाकर्म',
    date: '28 Aug 2026',
    tithi: 'Shravana Purnima',
    month: 'Shravana',
    category: 'purnima',
    fastingRule: 'Fasting until sacred Rakhi tying and Yajnopavita Dharanam ceremony.',
    significance:
      'Celebration of sacred sibling protection and Vedic rejuvenation through Upakarma Gayatri Japa by Gurukul Acharyas.',
    recommendedPuja: 'Gayatri Mahayagya & Raksha Sutra Abhimantran',
    bannerImage: siteImages.homeStore1,
  },
  {
    id: 'janmashtami',
    name: 'Shri Krishna Janmashtami',
    hindiName: 'श्रीकृष्ण जन्माष्टमी',
    date: '4 Sep 2026',
    tithi: 'Bhadrapada Krishna Ashtami',
    month: 'Bhadrapada',
    category: 'major',
    fastingRule: 'Nirjala Vrat until Midnight (Nishita Kaal) divine birth aarti.',
    significance:
      'The cosmic advent of Bhagavan Shri Krishna to restore Dharma, bestowing supreme peace, family harmony, and devotion.',
    recommendedPuja: 'Laddu Gopal Panchamrit Mahasnan & Vishnu Sahasranama',
    bannerImage: siteImages.homeSlide2,
  },
  {
    id: 'ganesh-chaturthi',
    name: 'Ganesh Chaturthi (Vinayaka Chavithi)',
    hindiName: 'गणेश चतुर्थी',
    date: '14 Sep 2026',
    tithi: 'Bhadrapada Shukla Chaturthi',
    month: 'Bhadrapada',
    category: 'major',
    fastingRule: 'Modak and 21 Durva grass arpan, Madhyahna Kaal Sthapana Vrat.',
    significance:
      'Welcoming Vighnaharta Lord Ganesha into homes and sanctums to eliminate all spiritual and material hurdles.',
    recommendedPuja: 'Siddhi Vinayaka Maha Ganapati Havan with 1008 Modaks',
    bannerImage: siteImages.homeStore2,
  },
  {
    id: 'sharad-navratri',
    name: 'Sharad Navratri & Vijayadashami',
    hindiName: 'शारदीय नवरात्रि एवं विजयदशमी',
    date: '11 Oct - 20 Oct 2026',
    tithi: 'Ashwin Shukla Pratipada to Dashami',
    month: 'Ashwin',
    category: 'major',
    fastingRule: 'Navaratri Kalash Sthapana, daily Durga Saptashati paath, Satvik diet.',
    significance:
      'Celebrates the victory of Mahishasuramardini Durga over demon forces and Bhagavan Shri Rama over Ravana on Dussehra.',
    recommendedPuja: 'Shata Chandi Mahayagya & Vijayadashami Shastra Pujan',
    bannerImage: siteImages.homeSlide1,
  },
  {
    id: 'karwa-chauth',
    name: 'Karwa Chauth (Karaka Chaturthi)',
    hindiName: 'करवा चौथ',
    date: '28 Oct 2026',
    tithi: 'Kartika Krishna Chaturthi',
    month: 'Kartika',
    category: 'vrat',
    fastingRule: 'Strict Nirjala Vrat from sunrise until evening Moon rise & Arghya.',
    significance:
      'Observed by devoted wives for the longevity, prosperity, and divine protection of their husbands, honoring Maa Gauri and Shiva.',
    recommendedPuja: 'Gauri Shankar Vivah Kalyanam & Karwa Pujan',
    bannerImage: siteImages.homeStore3,
  },
  {
    id: 'dhanteras-diwali',
    name: 'Dhanteras & Deepavali (Maha Lakshmi Pujan)',
    hindiName: 'धनतेरस एवं दीपावली',
    date: '8 Nov - 10 Nov 2026',
    tithi: 'Kartika Krishna Trayodashi to Amavasya',
    month: 'Kartika',
    category: 'major',
    fastingRule: 'Pradosh Kaal fasting till Deepam lighting and Lakshmi-Ganesh Aradhana.',
    significance:
      'Festival of divine lights dispelling ignorance, invoking Goddess Mahalakshmi, Ganesha and Kuber for eternal abundance.',
    recommendedPuja: 'Ashta Lakshmi Vaibhav Havan & Shri Suktam Samput Paath',
    bannerImage: siteImages.trendingPujaLaxmiKuber,
  },
  {
    id: 'devutthana-ekadashi',
    name: 'Devutthana Ekadashi & Tulsi Vivah',
    hindiName: 'देवउठनी एकादशी एवं तुलसी विवाह',
    date: '20 Nov 2026',
    tithi: 'Kartika Shukla Ekadashi',
    month: 'Kartika',
    category: 'vrat',
    fastingRule: 'Fasting on fruits/milk, ceremonial waking of Lord Vishnu from yoga-nidra.',
    significance:
      'Marks the awakening of Bhagavan Vishnu and the start of auspicious wedding muhurats with the sacred Tulsi-Shaligram Vivah.',
    recommendedPuja: 'Shaligram Tulsi Vivah Vidhi & Vishnu Sahasranama Yagya',
    bannerImage: siteImages.homeAssetsVerticalsHomePujas,
  },
  {
    id: 'makar-sankranti',
    name: 'Makar Sankranti & Pongal',
    hindiName: 'मकर संक्रांति',
    date: '14 Jan 2027',
    tithi: 'Surya Uttarayan Makara Sankranti',
    month: 'Magha',
    category: 'major',
    fastingRule: 'Pre-noon snan, Til-Gud daan and Aditya Hridaya Stotra recitation.',
    significance:
      'Surya Bhagavan begins his northward Uttarayan journey, bestowing health, vitality, illumination, and harvest prosperity.',
    recommendedPuja: 'Surya Graha Shanti Havan & Aditya Hridaya Archana',
    bannerImage: siteImages.homeStore4,
  },
  {
    id: 'vasant-panchami',
    name: 'Vasant Panchami (Saraswati Pujan)',
    hindiName: 'वसंत पंचमी',
    date: '23 Jan 2027',
    tithi: 'Magha Shukla Panchami',
    month: 'Magha',
    category: 'purnima',
    fastingRule: 'Wearing yellow attire, offerings of yellow flowers, kheer, and pen/book pujan.',
    significance:
      'Appearance day of Goddess Saraswati, bestowing wisdom, mastery over arts, speech, and academic excellence.',
    recommendedPuja: 'Maha Saraswati Medha Suktam Havan & Vidya Aarambh Pujan',
    bannerImage: siteImages.homeSlide3,
  },
];

const FILTER_TABS = [
  { id: 'all', label: 'All Festivals', icon: 'brightness-5' },
  { id: 'major', label: 'Major Parvas', icon: 'flare' },
  { id: 'vrat', label: 'Vrats & Fasting', icon: 'spa' },
  { id: 'jayanti', label: 'Divine Jayantis', icon: 'stars' },
  { id: 'purnima', label: 'Purnima & Holy Days', icon: 'brightness-7' },
];

export const FestivalCalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [reminders, setReminders] = useState<Record<string, boolean>>({});

  // Countdown target for upcoming major festival (Maha Shivratri)
  const targetDate = useMemo(() => new Date('2026-11-25T00:00:00').getTime(), []);
  const [timeLeft, setTimeLeft] = useState({
    days: 4,
    hours: 12,
    minutes: 35,
    seconds: 40,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = targetDate - now;
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  // Filter festivals based on search and category tab
  const filteredFestivals = useMemo(() => {
    return HINDU_FESTIVALS.filter((fest) => {
      const matchesTab =
        activeTab === 'all' || fest.category === activeTab;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        fest.name.toLowerCase().includes(q) ||
        fest.hindiName.toLowerCase().includes(q) ||
        fest.tithi.toLowerCase().includes(q) ||
        fest.month.toLowerCase().includes(q) ||
        fest.significance.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const handleToggleReminder = (festival: FestivalItem) => {
    const current = !!reminders[festival.id];
    setReminders((prev) => ({ ...prev, [festival.id]: !current }));
    Alert.alert(
      !current ? '॥ शुभ संकल्प रिमाइंडर सक्रिय ॥' : 'Reminder Removed',
      !current
        ? `You will receive shastric muhurat and vrat reminders for ${festival.name} (${festival.hindiName}).`
        : `Reminder for ${festival.name} has been turned off.`,
    );
  };

  const handleShareFestival = async (festival: FestivalItem) => {
    try {
      await Share.share({
        title: `${festival.name} - Shastric Vedic Calendar`,
        message: `॥ ${festival.hindiName} ॥\nDate: ${festival.date}\nShubh Tithi: ${festival.tithi}\n\nVrat & Fasting Vidhi: ${festival.fastingRule}\n\nPrescribed Puja: ${festival.recommendedPuja}\n\nBook authentic Gurukul Vedic Pujas on Devotee Sanctuary app.`,
      });
    } catch {
      // ignore
    }
  };

  const renderFestivalCard = ({ item }: { item: FestivalItem }) => {
    const isReminderOn = !!reminders[item.id];

    return (
      <View style={styles.cardWrapper}>
        {/* Banner with Sacred Badges */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: item.bannerImage }}
            style={styles.bannerImg}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
            style={styles.bannerGradient}
          />

          {/* Top Date & Month Chips */}
          <View style={styles.bannerTopRow}>
            <View style={styles.dateChip}>
              <Icon family="material" name="event" size={13} color="#FFFFFF" />
              <Text style={styles.dateChipText}>{item.date}</Text>
            </View>
            <View style={styles.monthChip}>
              <Text style={styles.monthChipText}>{item.month} Maas</Text>
            </View>
          </View>

          {/* Bottom Title on Banner Overlay */}
          <View style={styles.bannerBottomRow}>
            <Text style={styles.bannerHindiTitle}>{item.hindiName}</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.cardContent}>
          {/* Title Row */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.festivalName}>{item.name}</Text>
              <View style={styles.tithiRow}>
                <Icon
                  family="material-community"
                  name="moon-waning-crescent"
                  size={15}
                  color={colors.primary}
                />
                <Text style={styles.tithiText}>Shubh Tithi: {item.tithi}</Text>
              </View>
            </View>

            {/* Quick Share & Reminder Buttons */}
            <View style={styles.actionIconsRow}>
              <TouchableOpacity
                onPress={() => handleToggleReminder(item)}
                style={[
                  styles.iconBtn,
                  isReminderOn && styles.iconBtnActive,
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon
                  family="material"
                  name={isReminderOn ? 'notifications-active' : 'notifications-none'}
                  size={18}
                  color={isReminderOn ? '#6B0E1E' : '#7A6E63'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleShareFestival(item)}
                style={styles.iconBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon family="material" name="share" size={18} color="#7A6E63" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Significance */}
          <Text style={styles.significanceText}>{item.significance}</Text>

          {/* Vrat & Fasting Rules Pill Box */}
          <View style={styles.vratBox}>
            <View style={styles.vratHeader}>
              <Icon
                family="material-community"
                name="food-apple"
                size={15}
                color="#B45309"
              />
              <Text style={styles.vratTitle}>Vrat & Shastric Fasting Rule</Text>
            </View>
            <Text style={styles.vratRuleText}>{item.fastingRule}</Text>
          </View>

          {/* Footer Vidhi Recommendation & Booking */}
          <View style={styles.footerRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.pujaLabel}>Prescribed Shastric Vidhi</Text>
              <Text style={styles.pujaName} numberOfLines={1}>
                {item.recommendedPuja}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.bookPujaBtn}
              onPress={() =>
                navigation.navigate('PujasTab', { screen: 'PujaCatalog' })
              }
            >
              <LinearGradient
                colors={['#8B1528', '#640E1D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bookPujaGradient}
              >
                <Icon
                  family="material-community"
                  name="fire"
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.bookPujaText}>Book Puja</Text>
                <Icon
                  family="material"
                  name="arrow-forward"
                  size={13}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <CommonAppBackgroundScreen
      safeAreaEdges={['top', 'left', 'right']}
      resizeMode="stretch"
    >
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon family="material" name="arrow-back" size={24} color="#6B0E1E" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Hindu Festival Calendar</Text>
          <Text style={styles.headerSubtitle}>
            Vikram Samvat 2083 • Sacred Tithis & Vrats
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsSearchOpen(!isSearchOpen)}
          style={styles.searchToggleBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon
            family="material"
            name={isSearchOpen ? 'close' : 'search'}
            size={22}
            color="#6B0E1E"
          />
        </TouchableOpacity>
      </View>

      {/* Expandable Search Bar */}
      {isSearchOpen && (
        <View style={styles.searchBarWrap}>
          <Icon family="material" name="search" size={18} color="#7A6E63" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search festival, tithi, deity or fasting rule..."
            placeholderTextColor="#9E948A"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon family="material" name="close" size={16} color="#7A6E63" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Category Filter Chips Bar */}
      <View style={styles.filterTabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_TABS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isSelected = activeTab === item.id;
            return (
              <TouchableOpacity
                onPress={() => setActiveTab(item.id)}
                style={[
                  styles.filterTab,
                  isSelected ? styles.filterTabActive : styles.filterTabInactive,
                ]}
                activeOpacity={0.75}
              >
                <Icon
                  family="material"
                  name={item.icon}
                  size={14}
                  color={isSelected ? '#FFFFFF' : '#6B0E1E'}
                />
                <Text
                  style={[
                    styles.filterTabText,
                    isSelected && styles.filterTabTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main List */}
      <FlatList
        data={filteredFestivals}
        keyExtractor={(item) => item.id}
        renderItem={renderFestivalCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerComponent}>
            {/* Today's Vedic Panchang Widget */}
            <View style={styles.panchangCard}>
              <View style={styles.panchangHeaderRow}>
                <View style={styles.panchangBadge}>
                  <Icon
                    family="material-community"
                    name="calendar-clock"
                    size={14}
                    color="#B45309"
                  />
                  <Text style={styles.panchangBadgeText}>TODAY'S SHUBH PANCHANG</Text>
                </View>
                <Text style={styles.panchangDate}>Kartika Shukla Paksha</Text>
              </View>

              <View style={styles.panchangGrid}>
                <View style={styles.panchangCol}>
                  <Text style={styles.panchangLabel}>Tithi</Text>
                  <Text style={styles.panchangVal}>Ekadashi (Devutthana)</Text>
                </View>
                <View style={styles.panchangDividerVertical} />
                <View style={styles.panchangCol}>
                  <Text style={styles.panchangLabel}>Nakshatra</Text>
                  <Text style={styles.panchangVal}>Revati / Uttarabhadra</Text>
                </View>
                <View style={styles.panchangDividerVertical} />
                <View style={styles.panchangCol}>
                  <Text style={styles.panchangLabel}>Abhijit Muhurat</Text>
                  <Text style={styles.panchangVal}>11:46 AM - 12:32 PM</Text>
                </View>
              </View>
            </View>

            {/* Live Upcoming Mahotsav Countdown Hero Banner */}
            <View style={styles.countdownCard}>
              <LinearGradient
                colors={['#FFFBF5', '#FFF3E3']}
                style={styles.countdownInner}
              >
                <View style={styles.countdownHeaderRow}>
                  <View style={styles.mahotsavBadge}>
                    <Icon
                      family="material"
                      name="local-fire-department"
                      size={14}
                      color="#B45309"
                    />
                    <Text style={styles.mahotsavBadgeText}>
                      UPCOMING MAHA PARVA
                    </Text>
                  </View>
                  <Text style={styles.countdownFestival}>Maha Shivratri</Text>
                </View>

                <Text style={styles.countdownSub}>
                  4-Prahar Nishita Kaal Rudrabhishek & Akhand Bilva Arpan
                </Text>

                {/* 4 Timer Digits Grid */}
                <View style={styles.timerGrid}>
                  <View style={styles.timerCell}>
                    <Text style={styles.timerVal}>{timeLeft.days}</Text>
                    <Text style={styles.timerLabel}>Days</Text>
                  </View>
                  <Text style={styles.timerSeparator}>:</Text>
                  <View style={styles.timerCell}>
                    <Text style={styles.timerVal}>
                      {String(timeLeft.hours).padStart(2, '0')}
                    </Text>
                    <Text style={styles.timerLabel}>Hours</Text>
                  </View>
                  <Text style={styles.timerSeparator}>:</Text>
                  <View style={styles.timerCell}>
                    <Text style={styles.timerVal}>
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </Text>
                    <Text style={styles.timerLabel}>Mins</Text>
                  </View>
                  <Text style={styles.timerSeparator}>:</Text>
                  <View style={styles.timerCell}>
                    <Text style={styles.timerVal}>
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </Text>
                    <Text style={styles.timerLabel}>Secs</Text>
                  </View>
                </View>

                {/* Offer Pill */}
                <View style={styles.offerBanner}>
                  <Icon
                    family="material"
                    name="local-offer"
                    size={15}
                    color="#6B0E1E"
                  />
                  <Text style={styles.offerText}>
                    Use promo <Text style={styles.boldPromo}>SHIVA15</Text> for
                    15% off temple Sankalp slots & samagri kits.
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Sacred Divider */}
            <Image
              source={localImages.divider}
              style={styles.sacredDivider}
              resizeMode="contain"
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon
              family="material-community"
              name="calendar-search"
              size={48}
              color="#A3988C"
            />
            <Text style={styles.emptyTitle}>No Festivals Found</Text>
            <Text style={styles.emptyDesc}>
              No matching festivals or vrats found for "{searchQuery}".
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setActiveTab('all');
              }}
              style={styles.clearSearchBtn}
            >
              <Text style={styles.clearSearchText}>View All Festivals</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </CommonAppBackgroundScreen>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 8,
    paddingBottom: 6,
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#7A6E63',
    fontWeight: '500',
    marginTop: 1,
  },
  searchToggleBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: spacing.screenPadding,
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: '#E8DFD5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#2A1F1D',
    paddingVertical: 0,
  },
  filterTabsContainer: {
    marginVertical: 6,
  },
  filterList: {
    paddingHorizontal: spacing.screenPadding,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterTabActive: {
    backgroundColor: '#6B0E1E',
    borderColor: '#6B0E1E',
  },
  filterTabInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8DFD5',
  },
  filterTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#6B0E1E',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 40,
  },
  headerComponent: {
    marginTop: 4,
    marginBottom: 8,
  },
  panchangCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE5D8',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  panchangHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  panchangBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  panchangBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.3,
  },
  panchangDate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
  },
  panchangGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F2',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  panchangCol: {
    flex: 1,
    alignItems: 'center',
  },
  panchangDividerVertical: {
    width: 1,
    height: 24,
    backgroundColor: '#E8DFD5',
  },
  panchangLabel: {
    fontSize: 10,
    color: '#8A7E73',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  panchangVal: {
    fontSize: 11.5,
    color: '#2A1F1D',
    fontWeight: '700',
    textAlign: 'center',
  },
  countdownCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#F3C978',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  countdownInner: {
    padding: 16,
  },
  countdownHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mahotsavBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  mahotsavBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.3,
  },
  countdownFestival: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
  },
  countdownSub: {
    fontSize: 11.5,
    color: '#6D5D50',
    marginBottom: 12,
  },
  timerGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  timerCell: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F1D299',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    minWidth: 58,
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  timerVal: {
    fontSize: 20,
    color: '#6B0E1E',
    fontWeight: '800',
    fontFamily: typography.fontFamilySerif,
  },
  timerLabel: {
    fontSize: 9,
    color: '#8A7E73',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginTop: 1,
  },
  timerSeparator: {
    fontSize: 18,
    color: '#B45309',
    fontWeight: '700',
  },
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#EADBC8',
    gap: 6,
  },
  offerText: {
    fontSize: 11,
    color: '#55483D',
    flex: 1,
  },
  boldPromo: {
    fontWeight: '800',
    color: '#6B0E1E',
  },
  sacredDivider: {
    width: 140,
    height: 18,
    alignSelf: 'center',
    marginVertical: 6,
    opacity: 0.85,
  },
  cardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  bannerContainer: {
    position: 'relative',
    height: 150,
    width: '100%',
    backgroundColor: '#FAF5EE',
  },
  bannerImg: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    ...StyleSheet.absoluteFill,
  },
  bannerTopRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 14, 30, 0.92)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 5,
  },
  dateChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  monthChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  monthChipText: {
    color: '#6B0E1E',
    fontSize: 11,
    fontWeight: '700',
  },
  bannerBottomRow: {
    position: 'absolute',
    bottom: 8,
    left: 14,
  },
  bannerHindiTitle: {
    fontSize: 18,
    color: '#FFFDF9',
    fontWeight: '700',
    fontFamily: typography.fontFamilySerif,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardContent: {
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  festivalName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#341118',
    fontFamily: typography.fontFamilySerif,
  },
  tithiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  tithiText: {
    fontSize: 12,
    color: '#6B0E1E',
    fontWeight: '600',
  },
  actionIconsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: '#FDECE7',
  },
  significanceText: {
    fontSize: 12.5,
    color: '#55483D',
    lineHeight: 18,
    marginBottom: 10,
  },
  vratBox: {
    backgroundColor: '#FFFBF5',
    borderWidth: 1,
    borderColor: '#F3E4D1',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  vratHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  vratTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  vratRuleText: {
    fontSize: 12,
    color: '#4A3B30',
    lineHeight: 16.5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0E7DD',
    paddingTop: 10,
  },
  pujaLabel: {
    fontSize: 10.5,
    color: '#8A7E73',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  pujaName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2A1F1D',
    marginTop: 2,
  },
  bookPujaBtn: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  bookPujaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
    gap: 4,
  },
  bookPujaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A3B30',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#8A7E73',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearSearchBtn: {
    backgroundColor: '#6B0E1E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  clearSearchText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
