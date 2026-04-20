# DeskCare — Stitch Prompts (все экраны)

**Дата:** 19 апреля 2026
**Основа:** [SCREEN-MAP.md](../04-ux/SCREEN-MAP.md), [WIREFRAMES.md](../04-ux/WIREFRAMES.md), [UX-SPEC.md](../04-ux/UX-SPEC.md), [FEATURES.md](../02-product/FEATURES.md)
**Формула:** [sugar-quit/FORMULA.md](../../../sugar-quit/docs/06-design/style-exploration/FORMULA.md) + [ATOMS-FULL.md](../../../sugar-quit/docs/06-design/style-exploration/ATOMS-FULL.md)

---

## Как пользоваться

1. **Начинай с Prompt #0 (Component Sheet).** Это якорь визуального языка — его результат стоит сохранить и потом использовать как reference image в refine-mode для остальных прогонов.
2. **App-Level промпты запускай в Pro-режиме.** 3–5 экранов за раз. Не объединяй — стиль замыливается.
3. **Не добавляй pixel specs, font names, "widget container", "glass morphism"** — это ломает формулу (см. анти-паттерны в DESIGN-CONTEXT-HANDOFF.md).
4. **Текст в кавычках оставь как есть** (English). Stitch рендерит стабильнее на английском; локализуешь в коде.
5. Если какой-то экран вышел плохо — **НЕ правь через refine**. Перегенерируй с тем же промптом. Если не помогает — скинь мне, подправлю prompt.

---

## Visual Identity (общий для всех промптов)

**Название направления:** **The Unclench** — замедленное разжимание мышц, которые ты держал в напряжении весь день за столом.

**Ключевой момент:**
> Imagine the moment your shoulders finally drop after holding them tight for three hours. The slow exhale. The neck that stops gripping. The eyes that soften away from the monitor. This app lives in that micro-release — the 120-second pocket of relief you take right at your desk.

**Палитра (natural metaphors, не HEX):**
- Warm sage — like a rested eye looking at a houseplant on the windowsill
- Honey cream — like afternoon light pooling on a wooden desk
- Soft terracotta — like unglazed pottery, the only element that grounds and asks to be tapped
- Whisper charcoal — used only for text

**X-instead-of-Y философия:**
> Body-warmth zones instead of card borders. Each body region (neck, back, eyes, wrists) lives in its own temperature pocket — the interface groups through warmth, not through lines or frames.

**Якорь:**
> One element is always a solid terracotta disc — the "begin" button, the "start routine" action. Everything else breathes in sage and cream. The terracotta is the only definite edge in the composition — it says "Here. Tap me. Your shoulders are waiting."

**Numbers as heroes:**
> Streak days, session minutes, the "2 min" duration on every routine — these numbers sit large and light on the surface of the sage wash, casting no shadow, just existing clear and proud.

---

# Prompt #0 — Master Component Sheet

**Цель:** установить визуальный язык всего приложения. Результат используется как reference image для последующих App-Level промптов.

**Охват:** 6 foundational components (не экран, а палитра элементов)

**Режим:** Pro (один запуск), артборд — component sheet

```
A component sheet for DeskCare — a micro-stretching app for desk workers who quietly hurt. Two to five minute video exercises for neck, back, eyes, wrists — done right at the desk, no mat, no changing clothes. For the moment your shoulders finally drop after you close a demanding tab.

Generate 6 UI components on a warm cream artboard — like the color of afternoon light on a wooden desk. Components float freely — NO card borders, NO frames, NO boxes. Everything breathes on open space. Grouping through proximity and color temperature, not through lines.

CRITICAL RULES:
- Ultra-minimal — if an element can be removed without losing meaning, remove it
- All shapes are soft rounded rectangles, pills, and circles — nothing angular, nothing hard-cornered
- The palette lives in warm sage green, honey cream, and a single grounding terracotta accent — like a houseplant, afternoon sun, and a piece of unglazed pottery on a wooden desk. Terracotta is the anchor color — used only for the primary action, never decoratively
- Typography is quiet and light — thin weight for body text, medium weight for key numbers, ALL-CAPS-TRACKED for the smallest muted labels. Text feels like it whispers, not shouts
- The overall feeling is "the exhale after holding tension" — every component should feel like it's just finished releasing

The 6 components:

1. Body-Zone Selector — the primary navigation element of the app. Four soft circles in a horizontal row, each in a slightly different warm temperature: "Neck" (warmest sage), "Back" (mid sage), "Eyes" (coolest sage), "Wrists" (honey-leaning). Each circle contains a simple line icon of the body zone — drawn like a single continuous ink stroke. Below each circle: the zone name in thin light text, and a tiny tracked label underneath — "3 MIN", "4 MIN", "30 SEC", "2 MIN" — showing the routine duration for that zone. The selected circle is filled; the others are outlined with a gentle glow edge. Around them: nothing. Just cream space. Like four small stones laid out on a table, each a different warmth.

2. Streak Medallion — a large floating circle in soft sage with a thin edge-glow. Inside the circle: a single number "6" in medium weight, large and clear. Above the number: a tiny tracked label "DAY STREAK". Below the circle: a horizontal row of seven tiny dots — five filled in sage, one half-filled, one empty — representing the week. No fire emoji, no sparkle, no gamified loudness. The medallion feels earned, not gamified — like a small river stone you kept because of a good day.

3. Routine Card — a soft sage rectangle with rounded corners, floating on the cream background. Top-left: a tiny video thumbnail circle with a thin play triangle inside. Top-right: a tracked label "3 MIN · 3 EXERCISES". Middle: the routine name "Neck Unwind" in medium weight, thin and readable. Bottom: a solid terracotta pill button "Begin" — the only hard-edged element in the entire composition. The pill says "Your shoulders are waiting." Everything else in the card is soft. The terracotta pill is the only thing that wants to be pressed.

4. Pain Slider — a horizontal composition floating in space. Left edge: a tiny soft face — relaxed, eyes closed. Right edge: a tiny soft face — tense, brow furrowed. Between them: a smooth horizontal track that fades from pale sage (left) through honey-cream (middle) into warm terracotta (right). A single filled circle sits on the track showing the current value, with a small number "4" above it in thin weight. Below the track: tracked labels "NO PAIN" on the left, "SHARP" on the right. The slider uses color temperature to communicate pain — warmer is worse. No red, no alarm. Just honest warmth.

5. Eye Break Timer — a circle of honey cream with a soft sage ring around the outside, like a halo. The ring is partially filled, counting down. Inside the circle: a large thin number "20" and below it a tracked label "SECONDS · LOOK 20 FEET AWAY". Around the outer ring: three tiny dots showing the 20-20-20 rule progress — one filled, two pending. The whole element feels like a slow blink. Should feel like permission to stop staring.

6. Streak Calendar Strip — a floating horizontal row representing the last fourteen days. Each day is a tiny rounded square, barely larger than text. Days with a session are filled in sage with a tiny dot inside. Days without are an almost-invisible cream outline. The current day is filled in terracotta — the anchor, the present, the invitation. Above the row: a tracked label "LAST 14 DAYS". Below: a thin whisper line "6 of 14 days · keep going". The row should feel like a rhythm you can see, not a chart. Like footprints across sand.

Primary Design Surface: App.
```

