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
import { useNavigation } from '@react-navigation/native';
import { CommonAppBackgroundScreen } from '../../components/common/CommonAppBackgroundScreen';
import { colors } from '../../theme/colors';
import { Icon } from '../../components/common/Icon';
import { SacredShimmer } from '../../components/common/SacredShimmer';
import { siteImages } from '../../constants/images';
import { useCartStore } from '../../store/useCartStore';

interface GiftHamper {
  id: string;
  title: string;
  subtitle: string;
  priceMinor: number;
  imageUrl: string;
  tag: string;
  tagIcon: string;
  inclusions: string[];
}

const GIFT_HAMPERS: GiftHamper[] = [
  {
    id: 'rudrabhishek-tokri',
    title: 'Rudrabhishek Sacred Tokri',
    subtitle:
      'Hand-woven consecrated bamboo tokri with solid brass Bilva patra & sacred dravyas',
    priceMinor: 249900,
    imageUrl: siteImages.rudrabhishekTokri,
    tag: 'Shiva Aradhana',
    tagIcon: 'fire',
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
    subtitle:
      'Royal embossed velvet box for Diwali, weddings, and auspicious Griha Pravesh',
    priceMinor: 399900,
    imageUrl: siteImages.luxuryGiftBox,
    tag: 'Diwali & Griha Pravesh',
    tagIcon: 'crown',
    inclusions: [
      'Gold-plated 24K Shri Yantra',
      'Ashtagandha Chandan & Kumkum',
      'Handcrafted Brass Kamakshi Diya',
      'Certified 108 Kamal Gatta Mala',
      'Shri Suktam Calligraphy Scroll',
    ],
  },
  {
    id: 'satyanarayan-hamper',
    title: 'Shri Satyanarayan Pujan Hamper',
    subtitle:
      'Complete auspicious vrat hamper with holy Tulsi and handcrafted brass Kalash',
    priceMinor: 189900,
    imageUrl: siteImages.satyanarayanHamper,
    tag: 'Purnima & Vrat',
    tagIcon: 'star',
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
    subtitle:
      'Sacred blessings packed in authentic Benarasi silk pouch with Kashi Gangajal',
    priceMinor: 89900,
    imageUrl: siteImages.prasadamPouch,
    tag: 'Teerth Blessing',
    tagIcon: 'hands-pray',
    inclusions: [
      'Sealed Kashi Gangajal Bottle (100ml)',
      'Vaidyanath Bhasma & Sandalwood Tablet',
      'Gomti Chakra & White Cowrie Pair',
      'Blessed Raksha Sutra Cord',
    ],
  },
];

const BLESSING_TEMPLATES = [
  {
    label: 'Health & Peace',
    text: 'May the divine blessings of Lord Vishwanath bring eternal peace, health, and prosperity to your home.',
  },
  {
    label: 'Griha Pravesh',
    text: 'May Goddess Lakshmi illuminate your new home with endless abundance, bliss, and spiritual warmth.',
  },
  {
    label: 'Wedding Shubh',
    text: 'May your union be blessed with lifelong companionship, virtuous dharma, and perpetual sacred joy.',
  },
  {
    label: 'Diwali Prosperity',
    text: 'May the sacred flame of the divine diya dispel all darkness and bestow Shubh-Labh on your entire family.',
  },
];

