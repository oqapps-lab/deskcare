import Constants from 'expo-constants';

/**
 * True when the JS is running inside the public Expo Go shell (which lacks
 * any third-party native modules: Adapty, AppsFlyer, expo-apple-authentication,
 * google-signin). Use this flag to skip native-only code paths so the app
 * stays usable for QA via Expo Go.
 *
 * In dev/preview/production EAS builds this is always false — those builds
 * bundle the native modules and the SDKs work normally.
 */
export const IS_EXPO_GO = Constants.appOwnership === 'expo';