---

# Prompt #1 — Onboarding Act I: Welcome + Pain Zone Quiz

**Экраны:** 1.2 Welcome, 1.3 Quiz «Зона боли», 1.4 Quiz «Частота боли»

**Цель акта:** поймать внимание, задать главный персонализирующий вопрос.

```
DeskCare — a micro-stretching app for desk workers who quietly hurt. Body-zone targeting, 2-minute video routines, eye exercises between meetings. For the worker whose neck has been locked for four hours and doesn't know it yet.

Mood & visual identity: imagine the slow unfurling of a fern leaf, filmed in time-lapse from tightly curled to fully open. The app lives in that unfurling — the moment tension you didn't know you were holding starts to release. The palette breathes in warm desk-light tones — soft sage like a rested eye, honey cream like afternoon sun pooling on wood, and a single grounding terracotta like an unglazed ceramic cup. The sage and cream are the air of the app. The terracotta is the invitation to begin.

Colors are used like body temperature — warmer tones surface where action happens, cooler tones recede into background. No borders, no card frames, no hard edges. Grouping lives in proximity and warmth. This is "body-warmth zones instead of card borders."

One element always breaks this softness: a solid terracotta pill button, the primary action on every screen. It is the only hard edge in the composition. It says "Here. Your shoulders are waiting."

Typography is quiet editorial sans-serif — thin weights float, medium weights anchor key words, tracked ALL-CAPS labels whisper the smallest information. Numbers are the heroes: "2 MIN", "20%", "87%" — they sit large and light, just existing, clear and proud.

3 screens.

Screen 1 — Welcome. A full warm cream field. Centered in the upper half: a soft illustration of a person at a desk, mid-shoulder-roll, drawn in thin continuous ink lines with soft sage shading. No hard outlines, no exaggerated posture — just quiet realism. Below the illustration, in thin medium-weight serif-adjacent sans: "Two minutes a day. Your neck stops aching." Beneath that, a thinner whisper line: "Micro-stretches right at your desk. No mat. No changing clothes." Lower third of the screen: a solid terracotta pill button "Begin" — definite, grounded, the only hard edge. Beneath the pill, a tiny whisper link in muted charcoal: "Already have an account? Sign in."

Screen 2 — Pain Zone Quiz. Top of screen: a thin horizontal sage progress line, filled 20 percent on the left, the rest a near-invisible cream. Above the line: a tracked label "STEP 1 OF 5". Below, in medium-weight thin type: "Where does it hurt most?" Below the question: four soft rounded squares laid out two by two, each a different warm sage temperature. Each square contains a thin ink-line icon of the body part and a label below in thin text — "Neck", "Back & lower back", "Eyes", "Wrists". Below the grid, a single wider pill: "Everything, honestly." Selected tiles glow softly at the edge in terracotta. Below the grid, a whisper note: "You can choose more than one." Bottom of screen: a terracotta pill "Next" (muted until at least one tile is selected) and beneath it, a tiny whisper link "Skip for now."

Screen 3 — Pain Frequency Quiz. The progress line now filled 40 percent. Tracked label: "STEP 2 OF 5". In medium thin type: "How often does it bother you?" Below the question: three horizontal soft sage rows stacked vertically, each a pill-like row with a tiny icon on the left and a single phrase on the right in thin weight. The rows say "Sometimes", "A few times a week", "Every single day." The rows are separated by generous cream space, not by lines. The selected row fills with a slightly warmer sage and a soft terracotta dot appears at its right edge. Bottom of screen: terracotta pill "Next". No skip link here — this question matters.

Primary Design Surface: App.
```

---

# Prompt #2 — Onboarding Act II: Work Context + Goal + Labor Illusion

**Экраны:** 1.5 Quiz «Social Proof + Тип работы», 1.6 Quiz «Цель + Часы», 1.7 Labor Illusion

**Цель акта:** собрать контекст, снизить drop-off через social proof, подготовить AHA-момент.

```
DeskCare — a micro-stretching app for desk workers who quietly hurt. Body-zone targeting, 2-minute video routines, personalized plans. For the worker who has tried three apps already and keeps closing them after day four.

Mood & visual identity: the palette lives in warm sage, honey cream, and a grounding terracotta — like a houseplant, afternoon desk-light, and an unglazed ceramic cup. Colors work as body-warmth zones — warmer temperatures surface where action lives, cooler sage recedes into the background. No card borders, no frames. Grouping through warmth and proximity.

One element is always solid terracotta — the "Next" pill button. It is the only hard edge in the composition.

Typography is quiet — thin weights float, medium anchor. Tracked ALL-CAPS labels whisper. Numbers are heroes: "60%", "87%", "8+" — they sit large and light on the sage surface.

3 screens.

Screen 1 — Social Proof + Work Context. Top: a thin sage progress line filled to 60 percent, tracked label "STEP 3 OF 5". Upper third of the screen: a soft honey-cream block, no border, just a warmer pool — inside it, in medium weight, a large number "87%" and below in thin text "of desk workers with neck pain report relief within 14 days." The block feels like a quiet quoted voice. Below the proof block: in medium thin type, the question "Where do you work?" Below the question: three soft sage pill rows stacked vertically, each with a thin ink icon on the left — "Home office", "In office", "Hybrid". Selected row fills with a warmer sage and a small terracotta dot at its right edge. Bottom: terracotta pill "Next."

Screen 2 — Goal + Hours at Desk. Progress line at 80 percent. Tracked label "STEP 4 OF 5". In medium thin type: "What are you hoping for?" Below: three soft sage pill rows — "Make the pain stop", "Prevent it coming back", "More energy through the day." Space between this question and the next feels like a breath. Below, another tracked label "AND HOW MANY HOURS AT YOUR DESK?" Below: a horizontal row of three soft circles of increasing size — "4–6", "6–8", "8+" — the circles literally grow left to right because the visual IS the meaning. Selected circle fills in warmer sage with a terracotta ring. Bottom: terracotta pill "Ready."

Screen 3 — Labor Illusion. Full warm cream field. Centered, large and quiet: a soft sage circle with a thin edge-glow, slowly filling clockwise like a breath being drawn. Inside the circle: a number that counts from "0%" toward "100%" in medium thin weight. Below the circle: a single rotating whisper line in thin text, changing softly between three stages — first "Reading your answers", then "Matching exercises to your shoulders", then "Laying out your first 14 days." Around the circle: nothing. Just cream space. No progress bar, no spinner, no percentage steps. Just a single slow-filling sage ring. The whole screen should feel like listening to someone think carefully about you.

Primary Design Surface: App.
```

---

# Prompt #3 — Onboarding Act III: AHA → Reminders → Paywall

**Экраны:** 1.8 Персональный план (AHA), 1.9 Reminder Setup, 1.10 Paywall

**Цель акта:** показать ценность до paywall, получить push-разрешение в контексте, конвертировать.

