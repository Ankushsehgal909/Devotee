import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Icon } from '../../components/common/Icon';
import { CommonAppBackgroundScreen } from '../../components/common/CommonAppBackgroundScreen';
import { PujaCardSkeleton } from '../../components/common/Skeleton';
import { useServices } from '../../api/services';
import { PujaService } from '../../types';
import { resolveLocalizedText } from '../../utils/localization';
import { getPujaImageUrl } from '../../constants/images';

const CATEGORIES = [
  { id: 'All', name: 'All' },
  {
    id: 'Prosperity & Vrat',
    name: 'Prosperity & Vrat',
    icon: 'spa-outline',
    family: 'material-community',
  },
  {
    id: 'Health & Long Life',
    name: 'Health & Long Life',
    icon: 'heart-outline',
    family: 'material-community',
  },
  {
    id: 'Vastu & Shanti',
    name: 'Vastu & Shanti',
    icon: 'home-outline',
    family: 'material-community',
  },
  {
    id: 'Dosha Shanti',
    name: 'Dosha Shanti',
    icon: 'dharmachakra',
    family: 'material-community',
  },
];

export const PujaCatalogScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Live API hook
  const { data: services, isLoading, refetch } = useServices();

  const filteredServices = useMemo(() => {
    if (!services) return [];
    return services.filter(service => {
      const title = resolveLocalizedText(service.title, '').toLowerCase();
      const desc = resolveLocalizedText(
        service.subtitle || service.description,
        '',
      ).toLowerCase();
      const cat = resolveLocalizedText(service.category, '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch =
        !query || title.includes(query) || desc.includes(query) || cat.includes(query);

      const matchesCategory =
        activeCategory === 'All' ||
        cat.includes(activeCategory.toLowerCase().split(' ')[0]) ||
        activeCategory.toLowerCase().includes(cat);

      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, activeCategory]);

  const getCategoryMeta = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('health') || c.includes('mrityunjaya') || c.includes('anushthan')) {
      return { icon: 'fire', color: '#C5221F', label: 'Anushthan' };
    }
    if (c.includes('dosha') || c.includes('navagraha') || c.includes('planetary')) {
      return { icon: 'dharmachakra', color: '#8C3B32', label: 'Dosha Shanti' };
    }
    if (c.includes('lakshmi') || c.includes('prosperity') || c.includes('vrat')) {
      return { icon: 'spa-outline', color: '#8C3B32', label: 'Lakshmi Puja' };
    }
    if (c.includes('vastu') || c.includes('griha') || c.includes('pravesh')) {
      return { icon: 'home-outline', color: '#8F4218', label: 'Vastu Shanti' };
    }
    return { icon: 'spa-outline', color: '#8C3B32', label: cat || 'Vedic Vidhi' };
  };

  const renderServiceItem = ({
    item,
    index,
  }: {
    item: PujaService;
    index: number;
  }) => {
    const serviceTitle = resolveLocalizedText(item.title, 'Sacred Vedic Vidhi');
    const serviceSubtitle = resolveLocalizedText(
      item.subtitle || item.description,
      'Authentic Vedic ceremony adhering to Shastric vidhis.',
    );
    const categoryLabel = resolveLocalizedText(item.category, 'Vedic Puja');
    const categoryMeta = getCategoryMeta(categoryLabel);
    const price = item.priceMinor
      ? (item.priceMinor / 100).toLocaleString('en-IN')
      : '3,500';
    const imageUrl = item.imageUrl || getPujaImageUrl(item, index);
    const ratingVal = item.rating ? item.rating.toFixed(1) : '4.8';
    const reviewFormatted = item.reviewCount
      ? item.reviewCount > 999
        ? `${(item.reviewCount / 1000).toFixed(1)}k`
        : String(item.reviewCount)
      : '1.2k';

    const modes = item.availableModes && item.availableModes.length > 0
      ? item.availableModes
      : ['temple', 'home_visit', 'online'];

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PujaDetail', { serviceId: item.id })}
        activeOpacity={0.88}
      >
        {/* Top Section: Left Thumbnail + Right Info */}
        <View style={styles.cardTopRow}>
          {/* Square Puja Ritual Photo */}
          <View style={styles.thumbnailWrap}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          </View>

          {/* Right Details Column */}
          <View style={styles.cardInfoCol}>
            {/* Category Tag Pill & Star Rating */}
            <View style={styles.tagRatingRow}>
              <View style={styles.categoryTagPill}>
                <Icon
                  family="material-community"
                  name={categoryMeta.icon}
                  size={12}
                  color={categoryMeta.color}
                />
                <Text style={styles.categoryTagText}>
                  {categoryMeta.label}
                </Text>
              </View>

              <View style={styles.ratingBox}>
                <Icon family="material" name="star" size={13} color="#D97706" />
                <Text style={styles.ratingText}>
                  {ratingVal} ({reviewFormatted})
                </Text>
              </View>
            </View>

            {/* Puja Title */}
            <Text style={styles.serviceTitle} numberOfLines={2}>
              {serviceTitle}
            </Text>

            {/* Subtitle / Scriptural Description */}
            <Text style={styles.serviceSubtitle} numberOfLines={2}>
              {serviceSubtitle}
            </Text>
          </View>
        </View>

        {/* Available Modes Row (Temple, Doorstep, Live Online) */}
        <View style={styles.modesRow}>
          {modes.map(mode => {
            const isTemple = mode.toLowerCase().includes('temple');
            const isDoorstep =
              mode.toLowerCase().includes('home') ||
              mode.toLowerCase().includes('doorstep');
            const isOnline = mode.toLowerCase().includes('online');

            return (
              <View key={mode} style={styles.modePill}>
                <Icon
                  family="material-community"
                  name={
                    isTemple
                      ? 'bank-outline'
                      : isDoorstep
                      ? 'home-outline'
                      : 'video-outline'
                  }
                  size={13}
                  color="#7E1528"
                />
                <Text style={styles.modeText}>
                  {isTemple
                    ? 'Temple'
                    : isDoorstep
                    ? 'Doorstep'
                    : 'Live Online'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Bottom Row: Ritual Dakshina & Select Vidhi CTA */}
        <View style={styles.cardFooter}>
          <View style={styles.dakshinaWrap}>
            <Text style={styles.priceLabel}>Ritual Dakshina</Text>
            <Text style={styles.priceValue}>₹{price}</Text>
          </View>

          <View style={styles.footerDivider} />

          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => navigation.navigate('PujaDetail', { serviceId: item.id })}
            activeOpacity={0.85}
          >
            <Text style={styles.bookBtnText}>Select Vidhi</Text>
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
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.screenTitle}>Sacred Vedic Pujas</Text>
          <Text style={styles.screenSubtitle}>
            Authentic • Scriptural • Guided by Verified Acharyas
          </Text>
        </View>

        {/* Search Toggle Button */}
        <TouchableOpacity
          style={styles.searchIconButton}
          onPress={() => setIsSearchOpen(!isSearchOpen)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Icon
            family="material"
            name={isSearchOpen ? 'close' : 'search'}
            size={22}
            color="#241F1A"
          />
        </TouchableOpacity>
      </View>

      {/* Expandable Search Input Bar */}
      {isSearchOpen && (
        <View style={styles.searchBarWrap}>
          <Icon family="material" name="search" size={18} color="#7A6E63" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pujas by deity, name, or purpose..."
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

      {/* Category Chips Bar */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isSelected = activeCategory === item.id;
            return (
              <TouchableOpacity
                onPress={() => setActiveCategory(item.id)}
                style={[
                  styles.categoryChip,
                  isSelected ? styles.categoryActive : styles.categoryInactive,
                ]}
                activeOpacity={0.75}
              >
                {item.icon && (
                  <Icon
                    family={item.family as any}
                    name={item.icon}
                    size={14}
                    color={isSelected ? '#FFFFFF' : '#7E1528'}
                  />
                )}
                <Text
                  style={[
                    styles.categoryText,
                    isSelected
                      ? styles.categoryTextActive
                      : styles.categoryTextInactive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Services List */}
      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <PujaCardSkeleton style={styles.skeletonMargin} />
          <PujaCardSkeleton style={styles.skeletonMargin} />
          <PujaCardSkeleton style={styles.skeletonMargin} />
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={item => item.id}
          renderItem={renderServiceItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Icon
                family="material-community"
                name="fire"
                size={38}
                color={colors.textMuted}
              />
              <Text style={styles.emptyTitle}>No Rituals Found</Text>
              <Text style={styles.emptySubtext}>
                No Vedic vidhis match your selected filters. Try searching for other
                ceremonies or reset category.
              </Text>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.resetBtnText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
    paddingBottom: 6,
  },
  headerTitleWrap: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
    letterSpacing: 0.2,
  },
  screenSubtitle: {
    fontSize: 11,
    color: '#7A6E63',
    fontWeight: '500',
    marginTop: 2,
  },
  searchIconButton: {
    padding: 6,
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 14,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#241F1A',
    paddingVertical: 0,
  },
  categoryContainer: {
    paddingVertical: 10,
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryActive: {
    backgroundColor: '#7E1528',
    borderColor: '#7E1528',
  },
  categoryInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EFE4D6',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoryTextInactive: {
    color: '#241F1A',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 36,
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    padding: 14,
    elevation: 1,
    shadowColor: '#3A1505',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnailWrap: {
    width: 112,
    height: 112,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F5EFE6',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  cardInfoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  tagRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FDF1F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8C3B32',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#241F1A',
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
    lineHeight: 18,
    marginBottom: 2,
  },
  serviceSubtitle: {
    fontSize: 11,
    color: '#665E56',
    lineHeight: 15,
  },
  modesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 8,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FBF6F0',
    borderWidth: 1,
    borderColor: '#EFE4D6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#241F1A',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5EFE6',
  },
  dakshinaWrap: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 10,
    color: '#786F66',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#241F1A',
    lineHeight: 20,
  },
  footerDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#EFE4D6',
    marginHorizontal: 12,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7E1528',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
  },
  bookBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    gap: 14,
  },
  skeletonMargin: {
    marginBottom: 10,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    padding: 24,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#241F1A',
    marginTop: 8,
    marginBottom: 4,
  },
  emptySubtext: {
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
