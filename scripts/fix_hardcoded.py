#!/usr/bin/env python3
"""One-off: replace hardcoded user-facing strings with t() calls.

Each replacement is precise (full string match) to avoid touching anything else.
"""
import os, re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

EDITS = [
    # programs/sciatica.tsx — replace the hardcoded bullets ARRAY
    (
        'app/programs/sciatica.tsx',
        "'Every exercise with contraindications',",
        "t('sciatica_feature_cautions'),",
    ),
    (
        'app/programs/sciatica.tsx',
        "'Weekly progress summary',",
        "t('sciatica_feature_weekly'),",
    ),
    # programs/symptom-checker.tsx — button text (the visible one, not aria)
    (
        'app/programs/symptom-checker.tsx',
        "{redFlagActive ? 'Pause the program' : 'Adapt today'}",
        "{redFlagActive ? t('symptom_cta_pause') : t('symptom_cta_adapt')}",
    ),
    # modals/rate-app.tsx — CTA text
    (
        'app/modals/rate-app.tsx',
        "{rating === 0 ? 'Maybe later' : rating >= 4 ? 'Rate on the App Store' : 'Send feedback'}",
        "{rating === 0 ? t('rate_app_cta_maybe_later') : rating >= 4 ? t('rate_app_cta_rate') : t('rate_app_cta_feedback')}",
    ),
    # profile/delete-account.tsx — Alert buttons
    (
        'app/profile/delete-account.tsx',
        "{ text: 'Cancel', style: 'cancel' },",
        "{ text: t('common_cancel'), style: 'cancel' },",
    ),
    (
        'app/profile/delete-account.tsx',
        "text: 'Delete forever',",
        "text: t('common_delete_forever'),",
    ),
    # settings/notifications.tsx — 'Eye break' label
    (
        'app/settings/notifications.tsx',
        "      'Eye break',",
        "      t('notif_eye_break_label'),",
    ),
    # onboarding/labor-illusion.tsx — progress step text
    (
        'app/onboarding/labor-illusion.tsx',
        "  'Reading your answers',",
        "  t('labor_step_reading'),",
    ),
    (
        'app/onboarding/labor-illusion.tsx',
        "  'Matching exercises to your shoulders',",
        "  t('labor_step_matching'),",
    ),
    # onboarding/paywall.tsx — feature bullet
    (
        'app/onboarding/paywall.tsx',
        "  'Personal routines by your pain zones',",
        "  t('paywall_feature_zones'),",
    ),
    # onboarding/plan.tsx — step labels
    (
        'app/onboarding/plan.tsx',
        "{i === 0 ? 'Based on your neck answers' : i === 1 ? 'Desk-posture counter' : 'Screen recovery'}",
        "{i === 0 ? t('plan_step_neck') : i === 1 ? t('plan_step_posture') : t('plan_step_recovery')}",
    ),
]

count = 0
missing = []
for rel, old, new in EDITS:
    p = os.path.join(ROOT, rel)
    if not os.path.exists(p):
        missing.append(rel); continue
    text = open(p).read()
    if old not in text:
        missing.append(f'{rel}  pattern not found')
        continue
    text = text.replace(old, new, 1)
    open(p, 'w').write(text)
    count += 1
    print(f'  patched {rel}: {old[:60]}...')

print(f'\nApplied {count} of {len(EDITS)} edits.')
if missing:
    print('Missing:')
    for m in missing:
        print(f'  {m}')
