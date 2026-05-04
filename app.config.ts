import type { ExpoConfig } from 'expo/config';

const googleIosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;

const config: ExpoConfig = {
  name: 'DeskCare',
  slug: 'deskcare',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'deskcare',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.gazetastreet.deskcare',
    buildNumber: '1',
    usesAppleSignIn: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
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