export const SacredGiftsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { addItem, toggleSacredGift, getTotalCount } = useCartStore();
  const cartCount = getTotalCount();

  // Personalization preview state
  const [noteType, setNoteType] = useState<'calligraphy' | 'handwritten'>('calligraphy');
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [blessingMessage, setBlessingMessage] = useState(
    'May the divine blessings of Lord Vishwanath bring eternal peace, health, and prosperity to your home.'
  );

  // Added animation state map
  const [addedHamperMap, setAddedHamperMap] = useState<Record<string, boolean>>({});

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
      reviewCount: 48,
      inStock: true,
    };

    addItem(productMock, 1);
    toggleSacredGift(
      hamper.id,
      true,
      `For: ${recipientName || 'Beloved Family'} | From: ${senderName || 'Devotee'}\n${blessingMessage}`
    );

    setAddedHamperMap((prev) => ({ ...prev, [hamper.id]: true }));
    setTimeout(() => {
      setAddedHamperMap((prev) => ({ ...prev, [hamper.id]: false }));
    }, 1500);

    Alert.alert(
      'Sacred Hamper Added!',
      `${hamper.title} has been placed into your Sacred Basket along with your personalized blessing scroll.`
    );
  };

  const handleCorporateSubmit = () => {
    if (!orgName.trim() || !contactPhone.trim() || !contactName.trim()) {
      Alert.alert(
        'Required Details',
        'Please provide organization/occasion name, contact person, and mobile number.'
      );
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
          <Icon family="material" name="arrow-back" size={22} color="#6B0E1E" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Sacred Gifting</Text>
          <Text style={styles.headerSubtitle}>
            Vedic Hampers & Personalized Blessings
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cartIconBtn}
          onPress={() => navigation.navigate('CartScreen')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.75}
        >
          <Icon
            family="material-community"
            name="shopping-outline"
            size={23}
            color="#6B0E1E"
          />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Luxury Sacred Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroGlowCircle} />
          <View style={styles.heroHeaderTag}>
            <Icon family="material-community" name="om" size={14} color="#D97706" />
            <Text style={styles.heroHeaderTagText}>
              ॥ शुभं करोति कल्याणम् ॥ SACRED VEDIC GIFTING
            </Text>
          </View>

          <Text style={styles.heroTitle}>
            A Little Thought. A Lasting Blessing.
          </Text>
          <Text style={styles.heroSubtitle}>
            Spiritual gifts for people and auspicious moments that matter.
            Personalize with recipient gotra, sacred Gangajal, and heartfelt
            handwritten notes.
          </Text>

          {/* Trust Highlights */}
          <View style={styles.trustHighlights}>
            <View style={styles.trustItem}>
              <Icon
                family="material-community"
                name="shield-check"
                size={14}
                color="#166534"
              />
              <Text style={styles.trustText}>Mantra Consecrated</Text>
            </View>
            <View style={styles.trustDot} />
            <View style={styles.trustItem}>
              <Icon
                family="material-community"
                name="fountain-pen-tip"
                size={14}
                color="#854D0E"
              />
              <Text style={styles.trustText}>Handwritten Shloka</Text>
            </View>
            <View style={styles.trustDot} />
            <View style={styles.trustItem}>
              <Icon
                family="material-community"
                name="truck-fast-outline"
                size={14}
                color="#1E40AF"
              />
              <Text style={styles.trustText}>Safe Express Dispatch</Text>
            </View>
          </View>

          {/* Corporate Bulk Action */}
          <TouchableOpacity
            style={styles.corporateTriggerBtn}
            onPress={() => setCorporateModal(true)}
            activeOpacity={0.85}
          >
            <Icon
              family="material-community"
              name="domain"
              size={16}
              color="#6B0E1E"
            />
            <Text style={styles.corporateTriggerText}>
              Corporate & Wedding Bulk Orders
            </Text>
            <Icon
              family="material"
              name="chevron-right"
              size={18}
              color="#6B0E1E"
            />
          </TouchableOpacity>
        </View>

        {/* Personalized Blessing Card Customizer */}
        <View style={styles.cardCustomizerBox}>
          <View style={styles.customizerHeader}>
            <View style={styles.customizerTitleRow}>
              <View style={styles.penIconBox}>
                <Icon
                  family="material-community"
                  name="fountain-pen-tip"
                  size={16}
                  color="#6B0E1E"
                />
              </View>
              <View>
                <Text style={styles.customizerTitle}>
                  Personalized Blessing Card
                </Text>
                <Text style={styles.customizerSubtitle}>
                  Included free inside every sacred gift hamper
                </Text>
              </View>
            </View>

            {/* Script Toggle */}
            <View style={styles.styleToggle}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  noteType === 'calligraphy' && styles.toggleBtnActive,
                ]}
                onPress={() => setNoteType('calligraphy')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.toggleText,
                    noteType === 'calligraphy' && styles.toggleTextActive,
                  ]}
                >
                  Calligraphy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  noteType === 'handwritten' && styles.toggleBtnActive,
                ]}
                onPress={() => setNoteType('handwritten')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.toggleText,
                    noteType === 'handwritten' && styles.toggleTextActive,
                  ]}
                >
                  Handwritten
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Inputs Row */}
          <View style={styles.inputsGrid}>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Recipient Name</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Enter recipient name"
                placeholderTextColor="#9A897C"
                value={recipientName}
                onChangeText={setRecipientName}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Sender Name</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Enter sender name"
                placeholderTextColor="#9A897C"
                value={senderName}
                onChangeText={setSenderName}
              />
            </View>
          </View>

          {/* Message Input */}
          <View style={styles.messageInputWrap}>
            <Text style={styles.inputLabel}>Custom Blessing Shloka or Message</Text>
            <TextInput
              style={[styles.inputField, styles.messageInput]}
              placeholder="Enter blessing message"
              placeholderTextColor="#9A897C"
              value={blessingMessage}
              onChangeText={setBlessingMessage}
              multiline
            />
          </View>

          {/* Quick Blessing Preset Chips */}
          <View style={styles.presetsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {BLESSING_TEMPLATES.map((tmpl) => (
                <TouchableOpacity
                  key={tmpl.label}
                  style={[
                    styles.presetChip,
                    blessingMessage === tmpl.text && styles.presetChipActive,
                  ]}
                  onPress={() => setBlessingMessage(tmpl.text)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      blessingMessage === tmpl.text && styles.presetChipTextActive,
                    ]}
                  >
                    {tmpl.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Live Parchment Scroll Mockup */}
          <View style={styles.parchmentMockup}>
            <View style={styles.parchmentBorder}>
              <View style={styles.parchmentCornerTL} />
              <View style={styles.parchmentCornerTR} />
              <View style={styles.parchmentCornerBL} />
              <View style={styles.parchmentCornerBR} />

              <View style={styles.parchmentOmWrap}>
                <Icon
                  family="material-community"
                  name="om"
                  size={26}
                  color="#B3802B"
                />
              </View>

              <Text style={styles.parchmentHeader}>॥ ॐ श्री गणेशाय नमः ॥</Text>

              <View style={styles.parchmentRecipientRow}>
                <Text style={styles.parchmentToLabel}>Auspiciously to:</Text>
                <Text style={styles.parchmentToName}>
                  {recipientName || 'Respected Devotee Family'}
                </Text>
              </View>

              <Text
                style={[
                  styles.parchmentBody,
                  noteType === 'handwritten'
                    ? styles.fontHandwritten
                    : styles.fontCalligraphy,
                ]}
              >
                "{blessingMessage}"
              </Text>

              <View style={styles.parchmentSenderRow}>
                <Text style={styles.parchmentFromLabel}>
                  With divine love & pranam:
                </Text>
                <Text style={styles.parchmentFromName}>
                  {senderName || 'Devotee'}
                </Text>
              </View>

              <View style={styles.parchmentSealRow}>
                <Icon
                  family="material-community"
                  name="seal-variant"
                  size={14}
                  color="#B3802B"
                />
                <Text style={styles.parchmentSealText}>
                  Consecrated by VedSarthi Gurukul
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Curated Sacred Hampers List */}
        <View style={styles.hampersSectionHeader}>
          <Text style={styles.hampersSectionTitle}>
            Curated Consecrated Hampers
          </Text>
          <Text style={styles.hampersSectionSubtitle}>
            Packed in hand-crafted brass, bamboo, and velvet containers
          </Text>
        </View>

        {GIFT_HAMPERS.map((hamper) => {
          const price = Math.round(hamper.priceMinor / 100);
          const isAdded = Boolean(addedHamperMap[hamper.id]);

          return (
            <View key={hamper.id} style={styles.hamperCard}>
              {/* Hamper Top Hero Image */}
              <View style={styles.hamperImageContainer}>
                <Image
                  source={{ uri: hamper.imageUrl }}
                  style={styles.hamperImage}
                  resizeMode="cover"
                />

                {/* Floating Tag */}
                <View style={styles.hamperTagBadge}>
                  <Icon
                    family="material-community"
                    name={hamper.tagIcon || 'crown'}
                    size={11}
                    color="#FFFFFF"
                  />
                  <Text style={styles.hamperTagText}>{hamper.tag}</Text>
                </View>

                {/* Consecration Seal with Gold Shimmer */}
                <SacredShimmer
                  style={styles.consecrationSeal}
                  borderRadius={12}
                  shimmerColor="rgba(217, 119, 6, 0.25)"
                  duration={2000}
                >
                  <View style={styles.sealInnerRow}>
                    <Icon
                      family="material-community"
                      name="certificate-outline"
                      size={11}
                      color="#B3802B"
                    />
                    <Text style={styles.consecrationSealText}>Mantra Certified</Text>
                  </View>
                </SacredShimmer>
              </View>

              {/* Hamper Details Body */}
              <View style={styles.hamperBody}>
                <View style={styles.hamperTitleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.hamperTitle}>{hamper.title}</Text>
                    <Text style={styles.hamperSubtitle}>{hamper.subtitle}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.hamperPrice}>₹{price}</Text>
                    <Text style={styles.freeDeliveryBadge}>Free Express Ship</Text>
                  </View>
                </View>

                {/* Inclusions Box */}
                <View style={styles.inclusionsBox}>
                  <View style={styles.inclusionsHeaderRow}>
                    <Icon
                      family="material-community"
                      name="package-variant-closed"
                      size={14}
                      color="#7E1528"
                    />
                    <Text style={styles.inclusionsTitle}>
                      Sacred Inclusions Inside:
                    </Text>
                  </View>

                  {hamper.inclusions.map((inc, i) => (
                    <View key={i} style={styles.inclusionItem}>
                      <Icon
                        family="material-community"
                        name="check-circle"
                        size={14}
                        color="#166534"
                      />
                      <Text style={styles.inclusionText}>{inc}</Text>
                    </View>
                  ))}
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  style={[styles.giftBtn, isAdded && styles.giftBtnAdded]}
                  onPress={() => handleAddHamperToCart(hamper)}
                  activeOpacity={0.88}
                >
                  <Icon
                    family="material-community"
                    name={isAdded ? 'check' : 'gift-outline'}
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.giftBtnText}>
                    {isAdded
                      ? 'Added to Sacred Basket ✓'
                      : `Send as Sacred Gift (₹${price})`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Corporate & Wedding Enquiry Modal */}
      <Modal
        visible={corporateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCorporateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <Icon
                  family="material-community"
                  name="domain"
                  size={20}
                  color="#6B0E1E"
                />
                <Text style={styles.modalTitle}>
                  Corporate & Wedding Gifting
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCorporateModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.closeBtn}
              >
                <Icon family="material" name="close" size={20} color="#6B0E1E" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>
                Custom embossed sacred boxes with your company logo or family
                monogram, bulk courier dispatch across India, and certified pure
                dravyas.
              </Text>

              <View style={styles.modalFieldGroup}>
                <Text style={styles.modalFieldLabel}>
                  Occasion or Organization Name
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter organization or occasion name"
                  placeholderTextColor="#9A897C"
                  value={orgName}
                  onChangeText={setOrgName}
                />
              </View>

              <View style={styles.modalFieldGroup}>
                <Text style={styles.modalFieldLabel}>Contact Person Name</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter contact person name"
                  placeholderTextColor="#9A897C"
                  value={contactName}
                  onChangeText={setContactName}
                />
              </View>

              <View style={styles.modalFieldGroup}>
                <Text style={styles.modalFieldLabel}>Mobile Number (WhatsApp)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#9A897C"
                  keyboardType="phone-pad"
                  value={contactPhone}
                  onChangeText={setContactPhone}
                />
              </View>

              <View style={styles.modalFieldGroup}>
                <Text style={styles.modalFieldLabel}>Estimated Quantity</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter quantity (e.g. 50)"
                  placeholderTextColor="#9A897C"
                  keyboardType="number-pad"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  isSubmitting && { opacity: 0.7 },
                ]}
                onPress={handleCorporateSubmit}
                disabled={isSubmitting}
                activeOpacity={0.88}
              >
                <Icon
                  family="material-community"
                  name="send"
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.modalSubmitBtnText}>
                  {isSubmitting
                    ? 'Submitting Enquiry...'
                    : 'Request Bespoke Corporate Quote'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </CommonAppBackgroundScreen>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: '#F2E4D5',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FBF4EC',
    borderWidth: 1,
    borderColor: '#EBD8C3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#6B0E1E',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#8A5843',
    fontWeight: '500',
    marginTop: 1,
  },
  cartIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FBF4EC',
    borderWidth: 1,
    borderColor: '#EBD8C3',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: colors.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  heroBanner: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFBF2',
    borderWidth: 1.5,
    borderColor: '#F0DCB8',
    padding: 16,
    shadowColor: '#6B0E1E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  heroGlowCircle: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
  },
  heroHeaderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  heroHeaderTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#B3802B',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#6B0E1E',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#6A564A',
    lineHeight: 17.5,
    marginBottom: 12,
  },
  trustHighlights: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F4E4CB',
    marginBottom: 12,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4A3B32',
  },
  trustDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#C8B097',
  },
  corporateTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#D4B898',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  corporateTriggerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B0E1E',
  },
  cardCustomizerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0E2D2',
    padding: 14,
    marginBottom: 18,
    shadowColor: '#5C1D24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  customizerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  customizerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  penIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDF1E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customizerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6B0E1E',
  },
  customizerSubtitle: {
    fontSize: 10.5,
    color: '#8A7669',
  },
  styleToggle: {
    flexDirection: 'row',
    backgroundColor: '#F7EDE2',
    borderRadius: 18,
    padding: 2,
    borderWidth: 1,
    borderColor: '#ECD4BC',
  },
  toggleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 16,
  },
  toggleBtnActive: {
    backgroundColor: '#6B0E1E',
  },
  toggleText: {
    fontSize: 10.5,
    color: '#6A564A',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5C4A3E',
    marginBottom: 4,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#E8D7C6',
    borderRadius: 10,
    backgroundColor: '#FCFAF6',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12.5,
    color: '#241D1A',
  },
  messageInputWrap: {
    marginBottom: 10,
  },
  messageInput: {
    minHeight: 54,
    textAlignVertical: 'top',
  },
  presetsRow: {
    marginBottom: 12,
  },
  presetChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#F5ECE3',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E5D6C5',
  },
  presetChipActive: {
    backgroundColor: '#D97706',
    borderColor: '#B45309',
  },
  presetChipText: {
    fontSize: 10.5,
    color: '#654C3A',
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  parchmentMockup: {
    backgroundColor: '#FFFDF7',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5C378',
    padding: 12,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  parchmentBorder: {
    borderWidth: 1,
    borderColor: '#F0D69A',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#FFFDF9',
  },
  parchmentCornerTL: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#B3802B',
  },
  parchmentCornerTR: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#B3802B',
  },
  parchmentCornerBL: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 8,
    height: 8,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#B3802B',
  },
  parchmentCornerBR: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 8,
    height: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#B3802B',
  },
  parchmentOmWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  parchmentHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8A5812',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  parchmentRecipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  parchmentToLabel: {
    fontSize: 11,
    color: '#8A7669',
    fontWeight: '600',
  },
  parchmentToName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B0E1E',
  },
  parchmentBody: {
    fontSize: 12.5,
    color: '#423730',
    textAlign: 'center',
    lineHeight: 19,
    marginVertical: 6,
    paddingHorizontal: 8,
  },
  fontHandwritten: {
    fontStyle: 'italic',
    fontWeight: '500',
  },
  fontCalligraphy: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  parchmentSenderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  parchmentFromLabel: {
    fontSize: 10.5,
    color: '#8A7669',
  },
  parchmentFromName: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#6B0E1E',
  },
  parchmentSealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5E4C8',
  },
  parchmentSealText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#925C15',
    letterSpacing: 0.4,
  },
  hampersSectionHeader: {
    marginBottom: 12,
  },
  hampersSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6B0E1E',
  },
  hampersSectionSubtitle: {
    fontSize: 11.5,
    color: '#8A7669',
    marginTop: 2,
  },
  hamperCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0E2D2',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#5C1D24',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  hamperImageContainer: {
    width: '100%',
    height: 165,
    backgroundColor: '#FBF5EC',
    position: 'relative',
  },
  hamperImage: {
    width: '100%',
    height: '100%',
  },
  hamperTagBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7E1528',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  hamperTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  consecrationSeal: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0DCB8',
  },
  consecrationSealText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#8A5812',
  },
  sealInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hamperBody: {
    padding: 14,
  },
  hamperTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  hamperTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#241D1A',
    marginBottom: 2,
  },
  hamperSubtitle: {
    fontSize: 11.5,
    color: '#7A675B',
    lineHeight: 16,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  hamperPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7E1528',
  },
  freeDeliveryBadge: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#166534',
    marginTop: 2,
  },
  inclusionsBox: {
    backgroundColor: '#FCFAF6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F3E8DC',
    padding: 10,
    marginBottom: 12,
  },
  inclusionsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  inclusionsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B0E1E',
  },
  inclusionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2.5,
  },
  inclusionText: {
    fontSize: 11.5,
    color: '#4B3E36',
  },
  giftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#7E1528',
    paddingVertical: 10,
    borderRadius: 12,
  },
  giftBtnAdded: {
    backgroundColor: '#166534',
  },
  giftBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: '82%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2E4D5',
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6B0E1E',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FBF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#7A675B',
    lineHeight: 17,
    marginBottom: 14,
  },
  modalFieldGroup: {
    marginBottom: 12,
  },
  modalFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5C4A3E',
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E8D7C6',
    borderRadius: 10,
    backgroundColor: '#FCFAF6',
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#241D1A',
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#7E1528',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