**Замечание:** это самый важный акт воронки. Paywall особенно — можно сгенерить отдельно, если результат не дотянет.

```
DeskCare — a micro-stretching app for desk workers who quietly hurt. Personalized routines by pain zone, smart reminders, sciatica and eye programs. For the worker who is finally about to commit to two minutes a day.

Mood & visual identity: warm sage, honey cream, grounding terracotta — the palette of a houseplant, afternoon desk-light, and unglazed pottery. Body-warmth zones instead of card borders. No frames, no hard edges except one — the terracotta action pill, always the only definite shape in the composition.

Typography quiet — thin weights float, medium weights anchor. Tracked ALL-CAPS labels whisper small information. Numbers are the heroes: "14", "2", "7", "$2.49" — they sit large and clear on the sage surface, casting no shadow.

3 screens.

Screen 1 — Your Program Is Ready. Full warm cream field. Top: a tracked label "BUILT FOR YOU" in muted charcoal. Below, in medium thin weight, three words stacked: "Your program is ready." Middle of the screen: three soft sage rows floating in a loose vertical stack — each row is a tiny routine preview. Each row has a thin ink-line icon on the left (neck spiral, back arch, eye circle), the routine name in medium thin weight ("Neck Unwind", "Lower Back Release", "Eye Reset"), and a tracked label on the right showing duration ("2 MIN", "3 MIN", "30 SEC"). Between the rows is generous cream space, no dividers. Below the three routines: a wider honey-cream pool, no border, containing in large thin weight the numbers "14 · 2 · 14" with below each a whisper label — "EXERCISES", "MINUTES A DAY", "DAYS TO RESULTS". The numbers feel like a quiet promise. Bottom: solid terracotta pill "Continue."

Screen 2 — Reminder Setup. Warm cream field. Top: in medium thin weight, "When should we nudge you?" Below, a soft quote-voice line: "Most people who pick three times a day stick with it — gentle, never shouting." Middle of the screen: four soft sage pills stacked vertically, each a toggle row. Each row has a thin time icon on the left, a time label in medium thin weight ("Morning · 9:00", "Lunch · 13:00", "Afternoon · 16:00", "Evening · 18:00"), and a small rounded toggle on the right. Toggled-on rows fill slightly warmer and the toggle's moving dot is terracotta. Below the four rows: a separator line that is barely visible, and below it a fifth row with a different icon — "Eye break every 20 minutes." Bottom: solid terracotta pill "Turn on reminders." Below the pill, a tiny whisper link: "Set up later."

Screen 3 — Paywall. Full warm cream field with a subtle sage wash along the bottom two-thirds — like a tide moved in. Top-right: a tiny close "x" in whisper charcoal, nothing emphatic. Upper third: in medium thin weight, "Your 14-day program is waiting." Below it, a single softer line: "Keep going past day 7." Middle of the screen: a vertical timeline — three soft sage dots connected by a thin line running down the middle. Next to the first dot, medium thin weight: "Today", and beside it "Full access." Next to the second dot: "Day 5", "We remind you." Next to the third dot: "Day 7", "Billing begins." The timeline feels like a calm walk, not a countdown. Below the timeline: four short whisper lines in thin weight, each with a tiny sage checkmark — "Personal routines by pain zone", "All zones, every program", "Sciatica program included", "Pain tracking & insights." Below the list: two stacked plan options. The primary is a solid honey-cream pool, no border, with in medium thin weight "Yearly — $2.49 / month" and below it in whisper text "$29.99 billed yearly · SAVE 58%". The secondary is an outlined sage ring, slimmer, saying "Monthly · $4.99 / month." Below the plans: a solid terracotta pill "Begin 7 days free." Below the pill, a tiny whisper line "★ 4.8 — 2,400+ reviews." Below that, two whisper links "Restore purchase" and "Terms · Privacy." Nothing on this screen is loud. The terracotta pill is the only hard shape. Everything else breathes.

Primary Design Surface: App.
```

---

# Prompt #4 — Home (4 states)

**Экраны:** 3.1 Home — four states (first-day empty, with-data, premium, re-engagement)

**Цель:** центральная навигация + retention hook + контекстная персонализация.

**Замечание:** все 4 состояния — один экран, разные наполнения. Если Stitch не вытягивает 4 сразу, запусти два по два.

```
DeskCare home screen in four states — a micro-stretching app for desk workers. For the moment someone opens the app between meetings and wonders what to do with their aching neck.

Mood & visual identity: warm sage, honey cream, grounding terracotta — like a houseplant, afternoon desk-light, and unglazed pottery. Body-warmth zones instead of card borders. Each body region has its own warm temperature in the interface — neck pools warmest, eyes coolest. Typography thin and editorial, numbers as heroes. One terracotta pill per screen, always the primary action, always the only hard edge.

Bottom of every screen: a soft cream tab bar, almost invisible — four thin ink icons ("Home", "Library", "Programs", "Profile") with the active tab marked by a tiny terracotta dot underneath. The tab bar whispers.

4 screens — same home screen, four different moments in a user's life.

Screen 1 — First Day (empty state). Warm cream field. Top: a quiet greeting in thin medium weight "Good afternoon, Marina." No exclamation. Below, a soft honey-cream pool — inside it, large thin number "0" above a whisper label "DAY STREAK". To the right of the number, a single soft sage dot and six near-invisible outlined dots — the week ahead. Beneath the pool, in thin weight: "Your first stretch is waiting." Below, a soft sage routine card — thin play icon, routine name "Neck Unwind · first step" in medium thin, tracked label "2 MIN · 2 EXERCISES", solid terracotta "Begin" pill at the bottom-right of the card. Below the card: a smaller honey-cream row with "Try a 30-second eye break" and a thin outlined pill. Below: the body-zone selector — four soft sage circles in a row, "Neck", "Back", "Eyes", "Wrists" — each with a thin ink icon. No pain check-in banner yet.

Screen 2 — With Data (day 6, active user). Warm cream field. Greeting: "Welcome back, Marina." Beneath, the streak medallion — a softly warmer honey-cream pool with large thin "6" above "DAY STREAK", and seven dots showing the week — five filled in sage, one half-filled, one terracotta (today). Below: a tracked label "FOR YOU TODAY" and a soft sage routine card with a warmer tone — "Shoulder Release · based on your last session", "3 MIN · 3 EXERCISES", terracotta "Begin" pill. Below: the eye break row, honey cream, "Eyes tired? 30 seconds." Below: body-zone selector — four circles, but "Neck" is now slightly warmer because it's her primary zone. Below the zones: a soft terracotta-rimmed whisper banner — "How's your neck today?" and a tiny "Rate it" link. The screen feels lived-in.

Screen 3 — Premium User (all unlocked). Same layout as screen 2, but every tile that was previously locked now glows with a subtle warmer sage. The small tracked label "PRO" sits near the greeting in whisper charcoal. Programs row below the recommended card shows three soft tiles — "Sciatica Week 2", "Carpal Tunnel", "Eye Yoga" — each with a thin ink icon and a terracotta progress dot showing continued work. No locks anywhere.

Screen 4 — Re-engagement (returning after 10 days away). Warm cream field, slightly darker sage wash at the bottom — like dusk. Greeting: "It's been a moment." No "welcome back!" exuberance. Below, a softer streak medallion — the "6" still showing, but with a tiny terracotta line beneath it saying "Your streak paused — here when you're ready." Below: a single soft sage card, wider and more generous, with the text "Start small today · 90 seconds" and a gentle terracotta pill "Just 90 seconds." No pressure, no guilt. Below: the body zones, slightly dimmed. The whole screen feels like a patient friend.

Primary Design Surface: App.
```

