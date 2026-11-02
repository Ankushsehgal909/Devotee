import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { useProvider } from '../../api/customer';
import { useServices } from '../../api/services';
import { siteImages } from '../../constants/images';
import { resolveLocalizedText } from '../../utils/localization';

type ParamList = {
  PanditDetail: { panditId: string };
};

export const PanditDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<ParamList, 'PanditDetail'>>();
  const navigation = useNavigation<any>();
  const panditId = route.params?.panditId;

  const { data: pandit, isLoading } = useProvider(panditId);
  const { data: allServices } = useServices();

  // Find sample pujas performed
  const samplePujas = (allServices || []).slice(0, 3);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Header title="Acharya Profile" />
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching Vedic Acharya Credentials...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const name = resolveLocalizedText(pandit?.name, 'Acharya Shastri');
  const city = pandit?.city || 'Varanasi (Kashi)';
  const shakha = pandit?.shakha || 'Shukla Yajurveda';
  const lineage = pandit?.lineage || 'Madhyandina Shakha Gurukul Parampara';
  const experienceYears = pandit?.experienceYears || 15;
  const rating = pandit?.rating ?? 4.95;
  const bio = resolveLocalizedText(
    pandit?.biography,
    'Certified Vedic scholar with rigorous Gurukul training and decades of mastery in sacred Karmakand ceremonies.'
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Acharya Profile" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <Card style={styles.heroCard}>
          <View style={styles.profileRow}>
            <Image
              source={{
                uri: pandit?.avatarUrl || siteImages.homeAssetsVerticalsGurukulAcharyas,
              }}
              style={styles.avatar}
            />
            <View style={styles.profileMeta}>
              <View style={styles.badgeRow}>
                <Badge
                  label="Vedic Certified"
                  variant="sacred"
                  icon={<Icon family="material-community" name="seal" size={12} color={colors.primary} />}
                />
                <View style={styles.ratingBadge}>
                  <Icon family="material" name="star" size={14} color={colors.goldAccent} />
                  <Text style={styles.ratingText}>{rating}</Text>
                </View>
              </View>
              <Text style={styles.panditName}>{name}</Text>
              <Text style={styles.shakhaText}>{shakha}</Text>
              <View style={styles.locationRow}>
                <Icon family="material" name="location-on" size={14} color={colors.primary} />
                <Text style={styles.locationText}>{city}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Credentials & Vedic Lineage Card */}
        <Card variant="warm" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Vedic Credentials & Shakha</Text>
          <View style={styles.credentialItem}>
            <Icon family="material-community" name="certificate" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.credentialHeading}>Gurukul Tradition & Lineage</Text>
              <Text style={styles.credentialDesc}>{lineage}</Text>
            </View>
          </View>
          <View style={styles.credentialItem}>
            <Icon family="material-community" name="school" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.credentialHeading}>Experience & Dedication</Text>
              <Text style={styles.credentialDesc}>{experienceYears}+ years in Vedic Karmakand & Shastras</Text>
            </View>
          </View>
          <View style={styles.credentialItem}>
            <Icon family="material-community" name="translate" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.credentialHeading}>Languages of Recitation</Text>
              <Text style={styles.credentialDesc}>
                {pandit?.languages?.join(', ') || 'Sanskrit, Hindi'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Biography */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About this Acharya</Text>
          <Text style={styles.bioText}>{bio}</Text>
        </Card>

        {/* Consecrated Pujas Performed */}
        <View style={styles.pujasSection}>
          <Text style={styles.sectionTitle}>Specialized Vedic Pujas</Text>
          <Text style={styles.pujasSubtitle}>
            Select a consecrated ceremony to be performed by {name}:
          </Text>

          {samplePujas.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.pujaItem}
              activeOpacity={0.8}
              onPress={() => {
                navigation.navigate('PujasTab', {
                  screen: 'PujaDetail',
                  params: { serviceId: service.id },
                });
              }}
            >
              <Image
                source={{ uri: service.imageUrl || siteImages.pujaCatalogBanner }}
                style={styles.pujaThumb}
              />
              <View style={styles.pujaInfo}>
                <Text style={styles.pujaTitle} numberOfLines={1}>
                  {resolveLocalizedText(service.title, 'Vedic Puja')}
                </Text>
                <Text style={styles.pujaCategory}>{resolveLocalizedText(service.category, 'Ritual')}</Text>
                <Text style={styles.pujaDakshina}>Dakshina: ₹{service.priceMinor / 100}</Text>
              </View>
              <Icon family="material" name="chevron-right" size={20} color={colors.primary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Button */}
        <Button
          title={`Book Ceremony with ${name.split(' ')[0]}`}
          variant="primary"
          style={styles.bookBtn}
          onPress={() => {
            if (samplePujas.length > 0) {
              navigation.navigate('PujasTab', {
                screen: 'PujaCheckout',
                params: { serviceId: samplePujas[0].id },
              });
            } else {
              navigation.navigate('PujasTab', { screen: 'PujaCatalog' });
            }
          }}
          leftIcon={<Icon family="material-community" name="fire" size={18} color="#FFFFFF" />}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSand,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  scrollContent: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  heroCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  profileMeta: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  panditName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  shakhaText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    ...typography.captionSmall,
    color: colors.textMuted,
  },
  sectionCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  credentialItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  credentialHeading: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  credentialDesc: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  bioText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  pujasSection: {
    marginBottom: spacing.lg,
  },
  pujasSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  pujaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    gap: spacing.sm,
  },
  pujaThumb: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.sm,
  },
  pujaInfo: {
    flex: 1,
  },
  pujaTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  pujaCategory: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  pujaDakshina: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  bookBtn: {
    marginBottom: spacing.xl,
  },
});
