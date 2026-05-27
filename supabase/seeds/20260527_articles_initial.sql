-- Initial 8 editorial articles for the Knowledge tab.
-- Each: ~3-5 min read, English base + i18n columns blank (translated later).
-- Linked to body_zone via slug lookup, tagged for cross-surface discovery.

INSERT INTO articles (slug, body_zone_id, title, excerpt, body_markdown,
                       cover_image_url, reading_minutes, tags, sort_order, published_at)
SELECT
  'why-your-neck-hurts-at-5pm',
  (SELECT id FROM body_zones WHERE slug = 'neck' LIMIT 1),
  'Why your neck hurts at 5pm',
  'Forward-head posture costs your spine 60 extra pounds of strain. Here''s what''s really happening — and three resets that work.',
  $md$
Your neck didn''t start hurting at 5pm. It started at 9am, when you tilted your head forward 30° to peer at the laptop. By lunch, the 12-pound load of your skull effectively weighs **42 pounds** on your cervical spine — basic physics of leverage. By 5pm, that''s 8 hours of sustained overload on muscles never designed for the job.

### The mechanic

The suboccipitals (four small muscles at the base of your skull) work like guy-wires keeping your head balanced. When your head drifts forward, they go from gentle stabilizers to constant load-bearers. Trapezius muscles join in. Levator scapulae too. Eventually they all spasm — and you call that "tension."

### Three resets

1. **Chin tucks** — Sit tall. Gently retract your chin (think "double-chin"). Hold 5 seconds. Repeat 10x. This re-engages the deep neck flexors that forward-head shuts off.

2. **Upper-trap stretch** — Tilt left ear toward left shoulder. Reach right hand toward floor. Hold 30 seconds per side.

3. **Reset every 25 minutes** — Not 60. The trapezius starts firing in fatigue around minute 22 of static load.

### When to worry

Persistent neck pain with arm tingling, headaches behind the eyes, or pain that wakes you at night — see a physiotherapist. Most office neck pain isn''t structural, but ruling it out matters.

The DeskCare neck routines target exactly this load pattern. Two minutes, three times a day, undoes most of what 5pm accumulates.
$md$,
  'https://oqapps.pro/cdn/deskcare/articles/neck-5pm-cover.jpg',
  3,
  ARRAY['posture', 'forward_head', 'ergonomics'],
  10,
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'why-your-neck-hurts-at-5pm');

INSERT INTO articles (slug, body_zone_id, title, excerpt, body_markdown,
                       cover_image_url, reading_minutes, tags, sort_order, published_at)
SELECT
  '20-20-20-rule-explained',
  (SELECT id FROM body_zones WHERE slug = 'eyes' LIMIT 1),
  'The 20-20-20 rule, actually explained',
  'Look 20 feet away for 20 seconds every 20 minutes. Why these numbers? And what does the research say?',
  $md$
Eye specialists hand out the 20-20-20 rule like a piece of candy. But the numbers aren''t arbitrary — they correspond to specific eye-muscle mechanics.

### What happens at 20 minutes

Your ciliary muscle (the lens-focusing muscle inside the eye) holds the same contracted shape while you stare at a screen. Around minute 20, fatigue products build up faster than they clear. This is when you start to feel "eye strain" — slightly blurred vision, ache behind the eyes, sometimes headache.

### Why 20 feet

The lens is fully relaxed (zero accommodation) at distances beyond about 20 feet (6 meters). Any closer and the muscle is still doing some work. Looking out a window down the street usually does it. Looking at a wall 8 feet away does *not* fully relax the lens.

### Why 20 seconds

Studies measured the time it takes for the ciliary muscle to fully relax once you give it a far focal point: ~13-17 seconds. 20 is the safe-rounded number.

### The hidden second issue: blink rate

Normal blink rate: 15-20 per minute. **Computer-staring blink rate: 3-7 per minute.** Tears evaporate, cornea dries — "computer vision syndrome" affects 69-94% of heavy screen users. The 20-20-20 break also forces some blinks.

### What DeskCare does

Our eye-break routine runs the 20-20-20 reminder, plus 5 evidence-based eye-muscle exercises (figure-8, near-far flex, palming) that target the ciliary + extraocular muscle groups together. Two minutes every 20 — and most CVS symptoms quietly fade.
$md$,
  'https://oqapps.pro/cdn/deskcare/articles/eyes-202020-cover.jpg',
  3,
  ARRAY['eye_strain', 'cvs', 'evidence'],
  20,
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = '20-20-20-rule-explained');