---

# Prompt #5 — Library + Exercise Detail (free / locked)

**Экраны:** 3.2 Library (caталог), 3.2.1 Exercise Detail (free), 3.2.1 Exercise Detail (premium locked)

```
DeskCare library and exercise detail — a micro-stretching app for desk workers. A catalog of quiet, 30-second to 5-minute exercises by body zone.

Mood & visual identity: warm sage, honey cream, grounding terracotta. Body-warmth zones instead of card borders. Thin editorial type, tracked ALL-CAPS whisper labels, numbers as heroes. One solid terracotta pill per screen for the primary action, always the only hard edge.

3 screens.

Screen 1 — Library. Warm cream field. Top: a thin ink search line, wide and low — no box, just a thin underline and whisper placeholder text "Search by name or zone." Below: a horizontal row of soft sage filter pills — "All", "Neck", "Back", "Eyes", "Wrists", "30 SEC", "2 MIN", "5 MIN". The active pill is filled warmer sage with a tiny terracotta dot. Below the filters: a vertical list of exercise rows. Each row is a soft honey-cream pool — no border, just a warmer color pocket — with a tiny video thumbnail circle on the left (thin play triangle inside), the exercise name in medium thin weight ("Chin Tuck", "Upper Trap Stretch", "Eye Figure-8"), and on the right a tracked label "2 MIN · NECK" or "30 SEC · EYES" and a small heart outline for favorite. Some rows have a whisper terracotta glyph on the top-right — a thin outlined key — marking premium exercises. No lock icons, no grey-out. Just a small key. The library feels like flipping through a quiet notebook.

Screen 2 — Exercise Detail (free). Warm cream field. Top: a thin back arrow. Below: a large soft honey-cream pool at the top of the screen — inside it, a video thumbnail, generous and square, with a thin play triangle centered. Below the thumbnail, in medium thin weight: "Chin Tuck". Below the name: a tracked label "2 MIN · NECK · GENTLE". Below: a whisper paragraph in thin weight — "Pulls the head back into alignment. Releases the sub-occipital muscles that tighten from forward-screen posture." Below the description: three small tracked sections, each with a label and thin-text body — "TARGETS · Deep neck flexors, sub-occipitals", "AVOID IF · recent neck injury", "MODIFY · sit with back fully supported." Bottom of screen: solid terracotta pill "Begin" and to its right a small thin heart outline — favorite.

Screen 3 — Exercise Detail (premium locked). Same layout as screen 2, but the video thumbnail has a soft honey wash over it — not dark, not grey, just warmer. In the center of the thumbnail: a small thin outlined key icon. The exercise name is muted slightly. The description is visible but softer. The tracked "TARGETS / AVOID IF / MODIFY" sections are still fully readable — locked doesn't mean hidden. Bottom: instead of "Begin", a solid terracotta pill "Unlock with 7-day free trial." Below the pill, a whisper link "See what's included." The locked state feels like a closed book, not a paywall.

Primary Design Surface: App.
```

---

# Prompt #6 — Programs + Sciatica + Symptom Checker

**Экраны:** 3.3 Programs overview, 3.3.1 Sciatica Program (locked + active), 3.3.1.1 Symptom Checker

```
DeskCare programs section — structured multi-week curricula for sciatica, carpal tunnel, eye strain. For the worker whose lower back has been locked for months and who has given up on YouTube videos.

Mood & visual identity: warm sage, honey cream, grounding terracotta — the palette of a houseplant, afternoon desk-light, unglazed pottery. Body-warmth zones instead of card borders. Thin editorial type, tracked ALL-CAPS labels, numbers as heroes. One terracotta action pill per screen, the only hard edge.

4 screens.

Screen 1 — Programs Overview. Warm cream field. Top: a tracked label "PROGRAMS FOR REAL CONDITIONS" and below in medium thin weight "Structured, not random." Below: two large soft cards floating in cream space — not rectangles with borders, but generous warm-sage pools. First pool: at the top, a thin ink-line illustration of a lower-back curve. Middle, in medium thin weight "Sciatica Relief." Below: a tracked row "2 PHASES · 14 EXERCISES · CLINICIAN-REVIEWED". At the bottom of the pool, a thin outlined key glyph on the top-right (premium marker) and a whisper line "Starts with a 6-question check-in." Second pool, honey cream: ink-line of an eye in profile. "Eye Program." Tracked row "20-20-20 TIMER · 5 EYE EXERCISES · FREE". Below: a small terracotta dot on the top-right, indicating it's already included. No CTA buttons on this overview — tapping a pool opens its program.

Screen 2 — Sciatica Program (locked, free user). Warm cream field. Top: a thin back arrow. A large honey-cream pool at the top — inside, "Sciatica Relief" in medium thin weight, a tracked line "2 PHASES · 14 EXERCISES", and a quiet disclaimer in whisper thin charcoal "This program does not replace medical advice. If you have red flag symptoms, see a doctor." Below the pool: two phase cards, each a soft sage pool with no border. Phase 1 card: medium thin "Phase 1 · Acute (gentle)" and a tracked row "DAYS 1–7 · 6 EXERCISES · 3 MIN / DAY". Phase 2 card: "Phase 2 · Rebuild (progressive)" and "DAYS 8–21 · 8 EXERCISES · 5 MIN / DAY". Each phase card has a thin outlined key glyph on the top-right. Below the phases: a tracked label "INSIDE YOU GET" and three whisper lines with tiny sage checkmarks — "Symptom check-in that adapts the program", "Red-flag screener for safety", "Every exercise with contraindications." Bottom of screen: solid terracotta pill "Unlock with 7-day free trial." Below the pill, a whisper link "Learn more about sciatica care."

Screen 3 — Sciatica Program (active, premium). Same layout, but now the phase cards are expanded into lists. The current phase (Phase 1, Day 4) is warmer sage with an open visible list of exercises below — each a tiny row with a thin ink icon, exercise name, duration, and a small terracotta dot next to completed ones. The upcoming phase stays as a collapsed pool with a tracked label "UNLOCKS ON DAY 8." Bottom: solid terracotta pill "Begin today's session · 3 min."

Screen 4 — Symptom Checker. Warm cream field. Top: "How is it today?" in medium thin weight. Below: a large honey-cream pool with a vertical list of six soft pill rows. Each row has a thin ink icon on the left (a low-back diagram in different postures or symptom shapes) and a short phrase on the right — "Sharp shooting down my leg", "Dull ache in the lower back", "Worse when I stand up", "Stiff first thing in the morning", "Numb in the foot", "None of these today." Rows are separated by cream breathing space. Selected rows fill with warmer sage and a small terracotta dot appears at the right edge. Below the list: a whisper paragraph in thin — "We'll adjust today's phase based on your answers. If you checked 'numb in the foot' more than once, we'll pause the program and ask you to see a doctor." Bottom: solid terracotta pill "Adapt today."

Primary Design Surface: App.
```

