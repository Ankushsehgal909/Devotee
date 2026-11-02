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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icon';
import { useProviders, PanditSearchResult } from '../../api/customer';
import { siteImages } from '../../constants/images';

const CITIES = ['All Cities', 'Varanasi (Kashi)', 'Haridwar', 'Ujjain', 'Prayagraj', 'Delhi NCR'];

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
      (p.shakha && p.shakha.toLowerCase().includes(search.toLowerCase()));
    return matchesCity && matchesSearch;
  });

  const renderPanditCard = ({ item }: { item: PanditSearchResult }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('PanditDetail', { panditId: item.id })}
    >
      <View style={styles.cardTop}>
        <Image
          source={{ uri: item.avatarUrl || siteImages.homeAssetsVerticalsGurukulAcharyas }}
          style={styles.avatar}
          resizeMode="cover"
        />
        <View style={styles.cardDetails}>
          <View style={styles.badgeRow}>
            <Badge label="Verified Acharya" variant="success" />
            <View style={styles.ratingBox}>
              <Icon family="material" name="star" size={13} color={colors.goldAccent} />
              <Text style={styles.ratingVal}>{item.rating || 4.9}</Text>
            </View>
          </View>
          <Text style={styles.panditName}>{item.name}</Text>
          <Text style={styles.shakhaText}>{item.lineage || item.shakha}</Text>
          <View style={styles.metaRow}>
            <Icon family="material" name="location-on" size={14} color={colors.primary} />
            <Text style={styles.metaText}>{item.city}</Text>
            <Text style={styles.dot}>•</Text>
            <Icon family="material" name="history-edu" size={14} color={colors.goldAccent} />
            <Text style={styles.metaText}>{item.experienceYears} yrs Vedic exp</Text>
          </View>
        </View>
      </View>

      <Text style={styles.bioText} numberOfLines={2}>
        {item.biography}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.langRow}>
          {item.languages.slice(0, 3).map((l, i) => (
            <View key={i} style={styles.langPill}>
              <Text style={styles.langText}>{l}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={styles.bookCta}
          onPress={() => navigation.navigate('PujasTab')}
        >
          <Text style={styles.bookCtaText}>Book Puja</Text>
          <Icon family="material" name="arrow-forward" size={14} color={colors.white} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header
        title="Gurukul Acharyas & Pandits"
        subtitle="Veda Murti Shastri Directory"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {/* Search Input */}
      <View style={styles.searchWrap}>
        <Icon family="material" name="search" size={20} color={colors.textMuted} />
        <TextInput
          placeholder="Search by Acharya name, Gotra, or Shakha..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor={colors.textMuted}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon family="material" name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* City Chips */}
      <View style={styles.citiesWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CITIES}
          keyExtractor={(item) => item}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.cityChip, selectedCity === item && styles.cityChipActive]}
              onPress={() => setSelectedCity(item)}
            >
              <Text
                style={[styles.cityChipText, selectedCity === item && styles.cityChipTextActive]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderPanditCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Icon family="material-community" name="account-search" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Acharyas Found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your city or search criteria.
            </Text>
          </Card>
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.screenPadding,
    marginVertical: spacing.xs,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  citiesWrap: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  cityChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  cityChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cityChipText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  cityChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.screenPadding,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardTop: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EAE6E1',
  },
  cardDetails: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingVal: {
    ...typography.captionSmall,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  panditName: {
    ...typography.h4,
    color: colors.primaryDark,
    marginBottom: 2,
  },
  shakhaText: {
    ...typography.captionSmall,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.captionSmall,
    color: colors.textMuted,
  },
  dot: {
    color: colors.textMuted,
    fontSize: 10,
  },
  bioText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginVertical: spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: spacing.xs,
    marginTop: 4,
  },
  langRow: {
    flexDirection: 'row',
    gap: 4,
  },
  langPill: {
    backgroundColor: '#F3E6D8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  langText: {
    ...typography.captionSmall,
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '600',
  },
  bookCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  bookCtaText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xxl,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    marginTop: spacing.sm,
    color: colors.textPrimary,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
