# DeskCare — Run Local

How to launch DeskCare design-review build on your simulator / device.

---

## Requirements

- Node 20 LTS (Node 25 breaks `@expo/ngrok`; if you're on 25, use `--lan` not `--tunnel`)
- npm 10+
- One of:
  - iOS Simulator (macOS) + Expo Go
  - Android Emulator + Expo Go
  - Physical iPhone / Android + Expo Go app

This batch targets **design review**, not production builds. We ship via Expo Go.

---

## 1. Clone

```bash
git clone https://github.com/oqapps-lab/deskcare.git
cd deskcare
```

## 2. Install

**Mandatory flag** (reanimated v4 peer conflict with RN 0.83):

```bash
npm install --legacy-peer-deps
```

Then align native modules to Expo SDK 55:

```bash
npx expo install --fix
```

If `ERESOLVE` or `Cannot find module 'react-native-worklets/plugin'` — re-run with the flag above.

## 3. Start Metro

```bash
npm start
```

This runs `expo start --lan --port 8082`. Metro binds to `0.0.0.0:8082`.

Verify reachability from another device on the same network:

```bash
curl http://<your-LAN-IP>:8082/status
# Expected: "packager-status:running"
```

## 4. Open on simulator / device

**iOS simulator (macOS):**

```
i   # from Metro menu, press "i"
```

**Android emulator:**

```
a   # from Metro menu, press "a"
```

**Physical device (Expo Go app):**
- Open Expo Go → enter URL `exp://<your-LAN-IP>:8082`
- Or scan QR code from the Metro terminal.

---

## 5. Navigation map

The app opens on the **design-review hub** (`/`). From there, tap any row to
visit one of the 7 screens. Back chevron returns to the hub.

| # | Route | Screen | Notes |
|---|---|---|---|
| 01 | `/settings/notifications` | Notification Settings | 4 time pills, 3 settings rows with toggles |
| 02 | `/eye/break` | 30-Second Eye Break | Ghost hero "30", play CTA, SKIP link |
| 03 | `/onboarding/permission` | Permission Prompt | Bell icon with glow, benefits card, gradient CTA |
| 04 | `/eye/session` | Eye Exercise Session | Timer 00:18, infinity icon, transport bar (play toggles timer) |
| 05 | `/errors/no-connection` | Нет подключения | 3D clay wifi-cloud, outlined "Попробовать снова" |
| 06 | `/pain/check-in` | Pain Location + Severity | Animated body map, gradient slider, chip column, floating CTA |
| 07 | `/sync` | Синхронизация | 4 concentric pulse rings, infinite loop |

Each screen uses primitives from `components/ui/`. See
[DESIGN-GUIDE.md](../06-design/DESIGN-GUIDE.md) §6 for primitive composition.

---

## 6. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `ERESOLVE` during `npm install` | reanimated v4 peer conflict | `npm install --legacy-peer-deps` |
| `Cannot find module 'react-native-worklets/plugin'` | peer not auto-installed | `npm i react-native-worklets --legacy-peer-deps` then restart Metro |
| `NativeMicrotasksCxx could not be found` | RN version drift from Expo SDK | `npx expo install --fix` and restart Metro |
| Expo Go shows old bundle | Cache | Shake → "Reload" or terminate Expo Go and re-open URL |
| `react-native-worklets` not found at runtime | babel didn't pick up plugin | Check `babel.config.js` contains `'react-native-worklets/plugin'` (not `'react-native-reanimated/plugin'` — that's the old v3 plugin) |
| BlurView children invisible | `flex:1` inside BlurView collapses height | Use `width:'100%'` + explicit padding (already handled in `<GlassCard>`) |
| Body pain map pulses invisible | reanimated animatedProps need `Animated.createAnimatedComponent` | Already wrapped — ignore |
| Fonts look like system default | Plus Jakarta not loaded yet | Wait ~500ms — `useAppFonts()` renders a blank frame until loaded |
| "No route named X" warning | expo-router typed routes cache stale | Delete `.expo/types` and restart Metro |
| Status bar white on white | Status-bar content colour wrong for light canvas | Already set to `style="dark"` in `<Screen>` |

---

## 7. What's NOT supported yet

- ❌ Real Supabase auth (mock only in Stage 5)
- ❌ Real Adapty subscriptions (Premium badge is cosmetic)
- ❌ Real video playback (Eye Session is a dummy timer + icon)
- ❌ Real push-notification permission flow (button is a placeholder)
- ❌ Dark mode (userInterfaceStyle pinned to "light" for this stage — Sanctuary works only in light)
- ❌ App icon / splash (removed from app.json for design-review builds)
- ❌ Android BlurView parity (we fall back to solid 88% cream — see DESIGN-GUIDE §4)
- ❌ Tab bar (this batch has 7 screens — not enough for tabs yet; comes in Batch 2)

All of the above lands in Stage 6 (Integration) per
[CLAUDE.md](../../CLAUDE.md) and
[PRODUCT-VISION.md](../02-product/PRODUCT-VISION.md).

---

## 8. Design-review checklist

When walking the 7 screens on the simulator, verify:

- [ ] Background gradient is visible (cream top → peach bottom), not flat
- [ ] Three radial orbs are visible (coral top-right, peach mid-left, lavender bottom-center)
- [ ] All CTAs show 3-stop coral gradient + outer warm glow (not flat)
- [ ] Haptics fire on CTA, chip, toggle
- [ ] Toggle animation is smooth (thumb glides 180ms)
- [ ] Sync rings pulse outward with stagger (0 / 400 / 800 / 1200ms offsets)
- [ ] Body map pain dots breathe (scale + opacity loop)
- [ ] Hero "30" on eye break has translucent ghost behind
- [ ] Back chevron returns to hub without crash
- [ ] Reduce Motion — open iOS Settings → Accessibility → Motion → Reduce Motion ON → re-open app — all loops should fade-only

---

## 9. Reference

- [DESIGN-GUIDE.md](../06-design/DESIGN-GUIDE.md) — authoritative design spec
- [Stitch screenshots](../06-design/stitch-raw/screenshots/) — reference PNGs
- [SCREEN-MAP.md](../04-ux/SCREEN-MAP.md) — full 39-screen map (batches 2-6 upcoming)
- [stitch-to-native-ui skill](~/.claude/skills/stitch-to-native-ui/SKILL.md) — pipeline doc
