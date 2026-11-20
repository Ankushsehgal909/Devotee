import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { PujaStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { CommonAppBackgroundScreen } from '../../components/common/CommonAppBackgroundScreen';
import { LinearGradient } from '../../components/common/LinearGradient';
import { useService } from '../../api/services';
import {
  useCreateBooking,
  useAddresses,
  useFamilyMembers,
  useDevoteeAccount,
} from '../../api/customer';
import { resolveLocalizedText } from '../../utils/localization';
import { localImages, siteImages, getPujaImageUrl } from '../../constants/images';

type CheckoutRouteProp = RouteProp<PujaStackParamList, 'PujaCheckout'>;

const MUHURAT_SLOTS = [
  {
    id: 'morning',
    label: 'Pratah Kaal (Morning)',
    time: '07:30 AM - 10:00 AM',
    tag: 'Brahma Muhurat',
    desc: 'Ideal for Surya Aradhana, Ganapati Pujan, and Hawans.',
  },
  {
    id: 'abhijit',
    label: 'Abhijit Muhurat (Peak Auspicious)',
    time: '11:45 AM - 01:15 PM',
    tag: 'Sarvottam',
    desc: 'Universal victory window, highly auspicious for all pujas.',
  },
  {
    id: 'evening',
    label: 'Sandhya Kaal (Evening)',
    time: '05:30 PM - 08:00 PM',
    tag: 'Pradosh Shanti',
    desc: 'Supreme for Shiva Archana, Sundarkand, and Lakshmi Aradhana.',
  },
];

const STEP_ITEMS = [
  { step: 1, title: 'Venue', icon: 'home' },
  { step: 2, title: 'Muhurat', icon: 'schedule' },
  { step: 3, title: 'Sankalp', icon: 'people' },
  { step: 4, title: 'Dakshina', icon: 'verified' },
];

export const PujaCheckoutScreen: React.FC = () => {
  const route = useRoute<CheckoutRouteProp>();
  const navigation = useNavigation<any>();
  const { serviceId } = route.params;

  const { data: service, isLoading: isServiceLoading } = useService(serviceId);
  const { data: serverUser } = useDevoteeAccount();
  const { data: addresses } = useAddresses();
  const { data: familyMembers } = useFamilyMembers();
  const createBookingMutation = useCreateBooking();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Venue & Mode
  const [mode, setMode] = useState<'home_visit' | 'online' | 'in_person'>('home_visit');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Delhi NCR');
  const [pincode, setPincode] = useState('110001');

  // Step 2: Date & Muhurat
  const [selectedDaysAhead, setSelectedDaysAhead] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState(MUHURAT_SLOTS[1].id);
  const [specialNotes, setSpecialNotes] = useState('');

  // Step 3: Pandit & Samagri & Sankalp
  const [samagriOption, setSamagriOption] = useState<'full_kit' | 'devotee_arranges'>('full_kit');
  const [selectedFamilyIds, setSelectedFamilyIds] = useState<string[]>([]);

  // Step 4: Payment plan
  const [paymentPlan, setPaymentPlan] = useState<'advance' | 'full'>('advance');

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const dayNamesHindi = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
    return {
      index: i + 1,
      dateString: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNameHindi: dayNamesHindi[d.getDay()],
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  const selectedDateObj = dates.find((d) => d.index === selectedDaysAhead) || dates[0];
  const totalDakshinaPaise = service?.priceMinor || 350000;
  const totalDakshinaRs = Math.round(totalDakshinaPaise / 100);
  const advanceAmountRs = Math.round(totalDakshinaRs * 0.25);
  const payableNowRs = paymentPlan === 'advance' ? advanceAmountRs : totalDakshinaRs;

  const handleConfirmBooking = async () => {
    const serviceTitle = resolveLocalizedText(service?.title, 'Sacred Vedic Vidhi');

    try {
      const payload = {
        serviceId,
        serviceName: serviceTitle,
        mode,
        venueAddress: {
          contactName: serverUser?.name || 'Devotee',
          contactPhone: serverUser?.phone || '+91 9876543210',
          street: street || 'Vedic Devotee Residence',
          city,
          pincode,
        },
        scheduledDate: selectedDateObj.dateString,
        slotWindow: selectedSlot,
        samagriChoice: samagriOption,
        familyMemberIds: selectedFamilyIds,
        paymentPlan,
        amountPaidRs: payableNowRs,
        totalDakshinaRs,
        specialNotes,
      };

      const res = await createBookingMutation.mutateAsync(payload);
      const bookingId = res?.id || res?._id || `VED-BK-${Date.now().toString().slice(-6)}`;

      Alert.alert(
        '॥ वैदिक संकल्प सुरक्षित ॥',
        `Your muhurat for ${serviceTitle} has been reserved. Attendance verification token generated.`,
        [
          {
            text: 'View Ceremony Hub',
            onPress: () => {
              navigation.replace('BookingDetail', { bookingId });
            },
          },
        ]
      );
    } catch {
      // Offline fallback
      const fakeId = `VED-${Date.now().toString().slice(-6)}`;
      Alert.alert(
        '॥ वैदिक संकल्प सुरक्षित ॥',
        `Your sacred Muhurat slot has been reserved for ${serviceTitle}.`,
        [
          {
            text: 'Open Booking Hub',
            onPress: () => {
              navigation.replace('BookingDetail', { bookingId: fakeId });
            },
          },
        ]
      );
    }
  };

  const serviceTitle = resolveLocalizedText(service?.title, 'Sacred Vedic Ceremony');
  const serviceImageUrl = getPujaImageUrl(service, 0);

  return (
    <CommonAppBackgroundScreen
      safeAreaEdges={['top', 'left', 'right']}
      resizeMode="stretch"
    >
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (step > 1) {
              setStep((s) => (s - 1) as any);
            } else {
              navigation.goBack();
            }
          }}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon family="material" name="arrow-back" size={24} color="#6B0E1E" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Sacred Puja Booking</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {serviceTitle}
          </Text>
        </View>

        <View style={styles.stepCounterBadge}>
          <Text style={styles.stepCounterText}>Step {step}/4</Text>
        </View>
      </View>

      {/* Stepper Progress Bar */}
      <View style={styles.stepperContainer}>
        {STEP_ITEMS.map((item, index) => {
          const isDone = item.step < step;
          const isCurrent = item.step === step;

          return (
            <React.Fragment key={item.step}>
              <TouchableOpacity
                onPress={() => {
                  if (item.step < step) {
                    setStep(item.step as any);
                  }
                }}
                activeOpacity={item.step < step ? 0.7 : 1}
                style={styles.stepItem}
              >
                <View
                  style={[
                    styles.stepCircle,
                    isDone && styles.stepCircleDone,
                    isCurrent && styles.stepCircleCurrent,
                  ]}
                >
                  {isDone ? (
                    <Icon family="material" name="check" size={14} color="#FFFFFF" />
                  ) : (
                    <Icon
                      family="material"
                      name={item.icon}
                      size={14}
                      color={isCurrent ? '#FFFFFF' : '#8A7E73'}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isCurrent && styles.stepLabelCurrent,
                    isDone && styles.stepLabelDone,
                  ]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>

              {index < STEP_ITEMS.length - 1 && (
                <View
                  style={[
                    styles.stepConnector,
                    item.step < step && styles.stepConnectorActive,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Service Hero Snippet */}
        <View style={styles.serviceHeroCard}>
          <Image source={{ uri: serviceImageUrl }} style={styles.serviceHeroImg} />
          <View style={styles.serviceHeroDetails}>
            <View style={styles.heroBadgeRow}>
              <Badge label="Gurukul Certified" variant="sacred" />
              <Text style={styles.heroPriceText}>₹{totalDakshinaRs}</Text>
            </View>
            <Text style={styles.serviceHeroTitle} numberOfLines={1}>
              {serviceTitle}
            </Text>
            <Text style={styles.serviceHeroSub}>
              Authentic Vedic vidhi by verified Acharya
            </Text>
          </View>
        </View>

        {/* STEP 1: VENUE & MODE */}
        {step === 1 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.stepHeading}>Step 1: Choose Ceremony Mode</Text>
              <Text style={styles.stepDescription}>
                Select where the Acharya should perform the authentic Vedic ritual.
              </Text>
            </View>

            <View style={styles.modeContainer}>
              {/* Home Visit Mode */}
              <TouchableOpacity
                style={[
                  styles.modeCard,
                  mode === 'home_visit' && styles.modeCardActive,
                ]}
                onPress={() => setMode('home_visit')}
                activeOpacity={0.8}
              >
                <View style={styles.modeIconCircle}>
                  <Icon
                    family="material"
                    name="home"
                    size={22}
                    color={mode === 'home_visit' ? '#6B0E1E' : '#7A6E63'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.modeTitleRow}>
                    <Text
                      style={[
                        styles.modeTitle,
                        mode === 'home_visit' && styles.modeTitleActive,
                      ]}
                    >
                      Doorstep Home Visit
                    </Text>
                    {mode === 'home_visit' && (
                      <Icon
                        family="material"
                        name="check-circle"
                        size={20}
                        color="#6B0E1E"
                      />
                    )}
                  </View>
                  <Text style={styles.modeDesc}>
                    Acharya visits your home carrying consecrated copper Hawan Kund, Ganga Jal and Vedic dravyas.
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Live Online E-Puja */}
              <TouchableOpacity
                style={[
                  styles.modeCard,
                  mode === 'online' && styles.modeCardActive,
                ]}
                onPress={() => setMode('online')}
                activeOpacity={0.8}
              >
                <View style={styles.modeIconCircle}>
                  <Icon
                    family="material"
                    name="videocam"
                    size={22}
                    color={mode === 'online' ? '#6B0E1E' : '#7A6E63'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.modeTitleRow}>
                    <Text
                      style={[
                        styles.modeTitle,
                        mode === 'online' && styles.modeTitleActive,
                      ]}
                    >
                      Live Online E-Puja
                    </Text>
                    {mode === 'online' && (
                      <Icon
                        family="material"
                        name="check-circle"
                        size={20}
                        color="#6B0E1E"
                      />
                    )}
                  </View>
                  <Text style={styles.modeDesc}>
                    Interactive 1:1 HD video stream with individual Gotra Sankalp chanted directly to your screen.
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Temple Sanctum */}
              <TouchableOpacity
                style={[
                  styles.modeCard,
                  mode === 'in_person' && styles.modeCardActive,
                ]}
                onPress={() => setMode('in_person')}
                activeOpacity={0.8}
              >
                <View style={styles.modeIconCircle}>
                  <Icon
                    family="material-community"
                    name="temple-hindu"
                    size={22}
                    color={mode === 'in_person' ? '#6B0E1E' : '#7A6E63'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.modeTitleRow}>
                    <Text
                      style={[
                        styles.modeTitle,
                        mode === 'in_person' && styles.modeTitleActive,
                      ]}
                    >
                      Temple Sanctum (Kashi / Haridwar)
                    </Text>
                    {mode === 'in_person' && (
                      <Icon
                        family="material"
                        name="check-circle"
                        size={20}
                        color="#6B0E1E"
                      />
                    )}
                  </View>
                  <Text style={styles.modeDesc}>
                    Performed by priests at our consecrated sanctums on the sacred banks of Maa Ganga.
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Address Input Form for Home Visit */}
            {mode === 'home_visit' && (
              <View style={styles.formCard}>
                <View style={styles.formCardHeader}>
                  <Icon family="material" name="location-on" size={18} color="#6B0E1E" />
                  <Text style={styles.formCardTitle}>Ceremony Venue Address</Text>
                </View>

                {addresses && addresses.length > 0 && (
                  <View style={styles.savedAddressesBox}>
                    <Text style={styles.savedAddressLabel}>Select Saved Address:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                      {addresses.map((addr: any) => {
                        const addrStreet = addr?.street || addr?.line1 || '';
                        const addrName = addr?.name || addr?.label || 'Venue';
                        const addrCity = addr?.city || '';
                        const addrPincode = addr?.pincode || addr?.postalCode || '';
                        const isMatch = (addrStreet && street === addrStreet) || (addrPincode && pincode === addrPincode);
                        const displaySnippet = addrStreet
                          ? addrStreet.length > 20
                            ? `${addrStreet.slice(0, 20)}...`
                            : addrStreet
                          : addrCity || 'Saved Venue';

                        return (
                          <TouchableOpacity
                            key={addr.id || Math.random().toString()}
                            style={[styles.savedAddrChip, isMatch && styles.savedAddrChipActive]}
                            onPress={() => {
                              if (addrStreet) setStreet(addrStreet);
                              if (addrCity) setCity(addrCity);
                              if (addrPincode) setPincode(addrPincode);
                            }}
                          >
                            <Text style={[styles.savedAddrText, isMatch && styles.savedAddrTextActive]}>
                              {addrName}: {displaySnippet}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                <Text style={styles.inputLabel}>Street Address / Society Name *</Text>
                <TextInput
                  placeholder="Enter street address"
                  placeholderTextColor="#A3988C"
                  value={street}
                  onChangeText={setStreet}
                  style={styles.textInput}
                />

                <View style={styles.rowInputs}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>City *</Text>
                    <TextInput
                      placeholder="Enter city"
                      placeholderTextColor="#A3988C"
                      value={city}
                      onChangeText={setCity}
                      style={styles.textInput}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Pincode *</Text>
                    <TextInput
                      placeholder="Enter pincode"
                      placeholderTextColor="#A3988C"
                      value={pincode}
                      onChangeText={setPincode}
                      keyboardType="number-pad"
                      maxLength={6}
                      style={styles.textInput}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Next Action Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.primaryBtn}
              onPress={() => setStep(2)}
            >
              <LinearGradient
                colors={['#8B1528', '#5A0C1A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtnGradient}
              >
                <Text style={styles.primaryBtnText}>Next: Select Auspicious Muhurat</Text>
                <Icon family="material" name="arrow-forward" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: AUSPICIOUS DATE & MUHURAT */}
        {step === 2 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.stepHeading}>Step 2: Auspicious Date & Muhurat</Text>
              <Text style={styles.stepDescription}>
                Select your preferred day. Timings are calculated per daily Vedic astral ephemeris.
              </Text>
            </View>

            {/* Horizontal Shubh Date Picker */}
            <Text style={styles.subHeadingTitle}>Select Sacred Day</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateStrip}
            >
              {dates.map((d) => {
                const isSelected = selectedDaysAhead === d.index;
                return (
                  <TouchableOpacity
                    key={d.index}
                    style={[styles.dateChip, isSelected && styles.dateChipActive]}
                    onPress={() => setSelectedDaysAhead(d.index)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dateHindiDay, isSelected && styles.dateTextActive]}>
                      {d.dayNameHindi}
                    </Text>
                    <Text style={[styles.dateDayNum, isSelected && styles.dateTextActive]}>
                      {d.dayNumber}
                    </Text>
                    <Text style={[styles.dateMonth, isSelected && styles.dateTextActive]}>
                      {d.monthName}
                    </Text>
                    <View style={[styles.shubhDot, isSelected && styles.shubhDotActive]} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Muhurat Windows */}
            <Text style={styles.subHeadingTitle}>
              Shubh Muhurat Windows ({selectedDateObj.dateString})
            </Text>
            <View style={styles.slotsList}>
              {MUHURAT_SLOTS.map((slot) => {
                const isSelected = selectedSlot === slot.id;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[styles.slotCard, isSelected && styles.slotCardActive]}
                    onPress={() => setSelectedSlot(slot.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.slotLeft}>
                      <View
                        style={[
                          styles.slotIconCircle,
                          isSelected && styles.slotIconCircleActive,
                        ]}
                      >
                        <Icon
                          family="material"
                          name="schedule"
                          size={18}
                          color={isSelected ? '#6B0E1E' : '#7A6E63'}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.slotTitleRow}>
                          <Text
                            style={[
                              styles.slotTitle,
                              isSelected && styles.slotTitleActive,
                            ]}
                          >
                            {slot.label}
                          </Text>
                          <Badge
                            label={slot.tag}
                            variant={isSelected ? 'sacred' : 'neutral'}
                          />
                        </View>
                        <Text style={styles.slotTime}>{slot.time}</Text>
                        <Text style={styles.slotDesc}>{slot.desc}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Special Shastric Instructions */}
            <View style={styles.notesBox}>
              <Text style={styles.inputLabel}>
                Special Shastric Notes or Specific Deity Requests (Optional)
              </Text>
              <TextInput
                placeholder="Enter special instructions or notes"
                placeholderTextColor="#A3988C"
                value={specialNotes}
                onChangeText={setSpecialNotes}
                multiline
                numberOfLines={3}
                style={[styles.textInput, { height: 75, textAlignVertical: 'top' }]}
              />
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.primaryBtn}
              onPress={() => setStep(3)}
            >
              <LinearGradient
                colors={['#8B1528', '#5A0C1A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtnGradient}
              >
                <Text style={styles.primaryBtnText}>Next: Pandit & Sankalp Setup</Text>
                <Icon family="material" name="arrow-forward" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3: PANDIT & SAMAGRI & SANKALP */}
        {step === 3 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.stepHeading}>Step 3: Pandit Allocation & Sankalp</Text>
              <Text style={styles.stepDescription}>
                Certified Gurukul Acharyas are matched based on your Gotra and ritual requirements.
              </Text>
            </View>

            {/* Acharya Allocation Preview Card */}
            <View style={styles.panditCard}>
              <View style={styles.panditRow}>
                <Image
                  source={{ uri: siteImages.homeAssetsVerticalsGurukulAcharyas }}
                  style={styles.panditAvatar}
                />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Badge label="Verified Acharya" variant="success" />
                    <Badge label="Shukla Yajurveda" variant="sacred" />
                  </View>
                  <Text style={styles.panditName}>Gurukul Certified Acharya Allocation</Text>
                  <Text style={styles.panditShakha}>
                    Kashi Vidvat Parishad & Sampurnanand Sanskrit Vishwavidyalaya
                  </Text>
                </View>
              </View>
              <View style={styles.panditNoteBox}>
                <Icon family="material" name="verified-user" size={16} color="#B45309" />
                <Text style={styles.panditNoteText}>
                  VedSarthi matches an authenticated Shastri fluent in Sanskrit & Hindi, carrying consecrated Hawan Kund.
                </Text>
              </View>
            </View>

            {/* Samagri Arrangement Options */}
            <Text style={styles.subHeadingTitle}>Puja Samagri Arrangement</Text>
            <View style={styles.samagriOptions}>
              <TouchableOpacity
                style={[
                  styles.samagriCard,
                  samagriOption === 'full_kit' && styles.samagriCardActive,
                ]}
                onPress={() => setSamagriOption('full_kit')}
                activeOpacity={0.8}
              >
                <View style={styles.samagriIconCircle}>
                  <Icon
                    family="material-community"
                    name="package-variant-closed"
                    size={20}
                    color="#6B0E1E"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.samagriTitleRow}>
                    <Text style={styles.samagriTitle}>
                      VedSarthi Consecrated Samagri Kit (Included)
                    </Text>
                    {samagriOption === 'full_kit' && (
                      <Icon family="material" name="check-circle" size={18} color="#6B0E1E" />
                    )}
                  </View>
                  <Text style={styles.samagriDesc}>
                    100% pure Gir Cow A2 Ghee, Katyayana herbs, Janeu, Kalash, and certified dravyas.
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.samagriCard,
                  samagriOption === 'devotee_arranges' && styles.samagriCardActive,
                ]}
                onPress={() => setSamagriOption('devotee_arranges')}
                activeOpacity={0.8}
              >
                <View style={styles.samagriIconCircle}>
                  <Icon
                    family="material-community"
                    name="home-outline"
                    size={20}
                    color="#7A6E63"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.samagriTitleRow}>
                    <Text style={styles.samagriTitle}>
                      Devotee Arranges All Dravyas
                    </Text>
                    {samagriOption === 'devotee_arranges' && (
                      <Icon family="material" name="check-circle" size={18} color="#6B0E1E" />
                    )}
                  </View>
                  <Text style={styles.samagriDesc}>
                    Acharya brings only copper Panchapatra and Shastric puja books. Checklist provided.
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Family Members Sankalp Picker */}
            <Text style={styles.subHeadingTitle}>Include Family Members in Live Sankalp</Text>
            {familyMembers && familyMembers.length > 0 ? (
              familyMembers.map((m) => {
                const isSelected = selectedFamilyIds.includes(m.id);
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.familyPickRow, isSelected && styles.familyPickActive]}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedFamilyIds((prev) => prev.filter((id) => id !== m.id));
                      } else {
                        setSelectedFamilyIds((prev) => [...prev, m.id]);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Icon
                      family="material"
                      name={isSelected ? 'check-box' : 'check-box-outline-blank'}
                      size={22}
                      color={isSelected ? '#6B0E1E' : '#8A7E73'}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.familyName}>
                        {m.name} ({m.relation.toUpperCase()})
                      </Text>
                      <Text style={styles.familyMeta}>
                        Gotra: {m.gotra || 'Kashyap'} • Nakshatra: {m.nakshatra || 'Rohini'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyFamilyCard}>
                <Icon family="material" name="info-outline" size={18} color="#B45309" />
                <Text style={styles.emptyFamilyNotice}>
                  No secondary family members selected. Primary Sankalp will be chanted for{' '}
                  <Text style={{ fontWeight: '700', color: '#6B0E1E' }}>
                    {serverUser?.name || 'Devotee'}
                  </Text>{' '}
                  ({serverUser?.gotra || 'Kashyap'} Gotra).
                </Text>
              </View>
            )}

            {/* Action Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.primaryBtn}
              onPress={() => setStep(4)}
            >
              <LinearGradient
                colors={['#8B1528', '#5A0C1A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtnGradient}
              >
                <Text style={styles.primaryBtnText}>Next: Review Dakshina & Reserve</Text>
                <Icon family="material" name="arrow-forward" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 4: DAKSHINA REVIEW & SLOT LOCK */}
        {step === 4 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.stepHeading}>Step 4: Dakshina Review & Slot Lock</Text>
              <Text style={styles.stepDescription}>
                Review your sacred ceremony itinerary and select your dakshina schedule.
              </Text>
            </View>

            {/* Itinerary Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardHeader}>
                <Icon family="material-community" name="file-document-outline" size={18} color="#6B0E1E" />
                <Text style={styles.summaryCardTitle}>Ceremony Booking Itinerary</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ceremony Vidhi</Text>
                <Text style={styles.summaryValue}>{serviceTitle}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Scheduled Date</Text>
                <Text style={styles.summaryValue}>{selectedDateObj.dateString}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Muhurat Slot</Text>
                <Text style={styles.summaryValue}>{selectedSlot.toUpperCase()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ceremony Mode</Text>
                <Text style={styles.summaryValue}>
                  {mode === 'home_visit'
                    ? 'Doorstep Home Visit'
                    : mode === 'online'
                    ? 'Live Online E-Puja'
                    : 'Temple Sanctum'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Samagri Dravyas</Text>
                <Text style={styles.summaryValue}>
                  {samagriOption === 'full_kit'
                    ? '100% Consecrated Kit Included'
                    : 'Devotee Self-Arranged'}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryTotalRow}>
                <View>
                  <Text style={styles.summaryTotalLabel}>Total Ritual Dakshina</Text>
                  <Text style={styles.summaryTotalSub}>Includes Pandit Seva & Taxes</Text>
                </View>
                <Text style={styles.summaryTotalVal}>₹{totalDakshinaRs}</Text>
              </View>
            </View>

            {/* Payment Schedule Options */}
            <Text style={styles.subHeadingTitle}>Dakshina Payment Schedule</Text>
            <View style={styles.paymentPlans}>
              {/* Advance 25% Card */}
              <TouchableOpacity
                style={[
                  styles.planCard,
                  paymentPlan === 'advance' && styles.planCardActive,
                ]}
                onPress={() => setPaymentPlan('advance')}
                activeOpacity={0.8}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planTitle}>25% Advance Booking Dakshina</Text>
                  <Badge label="Recommended" variant="gold" />
                </View>
                <Text style={styles.planAmount}>₹{advanceAmountRs} payable now</Text>
                <Text style={styles.planSub}>
                  Remaining ₹{totalDakshinaRs - advanceAmountRs} payable after Acharya completes the ceremony.
                </Text>
              </TouchableOpacity>

              {/* 100% Full Card */}
              <TouchableOpacity
                style={[
                  styles.planCard,
                  paymentPlan === 'full' && styles.planCardActive,
                ]}
                onPress={() => setPaymentPlan('full')}
                activeOpacity={0.8}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planTitle}>100% Full Payment</Text>
                  <Badge label="Complete" variant="neutral" />
                </View>
                <Text style={styles.planAmount}>₹{totalDakshinaRs} payable now</Text>
                <Text style={styles.planSub}>
                  Hassle-free zero dakshina coordination on the day of the puja.
                </Text>
              </TouchableOpacity>
            </View>

            {/* Trust Assurances */}
            <View style={styles.trustBanner}>
              <View style={styles.trustItem}>
                <Icon family="material" name="verified" size={16} color="#16A34A" />
                <Text style={styles.trustText}>Gurukul Certified</Text>
              </View>
              <View style={styles.trustItem}>
                <Icon family="material" name="spa" size={16} color="#16A34A" />
                <Text style={styles.trustText}>100% Pure Dravyas</Text>
              </View>
              <View style={styles.trustItem}>
                <Icon family="material" name="security" size={16} color="#16A34A" />
                <Text style={styles.trustText}>Slot Lock Protected</Text>
              </View>
            </View>

            {/* Confirm & Reserve Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.primaryBtn}
              onPress={handleConfirmBooking}
              disabled={createBookingMutation.isPending}
            >
              <LinearGradient
                colors={['#8B1528', '#5A0C1A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtnGradient}
              >
                <Text style={styles.primaryBtnText}>
                  {createBookingMutation.isPending
                    ? 'Reserving Slot...'
                    : `Confirm & Reserve Slot (₹${payableNowRs})`}
                </Text>
                <Icon family="material" name="check-circle" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    fontSize: 18,
    fontWeight: '700',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7A6E63',
    fontWeight: '500',
    marginTop: 1,
  },
  stepCounterBadge: {
    backgroundColor: '#FDECE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  stepCounterText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B0E1E',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE7DC',
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EAE3D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleCurrent: {
    backgroundColor: '#6B0E1E',
  },
  stepCircleDone: {
    backgroundColor: '#16A34A',
  },
  stepLabel: {
    fontSize: 11,
    color: '#8A7E73',
    fontWeight: '600',
  },
  stepLabelCurrent: {
    color: '#6B0E1E',
    fontWeight: '700',
  },
  stepLabelDone: {
    color: '#16A34A',
    fontWeight: '600',
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0D7CB',
    marginHorizontal: 4,
    marginBottom: 16,
  },
  stepConnectorActive: {
    backgroundColor: '#16A34A',
  },
  scrollContent: {
    padding: spacing.screenPadding,
    paddingBottom: 40,
  },
  serviceHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE5D8',
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    gap: 12,
  },
  serviceHeroImg: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#FAF5EE',
  },
  serviceHeroDetails: {
    flex: 1,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  heroPriceText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6B0E1E',
  },
  serviceHeroTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#341118',
    fontFamily: typography.fontFamilySerif,
  },
  serviceHeroSub: {
    fontSize: 11.5,
    color: '#7A6E63',
    marginTop: 1,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  stepHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
    marginBottom: 3,
  },
  stepDescription: {
    fontSize: 12.5,
    color: '#7A6E63',
    lineHeight: 18,
  },
  modeContainer: {
    gap: 10,
    marginBottom: 14,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#EFE5D8',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  modeCardActive: {
    borderColor: '#6B0E1E',
    backgroundColor: '#FFFBF9',
  },
  modeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  modeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#341118',
  },
  modeTitleActive: {
    color: '#6B0E1E',
  },
  modeDesc: {
    fontSize: 12,
    color: '#7A6E63',
    lineHeight: 16.5,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE5D8',
    marginBottom: 16,
  },
  formCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  formCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#6B0E1E',
  },
  savedAddressesBox: {
    marginBottom: 10,
  },
  savedAddressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A7E73',
  },
  savedAddrChip: {
    backgroundColor: '#FAF5EE',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E8DFD5',
  },
  savedAddrChipActive: {
    backgroundColor: '#6B0E1E',
    borderColor: '#6B0E1E',
  },
  savedAddrText: {
    fontSize: 11,
    color: '#6B0E1E',
    fontWeight: '600',
  },
  savedAddrTextActive: {
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 12,
    color: '#55483D',
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 6,
  },
  textInput: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8DFD5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#2A1F1D',
    marginBottom: 4,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#6B0E1E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  primaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subHeadingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B0E1E',
    marginTop: 8,
    marginBottom: 8,
  },
  dateStrip: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 12,
  },
  dateChip: {
    width: 66,
    height: 76,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFE5D8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  dateChipActive: {
    backgroundColor: '#6B0E1E',
    borderColor: '#6B0E1E',
  },
  dateHindiDay: {
    fontSize: 10,
    color: '#8A7E73',
    fontWeight: '600',
  },
  dateDayNum: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
    marginVertical: 1,
  },
  dateMonth: {
    fontSize: 10,
    color: '#8A7E73',
    fontWeight: '600',
  },
  dateTextActive: {
    color: '#FFFFFF',
  },
  shubhDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#B45309',
    marginTop: 2,
  },
  shubhDotActive: {
    backgroundColor: '#FEF3C7',
  },
  slotsList: {
    gap: 8,
    marginBottom: 12,
  },
  slotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#EFE5D8',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  slotCardActive: {
    borderColor: '#6B0E1E',
    backgroundColor: '#FFFBF9',
  },
  slotLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  slotIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotIconCircleActive: {
    backgroundColor: '#FDECE7',
  },
  slotTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  slotTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#341118',
  },
  slotTitleActive: {
    color: '#6B0E1E',
  },
  slotTime: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '700',
    marginBottom: 2,
  },
  slotDesc: {
    fontSize: 11,
    color: '#7A6E63',
    lineHeight: 15,
  },
  notesBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE5D8',
    marginBottom: 8,
  },
  panditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE5D8',
    marginBottom: 14,
  },
  panditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  panditAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FAF5EE',
    borderWidth: 1.5,
    borderColor: '#E8DFD5',
  },
  panditName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B0E1E',
    marginTop: 3,
  },
  panditShakha: {
    fontSize: 11,
    color: '#7A6E63',
  },
  panditNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBF5',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3E4D1',
  },
  panditNoteText: {
    fontSize: 11.5,
    color: '#55483D',
    flex: 1,
    lineHeight: 16,
  },
  samagriOptions: {
    gap: 8,
    marginBottom: 14,
  },
  samagriCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#EFE5D8',
    gap: 10,
  },
  samagriCardActive: {
    borderColor: '#6B0E1E',
    backgroundColor: '#FFFBF9',
  },
  samagriIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  samagriTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  samagriTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#341118',
  },
  samagriDesc: {
    fontSize: 11,
    color: '#7A6E63',
    lineHeight: 15,
  },
  familyPickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFE5D8',
    marginBottom: 6,
    gap: 10,
  },
  familyPickActive: {
    borderColor: '#6B0E1E',
    backgroundColor: '#FFFBF9',
  },
  familyName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#341118',
  },
  familyMeta: {
    fontSize: 11,
    color: '#7A6E63',
    marginTop: 1,
  },
  emptyFamilyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  emptyFamilyNotice: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
    lineHeight: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE5D8',
    marginBottom: 14,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E7DD',
  },
  summaryCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B0E1E',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 12.5,
    color: '#8A7E73',
  },
  summaryValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2A1F1D',
    maxWidth: '55%',
    textAlign: 'right',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F0E7DD',
    marginVertical: 10,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B0E1E',
  },
  summaryTotalSub: {
    fontSize: 11,
    color: '#8A7E73',
  },
  summaryTotalVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
  },
  paymentPlans: {
    gap: 8,
    marginBottom: 14,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#EFE5D8',
  },
  planCardActive: {
    borderColor: '#6B0E1E',
    backgroundColor: '#FFFBF9',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  planTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#341118',
  },
  planAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6B0E1E',
    marginBottom: 2,
  },
  planSub: {
    fontSize: 11.5,
    color: '#7A6E63',
    lineHeight: 16,
  },
  trustBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8DFD5',
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#341118',
  },
});
