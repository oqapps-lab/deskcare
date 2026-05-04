# DeskCare — TestFlight Release Playbook

This is the end-to-end recipe for shipping DeskCare to TestFlight from a fresh
clone. **All steps after the "VPS-side prep" block run on the Mac** — Claude
Code on the VPS only handles the code, ASC API calls and documentation.

> Bundle ID: `com.gazetastreet.deskcare` (registered at ASC, ID `7BWX3274Y3`)
> Apple Team: `6Y6BFVDS4L`
> Capabilities enabled: `IN_APP_PURCHASE`, `PUSH_NOTIFICATIONS`, `APPLE_ID_AUTH` (Primary App Consent)

---

## 0. VPS-side prep (already done at code commit)

Done in the commit that ships this doc:

- Bundle ID + capabilities registered at ASC via API
- `expo-apple-authentication` + `@react-native-google-signin/google-signin` added to deps
- `useAuth` extended with `signInWithApple` + `signInWithGoogle`
- Sign-in + Sign-up screens use the official Apple button + a Google fallback
- `lib/premium.ts` with `EXPO_PUBLIC_PREMIUM_BYPASS=1` for TF-internal
- Premium gates in Library, Exercise Detail, Programs respect the bypass
- Adapty SDK activates from `_layout.tsx` when `EXPO_PUBLIC_ADAPTY_KEY` is set
- Paywall has both stub (TF) and Adapty fallback flows + Restore Purchases wired
- `app.json` → `app.config.ts` (env-driven plugins, version `1.0.0`)
- `eas.json` with `development` / `preview` / `production` profiles
- Pre-TF QA matrix — `docs/07-development/QA-PRE-TF.md`

---

## 1. Mac — install dependencies

```bash
cd ~/Desktop/work/APP_DEVELOPMENT/deskcare
git pull
npm install
```

Three new packages will resolve: `expo-apple-authentication`,
`@react-native-google-signin/google-signin`, `react-native-adapty`
(already in `package.json` from earlier).

Verify with `npm run typecheck`. Should pass clean.

---

## 2. Mac — configure third-party providers

### 2.1 Supabase Apple OAuth provider

1. Apple Developer → Certificates, Identifiers & Profiles → Identifiers → Services IDs.
2. Click **+**, register a Services ID (e.g. `com.gazetastreet.deskcare.signin`).
3. Enable **Sign In with Apple**, click Configure → choose primary App ID
   `com.gazetastreet.deskcare` (the bundle we registered) → set **return URLs** to
   `https://wnmjdxmrpmucfoluxhly.supabase.co/auth/v1/callback`.
4. Apple Developer → Keys → **+** → check **Sign In with Apple**, configure → primary App ID.
   Download the `.p8` and note the **Key ID**.
5. Supabase dashboard → Authentication → Providers → Apple → enable.
   - Services ID: the one from step 2
   - Team ID: `6Y6BFVDS4L`
   - Key ID: from step 4
   - Private Key: paste the `.p8` content
6. Test: from the iOS dev build, tap "Continue with Apple" → consent → land in `/main/home`.

### 2.2 Google OAuth client + Supabase Google provider

1. Google Cloud Console → APIs & Services → Credentials → **Create credentials → OAuth 2.0 Client ID**.
2. Create **two** clients:
   - **Web** (for Supabase to validate id tokens). Note the Web client ID.
   - **iOS** (for the iOS app). Use bundle ID `com.gazetastreet.deskcare`. Note the iOS client ID.
3. Note the iOS client ID's reversed form (URL scheme) — looks like
   `com.googleusercontent.apps.123456789-xxxxxxxxxxxx`.
4. Supabase dashboard → Authentication → Providers → Google → enable.
   - Authorized client IDs: paste the **Web client ID** (and optionally the iOS client ID).
5. Add to `.env.local`:
   ```
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<web-client-id>
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<ios-client-id>
   EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME=com.googleusercontent.apps.<reversed-ios>
   ```
6. The `app.config.ts` plugin block reads `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME` and
   wires the Google plugin only when set. No code changes needed.

### 2.3 Adapty (skip for first TF-internal pass)

For the first internal TF, set `EXPO_PUBLIC_PREMIUM_BYPASS=1` in `eas.json` env
(already wired in `preview` profile). Real Adapty + IAP setup happens before
external TF / App Store launch:

