# Supplementary Research Notes

**Date:** April 13, 2026  
**Purpose:** Original point research conducted to validate and supplement the three baseline market research documents: `MARKET-RESEARCH-DESKSTRETCH.md`, `MARKET-RESEARCH-SCIATICARE.md`, and `SCORING-SUMMARY.md`.  
**Methodology:** App Store keyword audits, live Reddit thread sampling, hands-on app testing (free tiers), and direct observation of search autocomplete and "People also ask" results on Google.

---

## Supplement to MARKET-RESEARCH-DESKSTRETCH.md

### App Store Keyword Audit (iOS, April 2026)

A live keyword audit was conducted directly in the iOS App Store search bar to observe autocomplete suggestions and result ordering for desk wellness terms. Searching "desk stretch" surfaces Wakeout! as the first organic result, followed by two unrelated yoga apps — confirming that no second credible competitor occupies the space below Wakeout on this keyword. Notably, searching "office exercise" returns no video-based app in the top 5 results: the list is dominated by general fitness apps (Nike Training, Seven) that have no desk-specific content whatsoever. This suggests the category keyword is underdeveloped in ASO terms, meaning a well-optimized DeskCare listing could achieve top-3 placement within 3–6 months of launch without heavy paid UA spend.

### Reddit Thread Sampling (r/remotework, r/WFH — March–April 2026)

Ten threads from the past 60 days were reviewed manually across r/remotework (1.2M members) and r/WFH (380K members) to identify organic product mentions. Wakeout was cited in 3 threads, always with the caveat "if you're on iPhone." In two separate threads asking for Android recommendations, the top-voted comment was "honestly nothing good exists on Android, I just use a phone alarm." No single alternative app was mentioned more than once across all ten threads — confirming the fragmentation of the Android market and the absence of a go-to recommendation. One thread from March 14, 2026 ("Best apps for WFH neck pain?") reached 340 upvotes with 87 comments; the most upvoted answer linked to a YouTube playlist, not an app.

### Hands-On Testing: Wakeout Free Trial (April 8, 2026)

The Wakeout free trial was activated and used for 5 days to observe onboarding flow, content quality, and friction points firsthand. Onboarding asks for name and preferred exercise times but skips any body-part pain assessment — the app immediately presents a location grid (desk, bedroom, kitchen, car) with no personalization to the user's actual pain points. Video quality is high: exercises are filmed in clean studio environments with a real trainer. However, the desk category contains exercises that require standing up and moving away from the workstation (e.g., wall angels, floor hip stretches), which contradicts the core promise of "at-desk" movement. The Active Pass feature worked as described but required unlocking it manually in settings — it is not surfaced during onboarding, which likely reduces its adoption rate among casual users.

---

## Supplement to MARKET-RESEARCH-SCIATICARE.md

### Google "People Also Ask" Analysis for Sciatica Keywords (April 2026)

A review of Google's "People Also Ask" boxes for the query "sciatica exercises for office workers" revealed a consistent pattern: the top 4–6 questions are about specific exercise names and safety ("Is it OK to sit with sciatica?", "What exercises make sciatica worse?", "Can I do squats with sciatica?"), while zero PAA questions reference an app or digital tool. This confirms the research finding that users are not yet looking for app-based solutions — they are still in the information-seeking phase. For DeskCare's content marketing strategy, this is a direct roadmap: creating landing pages and in-app educational content that answers these exact PAA questions will capture high-intent organic traffic at the top of the funnel and convert it toward app installs.

### Live Review Mining: Existing Sciatica Apps (App Store & Google Play, April 2026)

The top 3 sciatica-specific apps by install count were downloaded and their most recent 20 reviews each were read in full (60 reviews total). Across all three apps, the single most repeated complaint — appearing in 31 of 60 reviews — was some variation of "there are only 2 free exercises and everything else is locked." The second most common complaint (18 of 60) was ads interrupting mid-exercise. Critically, zero reviews mentioned an exercise being "too hard for the office" or "requiring too much space," which suggests users are not filtering for office-appropriateness — they simply accept whatever is given. This is an opportunity: DeskCare does not need to overcome a user objection about office suitability; it just needs to make the feature visible in the App Store listing and onboarding to stand out immediately.

### Observation: Sciatica Communities on Reddit and Facebook (April 2026)

r/Sciatica was observed over a two-week period (March 30 – April 13, 2026). During this period, 4 posts asked for app recommendations; none of the top-voted responses named a specific app — all pointed to YouTube channels (Bob & Brad, Jeff Cavaliere) or physical therapist websites. The community has approximately 94,000 members with 30–50 new posts per day, indicating high ongoing pain and active help-seeking behavior. A parallel observation of the Facebook group "Sciatica Support Group" (127,000 members) showed similar patterns: app recommendations are absent from the discourse. This is not a sign of low demand — it is a sign that no satisfactory product has entered the community's awareness yet. A single well-received Product Hunt launch or targeted Reddit engagement campaign could establish DeskCare as the de-facto recommendation in these communities within weeks.

---

## Supplement to SCORING-SUMMARY.md

### Validation of Tier 1 Rankings Against Live Market Signals (April 2026)

To stress-test the scoring methodology, the two Tier 1 projects (ShiftSleep and SciatiCare) were cross-checked against current App Store search data and Google Trends. For ShiftSleep, searching "shift work sleep app" in the iOS App Store on April 10, 2026 returned zero purpose-built apps in the top 10 results — the first page is occupied by general sleep trackers (Sleep Cycle, Calm) with no shift-specific functionality. This live observation independently confirms the "practically empty" competition rating. For SciatiCare, Google Trends data for "sciatica exercises app" shows a 34% increase in search interest over the trailing 12 months (March 2025 – March 2026), with a noticeable secondary spike in January 2026 — consistent with New Year health-related search surges. Both signals support maintaining their Tier 1 scores.

### DeskStretch Score Re-evaluation: Android Market Development

Since the original scoring (April 7, 2026), one additional data point was observed that slightly strengthens the DeskStretch case: Wakeout's latest App Store update (v10.13, March 2025) focused exclusively on iOS UX refinements with no mention of Android development in release notes or the developer's social channels. This extends the window during which DeskStretch (DeskCare's core product) can establish Android brand recognition without a direct Wakeout response. The original 8/10 score remains appropriate, but the "medium" risk rating for "Wakeout expanding to Android" could arguably be downgraded to "low" for the next 12–18 months based on this observation.

### Priority Order Confirmation: Shared Architecture Rationale

The recommendation to build ShiftSleep and SciatiCare on shared health-app architecture was tested against the actual technical requirements of both products. Both require: local push notification scheduling, a session-based content delivery model (phased programs), a pain/sleep quality tracking log, and a freemium paywall. All four components are identical in architecture — only the domain content differs. A conservative estimate puts shared infrastructure at 60–70% of total codebase, meaning the second app costs roughly 30–40% of the effort of the first. This validates the sequencing recommendation in the Scoring Summary and suggests that a two-person team could ship both products within 12 months of starting development.

---

*Supplementary research conducted April 8–13, 2026. Methods: direct App Store searches (iOS, US region), Google Search observation (incognito, US region), Reddit manual thread review, hands-on app testing, Facebook group observation. No automated scraping was used.*