---

# Prompt #7 — Eye Program (standalone)

**Экран:** 3.3.2 Eye Program (20-20-20 + eye exercises)

**Замечание:** eye program — отдельный по духу экран, более медитативный, более "дыхательный". Запусти отдельно от остальных programs.

```
DeskCare Eye Program — a screen for the 20-20-20 timer and short eye exercises. For the moment your vision has softened from too many hours of monitor and you need to let the eyes rest.

Mood & visual identity: imagine a slow blink. The air going still. The eyes dropping from screen-focus to middle distance, then far distance. The palette lives in soft sage and honey cream — the color of a rested eye looking at a houseplant ten feet away. Terracotta is nearly absent here. This screen is about stillness, not action.

Body-warmth zones instead of card borders. Thin editorial type, tracked labels whispering.

2 screens.

Screen 1 — The 20-20-20 Timer. Full warm cream field. Centered: a very large soft sage circle with a thin edge-glow, pulsing almost imperceptibly. Inside the circle, in thin light weight: a large number "20" and below it a tracked label "SECONDS". Below the number, a single soft whisper line in thin charcoal: "Look 20 feet away." Around the outer edge of the circle: a pale ring that fills slowly clockwise as the 20 seconds pass. Below the circle, centered in cream space: three tiny dots in a row — one filled in sage, two outlined — showing the 20-20-20 progress. Further below: a thin tracked line "EVERY 20 MINUTES · 20 SECONDS · 20 FEET." No start button, no stop button. The circle runs as soon as the screen opens. Just a single whisper tap area to restart. The entire screen should feel like an exhale.

Screen 2 — Eye Exercises List. Warm cream field. Top: tracked label "EYE EXERCISES" and below in medium thin "Quiet, no sound needed." Below: five horizontal rows, each a soft sage pill. Each row has a thin ink icon representing the motion (palm covering eye, figure-8 sweep, focus shift arrow, blink, circle) and the exercise name on the right — "Palming", "Figure-8", "Focus Shift", "Conscious Blinking", "Eye Circles." Each row has a tracked duration label on the far right: "30 SEC", "20 SEC", "40 SEC", "15 SEC", "30 SEC." Below the list: a soft honey-cream pool with a short whisper paragraph in thin weight — "All eye exercises run silently with on-screen animation. Safe for open offices." Bottom: a muted sage outlined pill "Begin all · 2 min 15 sec." No terracotta on this screen — eye time is quiet time.

Primary Design Surface: App.
```

---

# Prompt #8 — Exercise Flow: Routine Preview + Player + Session Complete

**Экраны:** 4.1 Routine Preview, 4.2 Exercise Player (playing / paused), 4.3 Session Complete (normal / milestone)

**Замечание:** Exercise Player — полноэкранный, поверх всего. Session Complete имеет два состояния, которые можно сгенерить вместе.

```
DeskCare exercise flow — the three screens the user sees from picking a routine to finishing one. For the 3-minute window between a meeting ending and the next one starting.

Mood & visual identity: warm sage, honey cream, grounding terracotta. Body-warmth zones. Thin editorial type, numbers as heroes. One terracotta action pill per screen, the only hard edge.

Player screen is a full-bleed exception — it lives in a soft dark sage field (still warm, never black) with honey-cream text and terracotta for the pause button only.

4 screens.

Screen 1 — Routine Preview. Warm cream field. Top: thin back arrow and a tracked label "NECK UNWIND". Below: in medium thin weight, a soft title "3 minutes. 3 exercises." Below the title: a large soft honey-cream pool — inside it, a short whisper paragraph in thin weight describing the routine's purpose. Below the pool: a vertical list of three exercise rows — each a soft sage pill with a thin video-thumbnail circle on the left, the exercise name in medium thin weight ("Chin Tuck", "Upper Trap Stretch", "Neck Rotation"), and a tracked duration on the right ("45 SEC", "60 SEC", "45 SEC"). A thin vertical line connects the three rows on the left — the sequence. Below the list, a tracked label "TARGET ZONE" and a small soft sage circle filled with a thin neck-area icon. Bottom: solid terracotta pill "Begin routine."

Screen 2 — Exercise Player (playing). Full-bleed soft dark sage field — the color of evening desk-light. Upper-left corner: a thin close "x" in honey cream. Upper-right: a tracked label "2 OF 3 · NECK UNWIND". Center: a video frame with rounded corners, not full-bleed — generous dark sage breathing room around it. Above the video: in thin honey-cream weight, the exercise name "Upper Trap Stretch". Below the video: a thin tracked text cue "Let the weight of your arm do the work. Don't pull." Bottom third: a thin honey-cream progress line — narrow, barely a line — filled to show current position in the exercise. Below the progress line: a row of four thin honey-cream icons — skip-back, pause (solid terracotta circle, the only anchor), skip-forward, audio toggle. The audio toggle has a tiny strike-through line if audio is muted. The screen is quiet — no chrome, no timer, no countdown. Just the video, the cue, the progress, and one warm terracotta pause.

Screen 3 — Exercise Player (paused). Same layout as screen 2, but the video frame is slightly dimmed and a whisper overlay across the middle of the video in thin honey cream — "Paused." The terracotta circle at the bottom now shows a thin play triangle. A new row appears beneath: two thin outlined pills in honey cream — "Skip exercise" and "Exit routine." The paused state feels gentle, not alarmed.

Screen 4 — Session Complete (with milestone). Warm cream field returning from the dark player. Top center: in medium thin weight, "Your neck just thanked you." Below, a large soft honey-cream pool — inside it, a large thin number "7" above a tracked label "DAYS IN A ROW". Below the number: a row of seven small dots, six sage-filled, the seventh in warm terracotta (today). Below the pool: a small soft sage tile — a milestone medallion shaped like an unglazed clay coin with "7 DAYS" engraved in thin weight. The medallion has a subtle terracotta edge-glow — earned, not gamified. Below the medallion, a whisper tracked label "FIRST QUIET BADGE · KEEP GOING". Below: three tiny stats in a horizontal row, each just a number and a tracked label — "3 MIN · SESSION", "21 MIN · WEEK", "NECK · FOCUS ZONE". Below the stats: a soft honey-cream row asking "How does it feel now?" with a thin outlined pill "Rate it." Below: a thin outlined pill "Share this milestone" with a small thin arrow icon. Bottom: solid terracotta pill "Back to home." The whole screen should feel like a quiet exhale of pride, not a fireworks show.

Primary Design Surface: App.
```

---

# Prompt #9 — Profile + Progress + Pain History

**Экраны:** 3.4 Profile, 3.4.1 Progress, 3.4.2 Pain History

