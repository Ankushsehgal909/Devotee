import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
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
import { useCartStore } from '../../store/useCartStore';

interface GiftHamper {
  id: string;
  title: string;
  subtitle: string;
  priceMinor: number;
  imageUrl: string;
  tag: string;
  inclusions: string[];
}

const GIFT_HAMPERS: GiftHamper[] = [
  {
    id: 'rudrabhishek-tokri',
    title: 'Rudrabhishek Sacred Tokri',
    subtitle: 'Hand-woven consecrated bamboo tokri with brass Bilva patra & dravyas',
    priceMinor: 249900,
    imageUrl: siteImages.rudrabhishekTokri,
    tag: 'Shiva Aradhana',
    inclusions: [
      'Pure Brass Panchapatra & Achmani',
      'Kashi Vishwanath Consecrated Bhasma',
      'A2 Gir Cow Bilona Ghee (250g)',
      'Natural Himalayan Dhoop Cones',
      'Silver Bilva Leaf for Shivalinga',
    ],
  },
  {
    id: 'luxury-gift-box',
    title: 'Mahalakshmi Luxury Gift Box',
    subtitle: 'Royal embossed velvet box for Diwali, weddings, and Griha Pravesh',
    priceMinor: 399900,
    imageUrl: siteImages.luxuryGiftBox,
    tag: 'Diwali & Griha Pravesh',
    inclusions: [
      'Gold-plated Shri Yantra',
      'Ashtagandha Chandan & Kumkum',
      'Handcrafted Brass Kamakshi Diya',
      'Certified 108 Kamal Gatta Mala',
      'Shri Suktam Calligraphy Scroll',
    ],
  },
  {
    id: 'satyanarayan-hamper',
    title: 'Shri Satyanarayan Pujan Hamper',
    subtitle: 'Complete auspicious vrat hamper with holy Tulsi and brass Kalash',
    priceMinor: 189900,
    imageUrl: siteImages.satyanarayanHamper,
    tag: 'Purnima & Vrat',
    inclusions: [
      'Solid Brass Kalash with Nariyal Sthapana',
      'Kashi Kautuka Sacred Red Mauli',
      'Organic Haldi & Akshat Packets',
      'Vedic Havan Samagri Herbs (500g)',
      'Hand-printed Vrat Katha Book',
    ],
  },
  {
    id: 'prasadam-pouch',
    title: 'Teerth Dham Prasadam Pouch',
    subtitle: 'Sacred blessings packed in authentic silk pouch with Gangajal',
    priceMinor: 89900,
    imageUrl: siteImages.prasadamPouch,
    tag: 'Teerth Blessing',
    inclusions: [
      'Sealed Kashi Gangajal Bottle (100ml)',
      'Vaidyanath Bhasma & Sandalwood Tablet',
      'Gomti Chakra & White Cowrie Pair',
      'Blessed Raksha Sutra Cord',
    ],
  },
];

