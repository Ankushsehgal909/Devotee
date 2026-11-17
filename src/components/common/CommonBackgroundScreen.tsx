import React, { useEffect } from 'react';
import {
  Image,
  StyleSheet,
  View,
  ViewStyle,
  ImageSourcePropType,
  StatusBar,
  StatusBarStyle,
  StyleProp,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ImageResizeMode,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { localImages } from '../../constants/images';

export interface CommonBackgroundScreenProps {
  children: React.ReactNode;
  /** Custom background image source, defaults to loginImage.jpg */
  backgroundImage?: ImageSourcePropType;
  /** Resize mode for background image. Defaults to 'stretch' */
  resizeMode?: ImageResizeMode;
  /**
   * Optional color overlay to tint the background image if needed.
   * Defaults to null so the image's original colors and artwork remain vibrant.
   */
  overlayColor?: string | null;
  /** Optional opacity for the overlay layer. Defaults to 1 */
  overlayOpacity?: number;
  /** Blur radius for background image */
  blurRadius?: number;
  /** Whether to wrap children in SafeAreaView. Defaults to true */
  useSafeArea?: boolean;
  /** Edges for SafeAreaView. Defaults to ['top', 'bottom', 'left', 'right'] */
  safeAreaEdges?: Edge[];
  /** Outer container style */
  style?: StyleProp<ViewStyle>;
  /** Inner content container style */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** ScrollView content container style when scrollable is true */
  scrollContentContainerStyle?: StyleProp<ViewStyle>;
  /** Status bar style: 'light-content' | 'dark-content' | 'default'. Defaults to 'dark-content' */
  statusBarStyle?: StatusBarStyle;
  /** Whether status bar is translucent on Android. Defaults to true */
  statusBarTranslucent?: boolean;
  /** Automatically wrap in KeyboardAvoidingView + ScrollView. Defaults to false */
  scrollable?: boolean;
  /** Wrap in KeyboardAvoidingView if scrollable is false. Defaults to false */
  keyboardAvoiding?: boolean;
  /** Test identifier */
  testID?: string;
}

export const CommonBackgroundScreen: React.FC<CommonBackgroundScreenProps> = ({
  children,
  backgroundImage = localImages.loginBackground,
  resizeMode = 'stretch',
  overlayColor = null,
  overlayOpacity = 1,
  blurRadius,
  useSafeArea = true,
  safeAreaEdges = ['top', 'bottom', 'left', 'right'],
  style,
  contentContainerStyle,
  scrollContentContainerStyle,
  statusBarStyle = 'dark-content',
  statusBarTranslucent = true,
  scrollable = false,
  keyboardAvoiding = false,
  testID = 'common-background-screen',
}) => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      (StatusBar as any).setBackgroundColor?.('transparent');
      (StatusBar as any).setTranslucent?.(statusBarTranslucent);
    }
  }, [statusBarTranslucent]);

  const renderInnerContent = () => {
    if (scrollable) {
      return (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={[styles.scrollContent, scrollContentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      );
    }

    if (keyboardAvoiding) {
      return (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          {children}
        </KeyboardAvoidingView>
      );
    }

    return children;
  };

  const content = renderInnerContent();

  return (
    <View testID={testID} style={[styles.container, style]}>
      {/* Background Image Layer */}
      <Image
        source={backgroundImage}
        style={[StyleSheet.absoluteFill, styles.backgroundImage]}
        resizeMode={resizeMode}
        blurRadius={blurRadius}
      />

      <StatusBar barStyle={statusBarStyle} />

      {/* Contrast Overlay Layer */}
      {overlayColor && overlayColor !== 'transparent' ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: overlayColor, opacity: overlayOpacity },
          ]}
          pointerEvents="none"
        />
      ) : null}

      {/* Main Content (SafeArea or View) */}
      {useSafeArea ? (
        <SafeAreaView style={[styles.contentWrapper, contentContainerStyle]} edges={safeAreaEdges}>
          {content}
        </SafeAreaView>
      ) : (
        <View style={[styles.contentWrapper, contentContainerStyle]}>{content}</View>
      )}
    </View>
  );
};

// Convenient alias
export const BackgroundScreen = CommonBackgroundScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  contentWrapper: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