```
DeskCare profile section — three screens showing the user's identity, streaks, and pain trends. For the user who wants to see that two minutes a day actually moved a number.

Mood & visual identity: warm sage, honey cream, grounding terracotta. Body-warmth zones instead of card borders. Thin editorial type, numbers as heroes. One terracotta anchor per screen.

3 screens.

Screen 1 — Profile. Warm cream field. Top: a tracked label "YOU". Below: in medium thin weight, "Marina" and beneath in whisper "marina@email.com". Below the name: a subtle tracked row "PRO MEMBER · MEMBER SINCE MARCH 2026" — no loud badge, just quiet text. Below: a horizontal honey-cream pool containing three stats side by side — each a large thin number over a tracked label: "42" over "SESSIONS", "84" over "MINUTES", "6" over "CURRENT STREAK". Between the numbers, generous cream space, not dividers. Below the stats: a vertical list of four soft sage rows, each a pill with a thin ink icon on the left and a label on the right — "Progress", "Pain history", "Settings", "About DeskCare". On the right edge of each row, a thin chevron. No visual separation between the rows except cream breathing space. Bottom: the tab bar with "Profile" showing the terracotta dot.

Screen 2 — Progress. Warm cream field. Top: thin back arrow and tracked label "PROGRESS". Below: a large soft honey-cream pool — inside, a large thin number "6" over tracked "CURRENT STREAK". To the right of the number: a small whisper line "Best streak: 14 days." Below the streak pool: a full-width calendar strip — one row per week for the last four weeks, each day a tiny rounded square barely larger than text. Days with a session are filled sage; days without are near-invisible cream outlines; today is filled terracotta. Above the calendar, a tracked label "LAST 28 DAYS". Below the calendar: a tracked label "QUIET BADGES" and below a horizontal row of four small clay-medallion shapes — two earned (warm sage with tracked labels "3 DAYS" and "7 DAYS"), two still outlined ("14 DAYS", "30 DAYS"). Below the badges: a tracked label "THIS WEEK" and three stats in a row — "21 MIN", "7 SESSIONS", "NECK · FOCUS". Bottom: a thin outlined pill "Share progress" with a small ink-arrow icon.

Screen 3 — Pain History. Warm cream field. Top: thin back arrow and tracked label "PAIN HISTORY". Below: in medium thin weight, "Your neck, last 30 days." Below the title: a soft sage line chart floating in cream — no axes, no grid, just a thin curve that starts higher on the left and drifts lower on the right, with dots along its path at the points where pain check-ins happened. The line uses color temperature — warmer segments where pain was higher, cooler sage where it was lower. Above the chart: small tracked labels on the upper-left "30 DAYS AGO" and upper-right "TODAY". Below the chart: a thin tracked whisper "Your neck dropped from 7 to 3." Below: a toggle row of four pills — "Neck" (active), "Back", "Eyes", "Wrists" — each filled with its zone temperature. Below the toggle: a soft honey-cream pool — inside, in whisper thin weight, "Pain dropped on days you stretched. On skipped days, it crept back up." Bottom: a thin outlined pill "Export for my doctor · PDF." No terracotta here except the tiny active-zone dot. The screen feels like quiet evidence.

Primary Design Surface: App.
```

---

# Prompt #10 — Settings Stack

**Экраны:** 3.4.3 Settings, 3.4.3.1 Reminder Settings, 3.4.3.3 Subscription Management

**Замечание:** Appearance и Privacy можно сделать по образцу этих же трёх — системные.

```
DeskCare settings screens — three screens for controlling reminders, subscription, and overall app configuration. Settings should feel like quiet shelving, not a control panel.

Mood & visual identity: warm sage, honey cream, grounding terracotta. Body-warmth zones, thin editorial type, tracked labels whispering. Minimal interaction, lots of cream breathing space. One terracotta anchor per screen only where a primary action exists.

3 screens.

Screen 1 — Settings (root). Warm cream field. Top: a thin back arrow and tracked label "SETTINGS". Below: five sections, each a tracked label and below it a vertical list of soft sage pill rows. Each row has a label on the left in thin medium weight and on the right either a chevron (for sub-screens) or a small toggle (for on/off) or a whisper value (for status). Section one — "REMINDERS": "Schedule" (with chevron), "Eye breaks" (with toggle), "Tone · Gentle" (with chevron). Section two — "YOUR PROFILE": "Pain zones · Neck, Back" (chevron), "Work type · Remote" (chevron), "Hours at desk · 8+" (chevron). Section three — "SUBSCRIPTION": "DeskCare Pro · Yearly" (chevron), "Manage subscription" (chevron). Section four — "APPEARANCE": "Theme · Auto" (chevron), "Reduce motion" (toggle). Section five — "PRIVACY": "Export my data" (chevron), "Delete account" (chevron in terracotta — the only warm accent on this screen, indicating caution). Between each section: a thin tracked section label. No visual borders — sections separate through spacing.

Screen 2 — Reminder Settings. Warm cream field. Top: thin back arrow, tracked label "REMINDERS". Below: a tracked section label "WORK HOURS" and two rows — "Start · 9:00 AM" and "End · 6:00 PM" — each a soft sage pill with the time on the right. Below: tracked section "CADENCE" and a single row "Every 2 hours" with a chevron opening a time-interval picker. Below: tracked "DAYS" — a row of seven tiny soft sage circles for the week, each a single letter "M T W T F S S", active days filled warmer with a terracotta dot. Below: tracked "EYE BREAKS" and one row "Every 20 minutes · on" with a toggle. Below: tracked "TONE" — three soft sage pills side by side, "Gentle" (active, filled warmer with terracotta dot), "Neutral", "Motivating." Below: tracked "QUIET HOURS" — two rows, "During calendar events · on" (toggle), "Between 10 PM and 7 AM · on" (toggle). Bottom: solid terracotta pill "Save."

Screen 3 — Subscription Management. Warm cream field. Top: back arrow, tracked label "SUBSCRIPTION". Below: a large soft honey-cream pool — inside, tracked label "YOUR PLAN" in small muted, and below in medium thin weight "DeskCare Pro · Yearly". Beneath: a whisper tracked row "$29.99 per year · renews April 2027". Below the pool: a horizontal row of three stats — "14" over "DAYS IN APP", "52" over "SESSIONS", "6" over "CURRENT STREAK". Below the stats: tracked label "WHAT YOU GET" and five whisper lines with tiny sage checkmarks — "All routines · all zones", "Sciatica Relief program", "Carpal Tunnel program", "Pain tracking & PDF export", "Custom routines." Below: tracked "MANAGE" and two soft sage pill rows — "Change plan" (chevron), "Restore purchase" (chevron). Below: a single row with a subtler whisper terracotta tint — "Cancel subscription" (chevron). Nothing loud, no retention-panic messaging. Bottom: no primary CTA — this screen is informational.

Primary Design Surface: App.
```

---

# Prompt #11 — Monetization Modals

**Экраны:** 5.1 Paywall (feature-gate), 5.2 Mini-Paywall (inline), 5.3 Push Permission Primer

**Замечание:** все три появляются поверх других экранов — генерим как modal/overlay.