INSERT INTO articles (slug, body_zone_id, title, excerpt, body_markdown,
                       cover_image_url, reading_minutes, tags, sort_order, published_at)
SELECT
  'carpal-tunnel-first-signs',
  (SELECT id FROM body_zones WHERE slug = 'wrists' LIMIT 1),
  'Carpal tunnel: the first signs',
  'Numbness in the thumb at 3am isn''t random. Catch the early signs and a few wrist routines might be all you need.',
  $md$
Carpal tunnel syndrome (CTS) doesn''t start with constant pain. It starts at night.

### The early signature

The median nerve runs through a narrow tunnel in your wrist. When the tendons surrounding it swell — from typing, mouse-clutching, or holding a phone — pressure builds. Most people first notice:

- **Tingling at night** in thumb, index, middle finger (NOT pinky — the pinky is the ulnar nerve, different story)
- Shaking the hand makes it temporarily better
- Dropping pens, struggling with buttons or zippers
- Symptoms worse at the wrist than the fingers

### Why night?

Many of us sleep with wrists curled forward — the worst position for the carpal tunnel. Combined with daytime inflammation, you wake at 3am with that pins-and-needles wake-up call.

### What actually works (early stage)

1. **Wrist neutral at night** — a soft wrist splint keeps the wrist straight while you sleep. $15. Eliminates 60-70% of mild cases per the NIH trials.
2. **Nerve glides** (the wrist routine in DeskCare) — gentle median-nerve flossing reduces tunnel pressure
3. **Adjust your setup** — keyboard at elbow height, wrist neutral, no resting weight on the heel of the hand

### When to see someone

If you have:
- Constant numbness (not just at night)
- Visible thumb-base muscle wasting
- Weakness gripping
- Symptoms despite 2-3 weeks of routine + splinting

Get a nerve-conduction study. Untreated severe CTS can cause permanent nerve damage; mild cases almost always resolve with the basics above.

This is the kind of condition where 2 minutes of wrist work, twice a day, prevents a $5000 surgery later.
$md$,
  'https://oqapps.pro/cdn/deskcare/articles/wrists-cts-cover.jpg',
  4,
  ARRAY['carpal_tunnel', 'medical', 'prevention'],
  30,
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'carpal-tunnel-first-signs');

INSERT INTO articles (slug, body_zone_id, title, excerpt, body_markdown,
                       cover_image_url, reading_minutes, tags, sort_order, published_at)
SELECT
  'sciatica-vs-back-pain',
  (SELECT id FROM body_zones WHERE slug = 'sciatica' LIMIT 1),
  'Sciatica vs lower-back pain: how to tell',
  'Both feel like "my back hurts." But the treatment is completely different. Here''s the 30-second self-check.',
  $md$
"Sciatica" gets used as shorthand for any low-back pain. It''s not. Real sciatica is a specific nerve problem — and confusing the two delays the right routine.

### The 30-second self-check

Sit in a chair. Straighten one leg out in front, foot flexed up (toes toward you).

- **No change in symptoms?** → probably muscular low-back pain. Mobility work, glute strengthening, lifestyle fixes.
- **Sharp pain radiating from butt down the back of the leg, sometimes to the calf or foot?** → likely sciatica. The maneuver stretches the sciatic nerve; symptoms reproduce when the nerve is irritated.

### Why the distinction matters

**Muscular back pain** responds to:
- Glute activation, hamstring mobility
- Core strengthening (planks, dead bugs)
- Avoiding prolonged static positions

**Sciatica** responds to:
- Nerve glides (NOT regular stretching — over-stretching an irritated nerve makes it worse)
- Position-finding (some people feel relief sitting back, others lying down; figure out which)
- Avoiding the disc-loading positions (forward-bending under load)

### The piriformis trap

About 10% of sciatica isn''t from a disc — it''s the piriformis muscle pinching the nerve. Same symptoms, different fix. The DeskCare sciatica program has both nerve-disc patterns and piriformis-release patterns; the symptom checker triages.

### Red flags — see a doctor immediately

- Numbness in the saddle (groin/inner thighs)
- Loss of bladder or bowel control
- Progressive leg weakness (foot drop)

These are cauda equina symptoms — a medical emergency. Almost everyone reading this won''t have these. But it''s the test we run before any program work.
$md$,
  'https://oqapps.pro/cdn/deskcare/articles/sciatica-vs-back-cover.jpg',
  4,
  ARRAY['sciatica', 'medical', 'diagnosis'],
  40,
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'sciatica-vs-back-pain');

