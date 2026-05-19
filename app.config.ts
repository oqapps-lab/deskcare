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
    // buildNumber + versionCode are managed by EAS (`appVersionSource: remote`
    // in eas.json) — setting them here triggers a warning AND is ignored.
    usesAppleSignIn: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      UIBackgroundModes: ['remote-notification'],
      // AppsFlyer + Apple ATT prompt copy. Surfaced as the system sheet
      // the first time tracking is requested. Wording follows Apple's
      // editorial review ("explain in plain language what data is used").
      NSUserTrackingUsageDescription:
        'DeskCare uses anonymized data to measure which referrals bring helpful users — never identifying you personally.',
    },
  },
  android: {
    package: 'com.gazetastreet.deskcare',
  },
  plugins: [
    'expo-router',
    'expo-apple-authentication',
    'expo-image',
    'expo-video',
    [
      'expo-notifications',
      {
        color: '#E87B4E',
      },
    ],
    ...(googleIosUrlScheme
      ? [['@react-native-google-signin/google-signin', { iosUrlScheme: googleIosUrlScheme }] as [string, Record<string, unknown>]]
      : []),
  ],
  experiments: {
    typedRoutes: true,
  },
  owner: 'gazetastreet',
  extra: {
    eas: {
      projectId: 'cf7555e8-a507-41cb-a43a-dd88f8da0de1',
    },
  },
};

export default config;