```
DeskCare monetization modals — three overlays that appear on top of the main app. Each one asks for something (money, attention, permission) but should feel like a quiet offer, not a demand.

Mood & visual identity: warm sage, honey cream, grounding terracotta. Modals appear as soft bottom-rising sheets with rounded top corners, or centered cards floating on a dimmed warm-sage backdrop. Thin editorial type, tracked labels. One terracotta pill per modal for the primary action.

3 screens.

Screen 1 — Paywall (feature-gate, contextual). The background behind the modal is a dimmed soft sage — the locked screen visible underneath but muted. The modal itself rises from the bottom, occupying three-quarters of the screen, with rounded top corners and a soft cream fill. Top-right: a whisper "x" close button. Top: in medium thin weight, "You're about to try Sciatica Relief." Below: a quiet line "Designed with a physiotherapist over six months." Middle: three whisper lines with tiny sage checkmarks — "2 phases that adapt to your pain", "Clinician-reviewed contraindications", "Symptom check-in every session." Below: two stacked plan pills — the primary a honey-cream pool, "Yearly — $2.49 / month · $29.99 billed once", and beneath it a thinner outlined sage pill "Monthly · $4.99 / month." Below: solid terracotta pill "Begin 7 days free." Below the pill, two whisper links "Restore purchase" and "Terms." The modal feels like a contextual offer, not a blocker.

Screen 2 — Mini-Paywall (inline). The background is the locked exercise card, dimmed slightly. A small bottom sheet rises — only a third of the screen. Top of sheet: a single tracked label "50+ PREMIUM EXERCISES". Below: in medium thin weight, "Unlock everything, 7 days free." Below: three tiny sage checkmarks with whisper labels — "All zones", "Sciatica program", "Pain insights." Below: a solid terracotta pill "See plans" and to its right a whisper "Not now." The sheet feels like a nudge, not a wall.

Screen 3 — Push Permission Primer. The backdrop is dimmed soft sage. A centered card floats in the middle of the screen — soft cream, no border, just a warm pool. At the top of the card: a thin ink-line illustration of a bell with a single leaf next to it — like a chime, not an alarm. Below: in medium thin weight, "Gentle reminders, not noise." Below: a quiet paragraph in thin weight — "We'll nudge you at the times you picked. You can turn off or reshape them anytime in Settings." Below: a small tracked stat "87% of users who keep reminders on stretch at least four days a week." Below: solid terracotta pill "Turn on reminders" which triggers the system-level dialog after tap. Below the pill, a whisper link "Not now." The card is asking politely.

Primary Design Surface: App.
```

---

# Prompt #12 — Engagement Modals

**Экраны:** 5.4 Pain Check-in, 5.5 Streak Freeze Alert, 5.6 Rate App Prompt, 5.8 Milestone Celebration

**Замечание:** Share Sheet (5.7) — нативный iOS/Android, не генерируем в Stitch.

```
DeskCare engagement modals — four overlays for pain check-ins, streak protection, rating, and milestone celebrations. All quiet, none gamified. The app never shouts at its user.

Mood & visual identity: warm sage, honey cream, grounding terracotta. Modals are bottom sheets or centered soft cards floating on a dimmed warm-sage backdrop. Thin editorial type, tracked labels. One terracotta anchor per modal for the primary action.

4 screens.

Screen 1 — Pain Check-in (bottom sheet). Dimmed sage backdrop. Modal rises from the bottom, half-screen height, rounded top corners, cream fill. Top: tracked label "PAIN CHECK-IN". Below: in medium thin weight, "How is your neck right now?" Below: a horizontal pain slider — left edge a tiny relaxed face (eyes closed), right edge a tiny tense face (brow furrowed). The track fades from pale sage through honey cream into warm terracotta on the right. A filled circle sits on the track with a small number above showing the current value, from 1 to 10. Below the slider: tracked labels "NO PAIN" on left, "SHARP" on right. Below: a small whisper row of zone chips — "Neck" (active, slightly warmer), "Back", "Eyes", "Wrists" — tap to switch zone being rated. Below: a thin outlined pill "Add a note · optional" which opens a whisper text field. Bottom: solid terracotta pill "Save." The whole modal should feel like placing a stone on a small cairn — quiet ritual.

Screen 2 — Streak Freeze Alert (centered card). Dimmed sage backdrop. A centered cream card floats with no border. Top: a thin ink-line illustration of a leaf with a single frost-crystal on its edge — delicate, not dramatic. Below: in medium thin weight, "Yesterday was a grace day." Below: a quiet paragraph in thin weight — "We kept your 6-day streak. You get one of these a week — no questions asked. Back to it today, gently." Below: solid terracotta pill "See today's routine." Below the pill, a whisper link "Maybe tomorrow." The card feels like a forgiving friend.

Screen 3 — Rate App Prompt (small sheet). Dimmed sage backdrop. Modal rises from the bottom, a quarter-screen height, cream fill. Top: in medium thin weight, "Is DeskCare helping?" Below: a row of three soft sage circles with tiny face expressions — calm, neutral, tense — tap to answer. If "calm" is selected, the modal transitions (within the same generation, same composition) to show three pills — "Leave a review", "Tell us more", "Not now." If "tense" or "neutral" is selected, it shows "Tell us what's missing" pill and "Not now." This generation should show the calm-selected state — three pills, primary terracotta "Leave a review", two muted outlined pills beside it. The prompt feels like a polite ask, not a demand.

Screen 4 — Milestone Celebration (centered card with celebration). Dimmed sage backdrop. A centered cream card floats. Top center: a large unglazed clay medallion shape — a soft sage circle with a thin terracotta ring, with "14 DAYS" engraved in thin weight across its surface. Around the medallion: a scatter of tiny thin-line sparkles — small crosses and dots, no confetti-storm, just a dusting. Below the medallion: in medium thin weight, "Two weeks of showing up." Below: a quiet paragraph in thin — "That's the hardest stretch of any new habit. You did it at your desk, between meetings, some days tired. Quietly. That matters." Below: two stacked pills — solid terracotta "Share this quietly" with a small ink-arrow, and a thin outlined "Back to home." The celebration feels earned, never gamified.

Primary Design Surface: App.
```

---

# Prompt #13 — Auth + System Screens (Component Sheet)

**Экраны:** 2.1 Sign In, 2.2 Sign Up, 6.1 Loading, 6.2 No Internet, 6.3 Force Update, 6.4 Maintenance

**Замечание:** эти экраны одной семьи — стандартные utility/boundary moments. Генерим как один component sheet, чтобы стиль был consistent.