INSERT INTO articles (slug, body_zone_id, title, excerpt, body_markdown,
                       cover_image_url, reading_minutes, tags, sort_order, published_at)
SELECT
  'sitting-not-new-smoking',
  (SELECT id FROM body_zones WHERE slug = 'back' LIMIT 1),
  'Sitting isn''t the new smoking',
  'The famous quote isn''t quite right. The research is more nuanced — and more actionable.',
  $md$
James Levine''s "sitting is the new smoking" went viral around 2014. It overstated the case. What the research actually shows is more useful.

### What''s true

- People who sit 8+ hours a day, with no exercise, have ~40% higher all-cause mortality risk vs active sitters (Lancet 2016 meta-analysis, ~1M subjects)
- Prolonged static sitting reduces lipoprotein lipase activity → triglycerides accumulate
- Posterior chain muscles (glutes, hamstrings) shut down within 90 minutes of continuous sitting

### What''s not true

- Sitting doesn''t cause cancer the way smoking does (totally different mechanism)
- 60-75 minutes of daily moderate exercise ELIMINATES the sitting-related mortality risk in the same study. Smoking damage isn''t similarly "undoable."

### The actionable finding

The variable that matters isn''t hours-of-sitting. It''s **bouts of uninterrupted sitting.**

People who sit 8 hours but break every 30 minutes have similar markers to people who sit 4 hours straight. The frequent micro-breaks reset glucose handling and muscle activity.

### DeskCare math

Two-minute routine every 30 minutes during an 8-hour workday = 16 micro-breaks × 2 min = 32 minutes of movement broken up into doses your body actually uses.

Compare: one 60-minute gym session after 9 hours of unbroken sitting — better than nothing, but the body has already done most of the metabolic damage by then.

The "sitting is bad" panic gets the dose wrong. Frequency matters more than duration. DeskCare optimizes for the right variable.
$md$,
  'https://oqapps.pro/cdn/deskcare/articles/back-sitting-myth-cover.jpg',
  3,
  ARRAY['posture', 'evidence', 'habits'],
  15,
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'sitting-not-new-smoking');

INSERT INTO articles (slug, body_zone_id, title, excerpt, body_markdown,
                       cover_image_url, reading_minutes, tags, sort_order, published_at)
SELECT
  'computer-vision-syndrome',
  (SELECT id FROM body_zones WHERE slug = 'eyes' LIMIT 1),
  'Computer Vision Syndrome: more than tired eyes',
  'Up to 94% of heavy screen users have it. The symptoms cluster, the fix is mostly habits.',
  $md$
Computer Vision Syndrome (CVS) is an umbrella term for the cluster of symptoms 69-94% of frequent screen users experience. The American Optometric Association uses six markers:

1. **Eye strain** — generalized ache around or behind the eyes
2. **Headaches** — typically frontal or temporal, building toward end of day
3. **Blurred vision** — especially after long focus blocks
4. **Dry eyes** — burning, gritty, or watery (paradoxically)
5. **Neck/shoulder pain** — from forward-head + screen-distance combo
6. **Light sensitivity** — symptom of accumulated strain

If you have 3+ of these consistently, you''ve got CVS.

### What''s actually happening

Three problems compound:
- **Accommodation lag** — ciliary muscle fatigues holding near focus
- **Reduced blink rate** — dropping from 17 to 6 per minute dries the cornea
- **Vergence stress** — your eyes have to converge slightly for close work, holding that converged-inward position 8 hours a day

### The fixes that actually work

1. **20-20-20** breaks (the discipline matters more than the exact numbers)
2. **Conscious blinking** — when you remember, do 5 slow, complete blinks
3. **Screen position** — top of monitor at or slightly below eye level, ~24 inches away (an arm''s length)
4. **Reduce blue light** — Night Shift / Night Light from sunset
5. **Hydration** — actually relevant; dehydrated tear film is the #1 dry-eye trigger
6. **Computer glasses** (worth trying if symptoms persist) — slight magnification reduces accommodation demand

### When to see an optometrist

If symptoms persist 2+ weeks after habit changes — you might need:
- A corrected prescription (uncorrected mild astigmatism is a top CVS hidden cause)
- Targeted glasses for screen distance specifically (not your normal prescription)
- Dry eye treatment (preservative-free artificial tears, omega-3s)

DeskCare''s eye routines target #1-3 directly. The rest is on you.
$md$,
  'https://oqapps.pro/cdn/deskcare/articles/eyes-cvs-cover.jpg',
  4,
  ARRAY['eye_strain', 'cvs', 'medical'],
  30,
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'computer-vision-syndrome');

