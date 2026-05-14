# Running DeskCare Locally

## Prerequisites

- Node.js 18+
- [Expo Go](https://expo.dev/go) on your phone (iOS or Android)

## Setup

```bash
git clone https://github.com/oqapps-lab/deskcare.git
cd deskcare
npm install --legacy-peer-deps
```

## Start

```bash
npm start
```

Metro Bundler starts and prints a QR code in the terminal.

| Target | How |
|--------|-----|
| **Phone** | Scan QR with Expo Go (same Wi-Fi network) |
| **Browser** | Press `w` in the terminal, opens `localhost:8081` |
| **iOS Sim** | Press `i` (requires Xcode) |
| **Android Sim** | Press `a` (requires Android Studio) |

## Navigate screens directly (browser)

| Screen | URL |
|--------|-----|
| Welcome | `localhost:8081/` |
| Home | `localhost:8081/home` |
| Routine Preview | `localhost:8081/routine` |
| Exercise Player | `localhost:8081/player` |
| Progress | `localhost:8081/progress` |
| Profile | `localhost:8081/profile` |
| Settings | `localhost:8081/settings` |
| Onboarding | `localhost:8081/onboarding` |
| Quiz | `localhost:8081/quiz` |

## Verify setup

```bash
npx tsc --noEmit      # 0 errors expected
npx expo-doctor       # 18/18 checks expected
```

## Notes

- All data is mocked — no backend needed (`mock/data.ts`)
- No `.env` required for the prototype phase
- Design tokens live in `constants/tokens.ts`
