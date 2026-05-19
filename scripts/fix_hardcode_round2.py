#!/usr/bin/env python3
"""Round 2 — fix remaining user-facing hardcoded literals."""
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

EDITS = [
    ('app/auth/sign-in.tsx',
     'placeholder="you@example.com"',
     "placeholder={t('auth_placeholder_email')}"),
    ('app/auth/sign-up.tsx',
     'placeholder="you@example.com"',
     "placeholder={t('auth_placeholder_email')}"),
    ('app/auth/sign-up.tsx',
     'placeholder="6+ characters"',
     "placeholder={t('auth_placeholder_password')}"),
    ('app/exercise/player.tsx',
     "accessibilityLabel={paused ? 'Resume' : 'Pause'}",
     "accessibilityLabel={paused ? t('player_a11y_resume') : t('player_a11y_pause')}"),
    ('app/exercise/player.tsx',
     "accessibilityLabel={icon === 'skip-back' ? 'Previous step' : 'Next step'}",
     "accessibilityLabel={icon === 'skip-back' ? t('player_a11y_prev') : t('player_a11y_next')}"),
    ('app/eye/session.tsx',
     "accessibilityLabel={paused ? 'Resume' : 'Pause'}",
     "accessibilityLabel={paused ? t('player_a11y_resume') : t('player_a11y_pause')}"),
    ('app/onboarding/quiz/frequency.tsx',
     "accessibilityLabel={choice ? 'Next step' : 'Pick an option'}",
     "accessibilityLabel={choice ? t('quiz_a11y_next') : t('quiz_a11y_pick_option')}"),
    ('app/onboarding/quiz/work.tsx',
     "accessibilityLabel={choice ? 'Next step' : 'Pick a work type'}",
     "accessibilityLabel={choice ? t('quiz_a11y_next') : t('quiz_a11y_pick_work')}"),
    ('app/onboarding/quiz/goal.tsx',
     "accessibilityLabel={canAdvance ? 'Ready — continue to plan' : 'Pick a goal and hours'}",
     "accessibilityLabel={canAdvance ? t('quiz_a11y_ready_plan') : t('quiz_a11y_pick_goal')}"),
    ('app/programs/symptom-checker.tsx',
     "accessibilityLabel={redFlagActive ? 'Pause program' : canAdapt ? 'Adapt today' : 'Pick at least one'}",
     "accessibilityLabel={redFlagActive ? t('symptom_a11y_pause') : canAdapt ? t('symptom_a11y_adapt') : t('symptom_a11y_pick')}"),
]

count = 0; missing = []
for rel, old, new in EDITS:
    p = os.path.join(ROOT, rel)
    if not os.path.exists(p):
        missing.append(f'{rel} MISSING'); continue
    text = open(p).read()
    if old not in text:
        missing.append(f'{rel} pattern not found'); continue
    text = text.replace(old, new, 1)
    open(p, 'w').write(text)
    count += 1
    print(f'  patched {rel}')

print(f'\nApplied {count}/{len(EDITS)}')
if missing:
    for m in missing:
        print(f'  MISS: {m}')
