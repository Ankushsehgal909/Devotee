import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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

const CATEGORIES = ['All', 'Prosperity and Vrat', 'Health and Long Life', 'Vastu and Shanti', 'Navagraha'];

export const PujaCatalogScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeCategory, setActiveCategory] = useState('All');

  // Real API hook
  const { data: services, isLoading, refetch } = useServices({
    category: activeCategory === 'All' ? undefined : activeCategory,
  });

  const renderServiceItem = ({ item }: { item: PujaService }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('PujaDetail', { serviceId: item.id })}
    >
      <View style={styles.cardTop}>
        <View style={styles.flameIcon}>
          <Icon family="material-community" name="fire" size={20} color={colors.primary} />
        </View>
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.serviceTitle}>{item.title}</Text>
          <View style={styles.ratingRow}>
            <Icon family="material" name="star" size={14} color={colors.goldAccent} />
            <Text style={styles.ratingText}>{item.rating || 4.9}</Text>
            <Text style={styles.reviewText}>({item.reviewCount || 108} reviews)</Text>
          </View>
        </View>
      </View>

      <Text style={styles.serviceSubtitle} numberOfLines={2}>
        {item.subtitle || item.description}
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
          <Text style={styles.priceValue}>₹{item.priceMinor ? item.priceMinor / 100 : 3500}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('PujaDetail', { serviceId: item.id })}
        >
          <Text style={styles.bookBtnText}>Select Vidhi</Text>
          <Icon family="material" name="chevron-right" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Card>
  );

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
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  categoryActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
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
  },
  categoryTextInactive: {
    color: colors.textSecondary,
  },
  skeletonContainer: {
    padding: spacing.screenPadding,
  },
  skeletonMargin: {
    marginBottom: spacing.md,
  },
  listContent: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 6,
  },
  flameIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderInfo: {
    flex: 1,
  },
  serviceTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    ...typography.captionSmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reviewText: {
    ...typography.captionSmall,
    color: colors.textMuted,
  },
  serviceSubtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  modeTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  modeBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderWarm,
    paddingTop: spacing.sm,
  },
  priceLabel: {
    ...typography.captionSmall,
    color: colors.textMuted,
  },
  priceValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.md,
  },
  bookBtnText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