1. Adapty dashboard → create app linked to bundle `com.gazetastreet.deskcare`.
2. Note the **Public SDK key** → set `EXPO_PUBLIC_ADAPTY_KEY` in `.env.local`.
3. App Store Connect → Apps → DeskCare → Subscriptions →
   create products `pro_monthly`, `pro_annual`.
4. Adapty → Paywalls → create `default` placement → attach products.
5. Wire the Adapty webhook → Supabase Edge Function → upsert `deskcare_subscriptions`.

---

## 3. Mac — create the App Store Connect listing (one-time, manual)

The ASC API does not allow creating apps. Done by hand:

1. App Store Connect → Apps → **+** → New App.
2. Platforms: iOS.
3. Name: **DeskCare**.
4. Primary language: English (U.S.).
5. Bundle ID: select `com.gazetastreet.deskcare — DeskCare` (already registered).
6. SKU: `DESKCARE-IOS-001`.
7. User Access: Full Access.

App listing now shows up in the API too — `apps` row with the ID we'll use for `eas submit`.

---

## 4. Mac — first build

### 4.1 Init EAS for this project

```bash
npx eas-cli login          # one-time
npx eas-cli init           # registers a project ID; prompt to link to gazetastreet org
```

This writes the EAS project ID into `app.config.ts` (`extra.eas.projectId`).
**Commit + push that change** — the project ID needs to live in version control.

### 4.2 Preview build (TF-internal)

```bash
npx eas-cli build --profile preview --platform ios
```

This:
- runs `expo prebuild` to generate native iOS project
- uploads to EAS cloud
- signs with auto-generated provisioning + distribution cert
- produces a `.ipa` for ad-hoc / TestFlight distribution

Build takes ~12-25 minutes.

### 4.3 Submit to TestFlight

```bash
npx eas-cli submit --profile production --platform ios --latest
```

The `submit.production.ios` block in `eas.json` already references the Apple
ASC API key at `~/.appstoreconnect/private_keys/AuthKey_787835NFD8.p8`, key ID
`787835NFD8`, issuer `2f01e90d-…`, team `6Y6BFVDS4L`. No interactive prompts.

After upload (~5 min) → Apple processes the build (~10-30 min) → it appears
in TestFlight under **Internal Testing**. Add yourself as a tester via
ASC → TestFlight → Internal Testing → Testers → add Apple ID.

---

## 5. Mac — TestFlight smoke

1. Install TestFlight from the App Store on the test phone.
2. Open the email invite, tap "Accept" → install build.
3. Run the full `docs/07-development/QA-PRE-TF.md` checklist on a real device.
4. File regressions as a doc append (`Regressions found this pass:` section).

---

## Troubleshooting

### `eas build` fails with "BundleId not found"
The bundle ID `com.gazetastreet.deskcare` is registered (`7BWX3274Y3`) but
`appleTeamId` is wrong somewhere. Check `eas.json` `submit.production.ios.appleTeamId`
matches `6Y6BFVDS4L`.

### `eas submit` fails with "App not found"
You skipped step 3 (manual app listing). Bundle ID alone isn't enough — ASC
needs the app row to exist before it accepts submissions.

### Apple Sign-In sheet shows briefly then closes with no error
The Services ID / Key ID configuration in Supabase is wrong. Re-check
section 2.1; the `.p8` content must include the `-----BEGIN PRIVATE KEY-----` and
`-----END PRIVATE KEY-----` markers.

### Google Sign-In returns "DEVELOPER_ERROR"
Bundle ID mismatch in the iOS OAuth client at Google Cloud Console.
Bundle in client must be EXACTLY `com.gazetastreet.deskcare`.

### Build succeeds but app crashes on launch with "Adapty not activated"
You set `EXPO_PUBLIC_ADAPTY_KEY` to an invalid value. Either set a real key
or unset the env var entirely — the activation block only fires when the
variable is non-empty.

### Push notifications don't fire on TestFlight build
Local notifications (the `scheduleDailyReminder` flow) work in TestFlight.
Remote push (FCM/APNS) needs the push notification capability + an APNs Auth
Key set in Adapty / Supabase / your push backend. The capability is already
enabled at ASC; the auth key wiring is Stage 8 (post-TF).

---

_Last updated 2026-05-04. Maintainer: Claude / @gazetastreet._
