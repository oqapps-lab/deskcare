import type { ExpoConfig } from 'expo/config';

const googleIosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;

const config: ExpoConfig = {
  name: 'DeskCare',
  slug: 'deskcare',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'deskcare',
  userInterfaceStyle: 'light',
  // Primary icon — selected from `icons/candidates/icon-A.png`. After the
  // app goes live in App Store, an alternate-icons PPO test surfaces the
  // other 3 candidates (B, C, D) — see `icons/ICON_TESTING.md`.
  icon: './assets/icon.png',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.gazetastreet.deskcare',
    buildNumber: '1',
    usesAppleSignIn: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      // AppsFlyer + Apple ATT prompt copy. Surfaced as the system sheet
      // the first time tracking is requested. Wording follows Apple's
      // editorial review ("explain in plain language what data is used").
      NSUserTrackingUsageDescription:
        'DeskCare uses anonymized data to measure which referrals bring helpful users — never identifying you personally.',
    },
  },
  android: {
    package: 'com.gazetastreet.deskcare',
    versionCode: 1,
  },
  plugins: [
    'expo-router',
    'expo-apple-authentication',
    'expo-video',
    [
      'expo-notifications',
      {
        color: '#E87B4E',
      },
    ],
    ...(googleIosUrlScheme
      ? [['@react-native-google-signin/google-signin', { iosUrlScheme: googleIosUrlScheme }]]
      : []),
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
