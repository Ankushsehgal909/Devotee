import React, { useState } from 'react';
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
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icon';
import { PujaCardSkeleton } from '../../components/common/Skeleton';
import { useServices } from '../../api/services';
import { PujaService } from '../../types';
import { resolveLocalizedText } from '../../utils/localization';
import { getPujaImageUrl } from '../../constants/images';

const CATEGORIES = ['All', 'Prosperity and Vrat', 'Health and Long Life', 'Vastu and Shanti', 'Navagraha'];

export const PujaCatalogScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeCategory, setActiveCategory] = useState('All');

  // Real API hook
  const { data: services, isLoading, refetch } = useServices({
    category: activeCategory === 'All' ? undefined : activeCategory,
  });

  const renderServiceItem = ({ item, index }: { item: PujaService; index: number }) => {
    const serviceTitle = resolveLocalizedText(item.title, 'Sacred Vedic Vidhi');
    const serviceSubtitle = resolveLocalizedText(
      item.subtitle || item.description,
      'Authentic Vedic ceremony adhering to Shastric vidhis.'
    );
    const categoryLabel = resolveLocalizedText(item.category, 'Vedic Vidhi');
    const price = item.priceMinor ? item.priceMinor / 100 : 3500;
    const imageUrl = item.imageUrl || getPujaImageUrl(item, index);

    return (
      <Card
        style={styles.card}
        onPress={() => navigation.navigate('PujaDetail', { serviceId: item.id })}
      >
        {/* Card Photographic Banner */}
        <View style={styles.cardImageWrap}>
          <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
          <View style={styles.categoryBadgeWrap}>
            <Text style={styles.categoryBadgeText}>{categoryLabel}</Text>
          </View>
          <View style={styles.ratingBadgeWrap}>
            <Icon family="material" name="star" size={12} color={colors.goldAccent} />
            <Text style={styles.ratingBadgeText}>{item.rating || 4.9}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.serviceTitle}>{serviceTitle}</Text>
          <Text style={styles.serviceSubtitle} numberOfLines={2}>
            {serviceSubtitle}
          </Text>

          <View style={styles.modeTagsRow}>
            {(item.availableModes || ['home_visit', 'online']).map((mode) => (
              <Badge
                key={mode}
                label={mode === 'home_visit' ? 'Doorstep Visit' : mode === 'online' ? 'Live Online' : 'Temple'}
                variant="sacred"
                style={styles.modeBadge}
              />
            ))}
          </View>

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.priceLabel}>Ritual Dakshina</Text>
              <Text style={styles.priceValue}>₹{price}</Text>
            </View>
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => navigation.navigate('PujaDetail', { serviceId: item.id })}
            >
              <Text style={styles.bookBtnText}>Select Vidhi</Text>
              <Icon family="material" name="chevron-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Sacred Vedic Pujas" showBack={false} />

      {/* Category Filter Pills */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveCategory(item)}
              style={[
                styles.categoryChip,
                activeCategory === item ? styles.categoryActive : styles.categoryInactive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === item ? styles.categoryTextActive : styles.categoryTextInactive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <PujaCardSkeleton style={styles.skeletonMargin} />
          <PujaCardSkeleton style={styles.skeletonMargin} />
          <PujaCardSkeleton style={styles.skeletonMargin} />
        </View>
      ) : (
        <FlatList
          data={services || []}
          keyExtractor={(item) => item.id}
          renderItem={renderServiceItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Icon family="material-community" name="fire" size={36} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Rituals Found</Text>
              <Text style={styles.emptySubtext}>
                No rituals currently listed in this category. Pull down to refresh.
              </Text>
            </Card>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSand,
  },
  categoryContainer: {
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgSand,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderWarm,
  },
  categoryList: {
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  categoryActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.borderWarm,
  },
  categoryText: {
    ...typography.caption,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoryTextInactive: {
    color: colors.textMuted,
  },
  listContent: {
    padding: spacing.screenPadding,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardImageWrap: {
    width: '100%',
    height: 150,
    position: 'relative',
    backgroundColor: '#EAE6E1',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadgeWrap: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  categoryBadgeText: {
    ...typography.captionSmall,
    fontWeight: '700',
    color: colors.primary,
  },
  ratingBadgeWrap: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(26, 17, 16, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  ratingBadgeText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: '700',
  },
  cardContent: {
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
  modeTagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.md,
  },
  modeBadge: {
    paddingVertical: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: spacing.sm,
  },
  priceLabel: {
    ...typography.captionSmall,
    color: colors.textMuted,
  },
  priceValue: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: '800',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  bookBtnText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  skeletonContainer: {
    padding: spacing.screenPadding,
  },
  skeletonMargin: {
    marginBottom: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h3,
    marginTop: spacing.md,
    color: colors.textPrimary,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
