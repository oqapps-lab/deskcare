import React from 'react';
import type { ViewStyle } from 'react-native';
import { IS_EXPO_GO } from '../../lib/native-runtime';

// `expo-apple-authentication` is a native module and crashes at import time
// inside Expo Go. We lazy-`require()` it so the screen still renders for QA;
// when the module isn't present, this component renders nothing (the Apple
// button just disappears in Expo Go, leaving the rest of the auth screen
// usable).
let AppleAuth: any = null;
if (!IS_EXPO_GO) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    AppleAuth = require('expo-apple-authentication');
  } catch {
    AppleAuth = null;
  }
}

export interface AppleSignInButtonProps {
  /** "continue" → Sign In, "sign_up" → Sign Up button copy. */
  variant?: 'continue' | 'sign_up';
  onPress: () => void;
  style?: ViewStyle;
}

export const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({
  variant = 'continue',
  onPress,
  style,
}) => {
  if (!AppleAuth) return null;
  const buttonType =
    variant === 'continue'
      ? AppleAuth.AppleAuthenticationButtonType.CONTINUE
      : AppleAuth.AppleAuthenticationButtonType.SIGN_UP;
  return (
    <AppleAuth.AppleAuthenticationButton
      buttonType={buttonType}
      buttonStyle={AppleAuth.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={999}
      style={style}
      onPress={onPress}
    />
  );
};