export const SacredGiftsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { addItem, toggleSacredGift } = useCartStore();

  // Personalization preview state
  const [noteType, setNoteType] = useState<'handwritten' | 'typed'>('handwritten');
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [blessingMessage, setBlessingMessage] = useState(
    'May the divine blessings of Lord Vishwanath bring eternal peace, health, and prosperity to your home.'
  );

  // Corporate enquiry modal
  const [corporateModal, setCorporateModal] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [quantity, setQuantity] = useState('50');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddHamperToCart = (hamper: GiftHamper) => {
    const productMock = {
      id: hamper.id,
      slug: hamper.id,
      title: hamper.title,
      description: hamper.subtitle,
      category: 'Sacred Gifts',
      priceMinor: hamper.priceMinor,
      imageUrl: hamper.imageUrl,
      images: [hamper.imageUrl],
      isPurityCertified: true,
      variants: [],
      rating: 5.0,
      reviewCount: 28,
      inStock: true,
    };

    addItem(productMock, 1);
    toggleSacredGift(
      hamper.id,
      true,
      `For: ${recipientName || 'Beloved Family'} | From: ${senderName || 'Devotee'}\n${blessingMessage}`
    );

    Alert.alert(
      'Gift Hamper Added!',
      `${hamper.title} has been added to your Sacred Basket with personalized blessing note.`
    );
  };

  const handleCorporateSubmit = () => {
    if (!orgName.trim() || !contactPhone.trim() || !contactName.trim()) {
      Alert.alert('Required Fields', 'Please provide organization name, contact person, and mobile number.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setCorporateModal(false);
      setOrgName('');
      setContactName('');
      setContactPhone('');
      Alert.alert(
        'Sacred Enquiry Received',
        'Our Vedic Gifting Advisor will contact you within 4 business hours with curated hamper catalogs and custom branding proofs.'
      );
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header
        title="Sacred Gifting Portal"
        rightAction={
          <TouchableOpacity onPress={() => navigation.navigate('CartScreen')}>
            <Icon family="material-community" name="shopping-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <Card style={styles.heroCard}>
          <Image source={{ uri: siteImages.luxuryGiftBox }} style={styles.heroImg} />
          <View style={styles.heroOverlay}>
            <Badge label="VEDIC GIFTING" variant="sacred" />
            <Text style={styles.heroTitle}>A Little Thought. A Lasting Blessing.</Text>
            <Text style={styles.heroSubtitle}>
              Spiritual gifts for people and auspicious moments that matter. Personalize with recipient gotra, sacred Gangajal, and heartfelt handwritten notes.
            </Text>
            <Button
              title="Corporate & Custom Bulk Orders"
              variant="outline"
              size="sm"
              style={styles.corporateTriggerBtn}
              onPress={() => setCorporateModal(true)}
              leftIcon={<Icon family="material-community" name="domain" size={16} color={colors.primary} />}
            />
          </View>
        </Card>

        {/* Blessing Note Customization Preview */}
        <Card variant="warm" style={styles.notePreviewCard}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon family="material-community" name="fountain-pen-tip" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Personalized Blessing Card</Text>
            </View>
            <View style={styles.styleToggle}>
              <TouchableOpacity
                style={[styles.toggleBtn, noteType === 'handwritten' && styles.toggleBtnActive]}
                onPress={() => setNoteType('handwritten')}
              >
                <Text style={[styles.toggleText, noteType === 'handwritten' && styles.toggleTextActive]}>
                  Handwritten
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, noteType === 'typed' && styles.toggleBtnActive]}
                onPress={() => setNoteType('typed')}
              >
                <Text style={[styles.toggleText, noteType === 'typed' && styles.toggleTextActive]}>
                  Calligraphy
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputsGrid}>
            <TextInput
              style={styles.inputField}
              placeholder="Recipient Name (e.g. Anand & Sunita Sharma)"
              placeholderTextColor={colors.textMuted}
              value={recipientName}
              onChangeText={setRecipientName}
            />
            <TextInput
              style={styles.inputField}
              placeholder="Sender / Family Name (e.g. Ramesh Sharma)"
              placeholderTextColor={colors.textMuted}
              value={senderName}
              onChangeText={setSenderName}
            />
          </View>

          <TextInput
            style={[styles.inputField, { minHeight: 60, textAlignVertical: 'top' }]}
            placeholder="Personal spiritual blessing message..."
            placeholderTextColor={colors.textMuted}
            value={blessingMessage}
            onChangeText={setBlessingMessage}
            multiline
          />

          <View style={styles.cardMockup}>
            <Icon family="material-community" name="om" size={24} color={colors.primary} />
            <Text style={styles.cardMockupHeader}>॥ शुभं करोति कल्याणम् ॥</Text>
            <Text style={styles.cardMockupTo}>
              To: {recipientName || 'Respected Devotee'}
            </Text>
            <Text
              style={[
                styles.cardMockupBody,
                noteType === 'handwritten' ? styles.fontHandwritten : styles.fontCalligraphy,
              ]}
            >
              "{blessingMessage}"
            </Text>
            <Text style={styles.cardMockupFrom}>
              With divine affection, {senderName || 'Devotee Family'}
            </Text>
          </View>
        </Card>

        {/* Curated Sacred Hampers List */}
        <Text style={styles.listHeading}>Curated Consecrated Hampers</Text>

        {GIFT_HAMPERS.map((hamper) => {
          const price = (hamper.priceMinor / 100).toFixed(0);
          return (
            <Card key={hamper.id} style={styles.hamperCard}>
              <View style={styles.hamperImageRow}>
                <Image source={{ uri: hamper.imageUrl }} style={styles.hamperImage} />
                <View style={styles.hamperMeta}>
                  <Badge label={hamper.tag} variant="sacred" />
                  <Text style={styles.hamperTitle}>{hamper.title}</Text>
                  <Text style={styles.hamperSubtitle}>{hamper.subtitle}</Text>
                  <Text style={styles.hamperPrice}>₹{price}</Text>
                </View>
              </View>

              <View style={styles.inclusionsBox}>
                <Text style={styles.inclusionsTitle}>Includes inside sacred box:</Text>
                {hamper.inclusions.map((inc, i) => (
                  <View key={i} style={styles.inclusionItem}>
                    <Icon family="material" name="check" size={14} color={colors.success} />
                    <Text style={styles.inclusionText}>{inc}</Text>
                  </View>
                ))}
              </View>

              <Button
                title={`Send as Sacred Gift (₹${price})`}
                variant="primary"
                style={styles.giftBtn}
                onPress={() => handleAddHamperToCart(hamper)}
                leftIcon={<Icon family="material-community" name="gift" size={18} color="#FFFFFF" />}
              />
            </Card>
          );
        })}
      </ScrollView>

      {/* Corporate Enquiry Modal */}
      <Modal
        visible={corporateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCorporateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Corporate & Wedding Gifting</Text>
              <TouchableOpacity onPress={() => setCorporateModal(false)}>
                <Icon family="material" name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>
                Custom embossed sacred boxes with company logo, bulk courier dispatch across India, and certified pure dravyas.
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Company / Family Occasion Name"
                placeholderTextColor={colors.textMuted}
                value={orgName}
                onChangeText={setOrgName}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Contact Person Full Name"
                placeholderTextColor={colors.textMuted}
                value={contactName}
                onChangeText={setContactName}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Mobile Number for Quotation"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                value={contactPhone}
                onChangeText={setContactPhone}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Estimated Quantity (e.g. 50, 100, 500+)"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                value={quantity}
                onChangeText={setQuantity}
              />

              <Button
                title={isSubmitting ? 'Submitting...' : 'Request Corporate Quote'}
                variant="primary"
                loading={isSubmitting}
                onPress={handleCorporateSubmit}
                style={{ marginTop: spacing.md, marginBottom: spacing.md }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSand,
  },
  scrollContent: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  heroCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
    position: 'relative',
    height: 220,
    borderRadius: borderRadius.lg,
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(38, 14, 20, 0.8)',
    padding: spacing.md,
    justifyContent: 'center',
  },
  heroTitle: {
    ...typography.h3,
    color: '#F4E6CF',
    marginTop: 6,
    marginBottom: 4,
  },
  heroSubtitle: {
    ...typography.captionSmall,
    color: '#D8C7BC',
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  corporateTriggerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  notePreviewCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.primary,
  },
  styleToggle: {
    flexDirection: 'row',
    backgroundColor: colors.bgSand,
    borderRadius: borderRadius.full,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  toggleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 10,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  inputsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  inputField: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    borderRadius: borderRadius.sm,
    backgroundColor: '#FFFFFF',
    padding: spacing.sm,
    ...typography.caption,
    color: colors.textPrimary,
  },
  cardMockup: {
    backgroundColor: '#FFFDF7',
    borderWidth: 2,
    borderColor: colors.goldAccent,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cardMockupHeader: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 6,
  },
  cardMockupTo: {
    ...typography.captionSmall,
    fontWeight: '700',
    color: colors.textPrimary,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  cardMockupBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginVertical: 4,
  },
  fontHandwritten: {
    fontStyle: 'italic',
  },
  fontCalligraphy: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardMockupFrom: {
    ...typography.captionSmall,
    color: colors.textMuted,
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  listHeading: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  hamperCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  hamperImageRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  hamperImage: {
    width: 90,
    height: 90,
    borderRadius: borderRadius.md,
  },
  hamperMeta: {
    flex: 1,
  },
  hamperTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginTop: 2,
  },
  hamperSubtitle: {
    ...typography.captionSmall,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
  hamperPrice: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '800',
    marginTop: 4,
  },
  inclusionsBox: {
    backgroundColor: colors.bgCream,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  inclusionsTitle: {
    ...typography.captionSmall,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  inclusionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
  },
  inclusionText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
  },
  giftBtn: {
    marginTop: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  modalSubtitle: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.borderWarm,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
});