INSERT INTO articles (slug, body_zone_id, title, excerpt, body_markdown,
                       cover_image_url, reading_minutes, tags, sort_order, published_at)
SELECT
  'standing-desk-hype-research',
  (SELECT id FROM body_zones WHERE slug = 'back' LIMIT 1),
  'Standing desks: hype vs research',
  'They''re not magic. They''re not useless. The evidence says use them in 30-60 min bouts and your back will probably thank you.',
  $md$
Standing desks became the office hero of 2014. The marketing has since outrun the science. Here''s what the research actually shows.

### What standing improves

- Lower-back compressive load drops ~40-60% vs sitting (when posture is decent)
- Caloric expenditure: ~50 extra kcal/hour (not life-changing, but real)
- Self-reported back-pain reduction in 5/7 randomized trials over 2014-2022

### What standing doesn''t fix

- Productivity differences: zero in most studies
- Heart-disease markers: no benefit beyond what walking provides
- Calf/foot pain: worse if you stand 8 hours straight

### The optimal pattern (per Cornell ergonomics research)

**30-50% standing, 50-70% sitting, alternated every 30-60 minutes.**

Not "stand all day." Not "sit all day." The transitions matter.

### Buying advice

- Electric height-adjustable: yes (cheaper ones from $300 work fine)
- Manual crank: tolerable but you''ll skip transitioning
- Standing mat: necessary if you stand >60 minutes/day total
- Monitor needs separate height adjustment when desk moves — get a monitor arm

### The hidden trap

People buy standing desks and **never change height.** It sits at one height for 6 months and becomes a regular desk. The behavior change matters more than the equipment.

### What DeskCare adds

Reminders can include "switch to standing now" alongside stretching prompts. Pair the desk transition with a 2-min routine. Two habit-stacks become one — much more likely to stick.
$md$,
  'https://oqapps.pro/cdn/deskcare/articles/back-standing-desk-cover.jpg',
  3,
  ARRAY['ergonomics', 'standing_desk', 'evidence'],
  25,
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'standing-desk-hype-research');

INSERT INTO articles (slug, body_zone_id, title, excerpt, body_markdown,
                       cover_image_url, reading_minutes, tags, sort_order, published_at)
SELECT
  'sleep-and-back-pain',
  (SELECT id FROM body_zones WHERE slug = 'back' LIMIT 1),
  'How sleep affects your back pain',
  'Mattress firmness matters less than mattress age. Sleep position matters less than transition habits. Here''s the prioritized list.',
  $md$
The mattress industry sells you the wrong story. Pillow companies sell you a worse one. Sleep research tells a more practical story.

### The actual hierarchy of impact (high to low)

1. **Mattress age** — A mattress >8 years old is the strongest predictor of waking back pain. Replacing an 8-year mattress reduces back-pain reports by ~50% (Oklahoma State sleep study). Firmness is secondary.

2. **Wake-up position** — Spending 6+ hours in fetal position with hips/knees flexed shortens hip flexors. Your AM back stiffness is mostly that, not "the mattress."

3. **The first 5 minutes after waking** — The spine is dehydrated and stiff. Don''t bend forward to put on socks; sit at edge of bed, ankle-toe pumps, then stand. Pain reports drop 30-40% with this one habit.

4. **Pillow height** — Side sleeper: pillow fills the gap between neck and shoulder (thicker). Back sleeper: thinner pillow, slight support under knees. Stomach sleepers: don''t. Find another position.

5. **Mattress firmness** — Medium-firm wins most trials. "Hard is good for back" is myth.

### Sleep position and sciatica

Side-sleeping with a pillow between the knees keeps the pelvis level. This alone reduces nighttime sciatica flare-ups in ~70% of mild cases. Total cost: one extra pillow.

### When your back wakes you up

If pain wakes you between 2-5am consistently:
- Could be inflammatory (ankylosing spondylitis red flag — see rheumatologist)
- More likely: muscular spasm from a held position too long
- Get up, walk 60 seconds, gentle backward bend (extension), back to bed

### Where DeskCare fits

Our wake-up routine (60 seconds, three exercises) targets exactly the issues #2 and #3 above. It''s the bridge from "stiff at wake" to "moving comfortably by 8:30am" that makes the rest of the day''s desk work tolerable.
$md$,
  'https://oqapps.pro/cdn/deskcare/articles/back-sleep-cover.jpg',
  3,
  ARRAY['sleep', 'habits', 'recovery'],
  35,
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'sleep-and-back-pain');
