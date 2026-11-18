import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Icon } from '../../components/common/Icon';
import { CommonAppBackgroundScreen } from '../../components/common/CommonAppBackgroundScreen';
import { Skeleton } from '../../components/common/Skeleton';
import { useProviders, PanditSearchResult } from '../../api/customer';
import { localImages, siteImages } from '../../constants/images';

const CITIES = [
  'All Cities',
  'Varanasi (Kashi)',
  'Haridwar',
  'Ujjain',
  'Prayagraj',
  'Delhi NCR',
];

export const PanditsDirectoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');

  const { data: providers, isLoading, refetch } = useProviders();

  const filtered = (providers || []).filter((p: PanditSearchResult) => {
    const matchesCity =
      selectedCity === 'All Cities' ||
      p.city.toLowerCase().includes(selectedCity.toLowerCase().split(' ')[0]);
    const matchesSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.shakha && p.shakha.toLowerCase().includes(search.toLowerCase())) ||
      (p.lineage && p.lineage.toLowerCase().includes(search.toLowerCase()));
    return matchesCity && matchesSearch;
  });

  const renderPanditCard = ({ item }: { item: PanditSearchResult }) => {
    const ratingVal = item.rating ? item.rating.toFixed(2) : '4.98';
    const shakhaText = item.shakha || item.lineage || 'Shukla Yajurveda Madhyandina Shakha';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PanditDetail', { panditId: item.id })}
        activeOpacity={0.88}
      >
        {/* Top Profile Section */}
        <View style={styles.cardTop}>
          {/* Avatar with Verified Floating Check Badge */}
          <View style={styles.avatarWrap}>
            <Image
              source={{
                uri: item.avatarUrl || siteImages.homeAssetsVerticalsGurukulAcharyas,
              }}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={styles.avatarCheckBadge}>
              <Icon family="material" name="check" size={11} color="#FFFFFF" />
            </View>
          </View>

          {/* Details Column */}
          <View style={styles.cardDetails}>
            {/* Verified Badge & Rating Row */}
            <View style={styles.badgeRatingRow}>
              <View style={styles.verifiedBadge}>
                <Icon
                  family="material-community"
                  name="check-circle"
                  size={12}
                  color="#16A34A"
                />
                <Text style={styles.verifiedBadgeText}>Verified Acharya</Text>
              </View>

              <View style={styles.ratingBox}>
                <Icon family="material" name="star" size={13} color="#D97706" />
                <Text style={styles.ratingVal}>{ratingVal}</Text>
              </View>
            </View>

            {/* Pandit Name */}
            <Text style={styles.panditName} numberOfLines={1}>
              {item.name}
            </Text>

            {/* Shakha / Lineage */}
            <Text style={styles.shakhaText} numberOfLines={1}>
              {shakhaText}
            </Text>

            {/* Meta Row: Location & Experience */}
            <View style={styles.metaRow}>
              <Icon
                family="material"
                name="location-on"
                size={13}
                color="#7E1528"
              />
              <Text style={styles.metaCityText}>{item.city}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Icon
                family="material"
                name="history-edu"
                size={13}
                color="#D97706"
              />
              <Text style={styles.metaExpText}>
                {item.experienceYears} yrs Vedic exp
              </Text>
            </View>
          </View>
        </View>

        {/* Bio Description */}
        <Text style={styles.bioText} numberOfLines={2}>
          {item.biography}
        </Text>

        {/* Bottom Languages & Book Puja CTA */}
        <View style={styles.cardFooter}>
          <View style={styles.langRow}>
            {(item.languages || ['Sanskrit', 'Hindi']).slice(0, 3).map((l, i) => (
              <View
                key={i}
                style={[styles.langPill, i === 0 && styles.primaryLangPill]}
              >
                {i === 0 && (
                  <Icon
                    family="material-community"
                    name="book-open-outline"
                    size={11}
                    color="#7E1528"
                  />
                )}
                <Text
                  style={[
                    styles.langText,
                    i === 0 && styles.primaryLangText,
                  ]}
                >
                  {l}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.bookCta}
            onPress={() => navigation.navigate('PujasTab')}
            activeOpacity={0.85}
          >
            <Text style={styles.bookCtaText}>Book Puja</Text>
            <Icon
              family="material"
              name="arrow-forward"
              size={13}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <CommonAppBackgroundScreen
      safeAreaEdges={['top', 'left', 'right']}
      resizeMode="stretch"
    >
      {/* Top Custom Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('HomeTab');
              }
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Icon
              family="material"
              name="arrow-back"
              size={22}
              color="#6B0E1E"
            />
          </TouchableOpacity>

          <View style={styles.titleColumn}>
            <Text style={styles.screenTitle}>Gurukul Acharyas & Pandits</Text>
            <Text style={styles.screenSubtitle}>
              Veda Murti Shastri Directory
            </Text>
          </View>
        </View>

        {/* Filter Sliders Icon Button */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {}}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Icon
            family="material-community"
            name="tune-variant"
            size={22}
            color="#6B0E1E"
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderPanditCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isLoading}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Search Input Bar */}
            <View style={styles.searchBar}>
              <Icon
                family="material"
                name="search"
                size={20}
                color="#7A6E63"
              />
              <TextInput
                placeholder="Search by Acharya name, Gotra, or Shakha..."
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
                placeholderTextColor="#9E948A"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Icon
                    family="material"
                    name="close"
                    size={18}
                    color="#7A6E63"
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* City Filter Chips */}
            <View style={styles.citiesWrap}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={CITIES}
                keyExtractor={item => item}
                contentContainerStyle={styles.citiesScroll}
                renderItem={({ item, index }) => {
                  const isSelected = selectedCity === item;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.cityChip,
                        isSelected && styles.cityChipActive,
                      ]}
                      onPress={() => setSelectedCity(item)}
                      activeOpacity={0.75}
                    >
                      {index === 0 && (
                        <Icon
                          family="material"
                          name="location-on"
                          size={13}
                          color={isSelected ? '#FFFFFF' : '#7E1528'}
                          style={{ marginRight: 2 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.cityChipText,
                          isSelected && styles.cityChipTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            {/* Verified Vedic Acharyas Hero Banner */}
            <View style={styles.heroBanner}>
              <View style={styles.bannerLeftCol}>
                <Text style={styles.bannerHeading}>
                  Verified Vedic Acharyas
                </Text>
                <Text style={styles.bannerDescription}>
                  Experienced, Traditional &{'\n'}Shastra-Parangat Purohits
                </Text>
                <Image
                  source={localImages.divider}
                  style={styles.bannerLotusDivider}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.bannerRightCol}>
                <Image
                  source={localImages.welcome2}
                  style={styles.bannerImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Loading Skeletons */}
            {isLoading && (
              <View style={styles.skeletonContainer}>
                {[1, 2, 3].map(k => (
                  <View key={k} style={styles.skeletonCard}>
                    <View style={styles.skeletonTop}>
                      <Skeleton width={68} height={68} borderRadius={34} />
                      <View style={{ flex: 1, gap: 6 }}>
                        <Skeleton width="50%" height={14} />
                        <Skeleton width="80%" height={16} />
                        <Skeleton width="60%" height={12} />
                      </View>
                    </View>
                    <Skeleton width="100%" height={12} style={{ marginTop: 10 }} />
                    <Skeleton width="85%" height={12} style={{ marginTop: 4 }} />
                  </View>
                ))}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Icon
                family="material-community"
                name="account-search"
                size={40}
                color={colors.textMuted}
              />
              <Text style={styles.emptyTitle}>No Acharyas Found</Text>
              <Text style={styles.emptySubtitle}>
                No Pandits match your selected filters. Try searching for other
                names, shakhas, or reset city.
              </Text>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setSearch('');
                  setSelectedCity('All Cities');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.resetBtnText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          ) : undefined
        }
      />
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
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  titleColumn: {
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
  },
  screenSubtitle: {
    fontSize: 11,
    color: '#7A6E63',
    fontWeight: '500',
    marginTop: 1,
  },
  filterButton: {
    padding: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  headerContainer: {
    marginBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    paddingHorizontal: 14,
    height: 44,
    marginTop: 6,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#241F1A',
    paddingVertical: 0,
  },
  citiesWrap: {
    marginVertical: 12,
  },
  citiesScroll: {
    gap: 8,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE4D6',
  },
  cityChipActive: {
    backgroundColor: '#7E1528',
    borderColor: '#7E1528',
  },
  cityChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#241F1A',
  },
  cityChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  heroBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFFBF3',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  bannerLeftCol: {
    flex: 1.3,
  },
  bannerHeading: {
    fontSize: 19,
    fontWeight: '800',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
    lineHeight: 23,
    marginBottom: 4,
  },
  bannerDescription: {
    fontSize: 11,
    color: '#665E56',
    lineHeight: 15,
    marginBottom: 6,
  },
  bannerLotusDivider: {
    width: 75,
    height: 14,
    alignSelf: 'flex-start',
  },
  bannerRightCol: {
    flex: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerImage: {
    width: 110,
    height: 85,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    padding: 14,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#3A1505',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarWrap: {
    position: 'relative',
    width: 68,
    height: 68,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FAF5EE',
  },
  avatarCheckBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  badgeRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF7EE',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#241F1A',
  },
  panditName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
    marginBottom: 1,
  },
  shakhaText: {
    fontSize: 11,
    color: '#686057',
    fontWeight: '500',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaCityText: {
    fontSize: 11,
    color: '#241F1A',
    fontWeight: '600',
  },
  metaDot: {
    color: '#A89481',
    marginHorizontal: 3,
    fontSize: 10,
  },
  metaExpText: {
    fontSize: 11,
    color: '#241F1A',
    fontWeight: '600',
  },
  bioText: {
    fontSize: 11,
    color: '#665E56',
    lineHeight: 16,
    marginVertical: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2EBE1',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F9F4EE',
    borderWidth: 1,
    borderColor: '#EFE4D6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  primaryLangPill: {
    backgroundColor: '#FDF1F0',
    borderColor: '#F6D9D7',
  },
  langText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#554E46',
  },
  primaryLangText: {
    color: '#7E1528',
  },
  bookCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7E1528',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  bookCtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skeletonContainer: {
    gap: 14,
    marginTop: 6,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    padding: 14,
  },
  skeletonTop: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    padding: 24,
    marginTop: 14,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#241F1A',
    marginTop: 8,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#736B63',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14,
  },
  resetBtn: {
    backgroundColor: '#7E1528',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
