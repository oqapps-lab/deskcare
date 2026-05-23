# Adapty dashboard setup — DeskCare v1.0

**Status:** ⏳ Pending — ASC IAP products created via API on 2026-05-23, Adapty mapping is manual dashboard work (~5 min).

**Blocks:** real-money purchases in retail builds (current TF #34 has `PREMIUM_BYPASS=1` so paywall is cosmetic and bypassable).

## Prerequisites (verify before starting)

- [x] ASC IAP products created (annual/weekly/monthly in group `deskcare_pro`)
- [x] All 3 have 13 locales + USA price + review screenshot
- [x] App `.env.local` already has `EXPO_PUBLIC_ADAPTY_KEY=public_live_qQdab6dY.QG2obAJ349l36yOsSV7T`
- [ ] You're logged into [app.adapty.io](https://app.adapty.io) → DeskCare app

## Steps

### 1. Map ASC products to Adapty (1 min)

**Adapty → Products → New product** × 3:

| Adapty internal ID | iOS product ID (must match ASC exactly) | Duration |
|---|---|---|
| `deskcare_annual` | `com.gazetastreet.deskcare.sub.annual` | 1 year |
| `deskcare_monthly` | `com.gazetastreet.deskcare.sub.monthly` | 1 month |
| `deskcare_weekly` | `com.gazetastreet.deskcare.sub.weekly` | 1 week |

Apple side automatically fills price ($34.99/$9.99/$3.99) once the IAP transitions to `READY_TO_SUBMIT` (after first app review submission references the bundle).

### 2. Create paywall (2 min)

**Adapty → Paywalls → New "deskcare_default_v1"**:

- **Products** (order = visual order):
  1. `deskcare_annual` (mark as **default**)
  2. `deskcare_weekly`
  3. `deskcare_monthly` (will be hidden by app UI behind "View all plans")
- **Remote config JSON** (optional, app reads only product list — no UI from Adapty):
  ```json
  { "default_product": "deskcare_annual" }
  ```
- Save.

### 3. Bind paywall to placement (1 min)

**Adapty → Placements**:

- The app code calls `adapty.getPaywall('default')` → placement developerId **must be `default`**.
- Edit existing `default` placement (or create) → **Attached paywall = `deskcare_default_v1`**.
- Audience: All users.
- Save.

### 4. Connect ASC integration (1 min, one-time)

**Adapty → Settings → Integrations → App Store Connect**:

| Field | Where to find |
|---|---|
| Apple App ID | `6767548896` (from ASC URL) |
| App-Specific Shared Secret | ASC → DeskCare → App Information → "App-Specific Shared Secret" → Generate |
| IAP API Key (key ID + .p8) | ASC → Users & Access → Integrations → **In-App Purchase** → New API Key. Don't reuse existing `787835NFD8` — Adapty needs IAP-scoped one |
| Webhook URL | Adapty auto-generates; copy and paste into ASC → App Information → App Store Server Notifications V2 → Production URL |

## Verification (post-setup)

After all 4 steps:

```ts
// In dev/Expo Go: should log a product map
adapty.getPaywall('default').then(pw => adapty.getPaywallProducts(pw)).then(console.log);
```

Expect 3 products with `subscriptionPeriod.unit` in (`year`, `week`, `month`) and matching ASC IDs.

## State of repo code (already wired)

- `app/_layout.tsx:26` — `adapty.activate(EXPO_PUBLIC_ADAPTY_KEY)` runs at app boot
- `app/onboarding/paywall.tsx:111` — calls `adapty.getPaywall('default')` then matches by period unit
- `lib/premium.ts` — `useIsPremium()` currently returns `PREMIUM_BYPASS` constant; for retail, switch to reading `adapty.getProfile()` → `accessLevels.premium.isActive`

No code changes needed for Adapty mapping — dashboard config alone is sufficient.

## Why this is not in `services/adapty.md`

The skill's `adapty` reference covers the **CLI setup + Codemagic env vars**. This doc is specifically the **per-paywall product/placement mapping** which is manual dashboard work on every project (Adapty's management API requires Pro+ plan + auth tokens that aren't in `~/.claude/secrets/`).