```
A component sheet for DeskCare — authentication and system screens. Six quiet utility moments: sign-in, sign-up, loading, no-internet, force-update, maintenance. These are the boundary moments — where the app meets the system or meets a pause. They should feel as quiet as the rest of the app, never alarmed, never loud.

Generate 6 screens on a warm cream artboard — the color of afternoon desk-light. Each screen floats in its own cream pocket on the sheet. No borders between screens, just generous cream space.

CRITICAL RULES:
- Warm sage, honey cream, grounding terracotta — always the only palette
- Thin editorial typography, tracked ALL-CAPS for smallest labels, numbers as heroes when present
- No card borders, no frames — grouping through proximity and warmth
- One terracotta anchor per screen where a primary action exists; some screens have no primary action and thus no terracotta
- All illustrations are thin single-line ink drawings, never filled shapes, never exaggerated characters
- The overall feeling is "a patient app that doesn't panic when things go quiet"

The 6 screens:

1. Sign In — Warm cream field. Top: a thin back arrow. Below: tracked label "SIGN IN" and beneath in medium thin "Welcome back." Middle: two thin-underline input fields — "Email" and "Password" — no boxes, just thin sage underlines and whisper placeholder text. Below the fields: a whisper link "Forgot password?" right-aligned. Below: a solid terracotta pill "Sign in." Below the pill: a tracked label "OR" with thin horizontal sage lines extending left and right. Below: two outlined sage pills side by side — "Continue with Apple" (with thin apple ink icon) and "Continue with Google" (with thin G icon). Bottom: a whisper line "No account yet? Create one." The screen feels minimal, like clearing a desk.

2. Sign Up — Same structure as Sign In, but three input fields — "Email", "Password", "Name (optional)". Below the fields: a whisper terms line — "By creating an account you agree to our Terms and Privacy Policy." Solid terracotta pill "Create account." Below: "OR" divider and Apple / Google pills. Bottom: whisper "Already have an account? Sign in."

3. Loading — Warm cream field. Centered: a soft sage circle with a thin edge-glow, pulsing almost imperceptibly, like a slow breath. Inside the circle: no number, no text, just pale cream space. Around the outer edge: a pale ring filling slowly clockwise. Below the circle: a tracked whisper label "JUST A MOMENT". No percentage, no spinner, no "loading..." text. The whole screen is one circle and one word. Like watching a leaf slowly unfurl.

4. No Internet — Warm cream field. Top: a thin ink-line illustration of a small potted plant with one wilted leaf — gentle, not dramatic. Below: in medium thin weight, "You're offline." Below: a quiet paragraph in thin — "We can't reach the server right now. Your recent routines are saved and playable from the library." Below: a solid terracotta pill "Try again." Below the pill, a thin outlined sage pill "Open offline routines." The screen feels patient.

5. Force Update — Warm cream field. Top: thin ink-line illustration of a small key being rotated — a gentle unlocking motion. Below: in medium thin weight, "There's a newer DeskCare." Below: a quiet paragraph — "We made some things softer and faster. Please update to keep going." Below: solid terracotta pill "Open App Store." No skip link. The screen is firm but kind.

6. Maintenance — Warm cream field. Top: a thin ink-line illustration of a small chair being wiped clean — a quiet care motion. Below: in medium thin weight, "We're tidying up." Below: a quiet paragraph in thin — "Back in about 20 minutes. Your streak is safe. Your check-ins are waiting." Below: a whisper tracked label "ESTIMATED RETURN · 14:30 UTC". No primary button. The screen feels like a closed door with a note on it.

Primary Design Surface: App.
```

---

## Сводка

| # | Prompt | Экраны | Тип |
|---|--------|--------|-----|
| 0 | Master Component Sheet | 6 foundation components | Component Sheet |
| 1 | Onboarding Act I | 1.2, 1.3, 1.4 | App-Level (3) |
| 2 | Onboarding Act II | 1.5, 1.6, 1.7 | App-Level (3) |
| 3 | Onboarding Act III | 1.8, 1.9, 1.10 | App-Level (3) |
| 4 | Home (4 states) | 3.1 × 4 состояния | App-Level (4) |
| 5 | Library + Detail | 3.2, 3.2.1 free, 3.2.1 locked | App-Level (3) |
| 6 | Programs + Sciatica + Symptom | 3.3, 3.3.1 locked, 3.3.1 active, 3.3.1.1 | App-Level (4) |
| 7 | Eye Program | 3.3.2 (2 states) | App-Level (2) |
| 8 | Exercise Flow | 4.1, 4.2 playing, 4.2 paused, 4.3 | App-Level (4) |
| 9 | Profile + Progress + Pain History | 3.4, 3.4.1, 3.4.2 | App-Level (3) |
| 10 | Settings Stack | 3.4.3, 3.4.3.1, 3.4.3.3 | App-Level (3) |
| 11 | Monetization Modals | 5.1, 5.2, 5.3 | App-Level (3) |
| 12 | Engagement Modals | 5.4, 5.5, 5.6, 5.8 | App-Level (4) |
| 13 | Auth + System | 2.1, 2.2, 6.1, 6.2, 6.3, 6.4 | Component Sheet (6) |

**Итого:** 14 промптов, 55 view states (39 экранов + extra состояния Home/Player/Session).

**Не покрыто промптами:**
- 5.7 Share Sheet — нативный iOS/Android, не дизайнится
- 3.4.3.2 Profile Edit, 3.4.3.4 Appearance, 3.4.3.5 Privacy — по образцу Settings root + Reminder Settings, отдельный промпт не нужен

---

## План запуска

1. **Сначала #0** — Master Component Sheet. Сохрани результат. Это reference для всего остального.
2. **Потом #1–#3** — весь онбординг подряд. Это воронка, стиль должен быть согласованный.
3. **#4 Home** — следующий ключевой. Отдельно, потому что 4 состояния за один прогон рискованно — если не вытянет, запусти двумя (#4a empty + first-day, #4b premium + re-engage).
4. **#8 Exercise Flow** — ядро продукта. После Home.
5. **Остальное** — в любом порядке, по мере квоты.

**Квота Pro (50/мес):** хватит на 14 промптов × 3 попытки = 42 прогона. Запас на 8 прогонов для refine/перегенераций.

---

## Если какой-то промпт не зайдёт

1. **Не используй refine-mode для перегенерации всего экрана.** Refine работает для локальных правок (цвет акцента, замена иконки). Полную перегенерацию делай через новый prompt.
2. **Проверь, что Stitch в Pro-режиме** — Flash даёт более generic результат.
3. **Если атмосфера съехала в "wellness app generic"** — проверь, не пропало ли упоминание "desk", "between meetings", "at your keyboard". Без них Stitch уходит в meditation/yoga territory.
4. **Если вышло монохромно коричневым** (как v5/v6 в HelpDesk-итерациях) — добавь фразу "three-color family: sage, cream, terracotta — all three must be visible" в CRITICAL RULES.
5. **Если метафоры угнали UI** (как v7 HelpDesk с "Mist Density") — это значит, атмосферный язык зашёл слишком глубоко. Сократи метафоры в labels, оставь их в описаниях форм.

---

## Источники формулы

- [FORMULA.md](../../../sugar-quit/docs/06-design/style-exploration/FORMULA.md) — 13 правил
- [ATOMS-FULL.md](../../../sugar-quit/docs/06-design/style-exploration/ATOMS-FULL.md) — атомный разбор
- [DESIGN-CONTEXT-HANDOFF.md](../../../../DESIGN-CONTEXT-HANDOFF.md) — история итераций, что работает/не работает
