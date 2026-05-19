#!/usr/bin/env python3
"""One-off: replace neck-specific complete-screen copy with generic.

Run: python3 scripts/fix_complete_copy.py
"""
import os

p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib', 'i18n.ts')
text = open(p).read()

PAIRS = [
    # title (English doubled appears twice)
    (r'''"That's two minutes\nyour neck didn't hold."''', "'Nicely done.'"),
    ("'Zwei Minuten,\\nin denen dein Nacken loslassen durfte.'", "'Gut gemacht.'"),
    ("'2分間、首を\\n解放できました。'", "'お疲れさまでした。'"),
    ('"Voilà deux minutes\\nque votre nuque a relâché."', "'Bien joué.'"),
    ("'목이 쉬지 못한\\n2분을 돌려받았어요.'", "'잘하셨어요.'"),
    ("'Dos minutos que\\ntu cuello no aguantó.'", "'Bien hecho.'"),
    ('"Due minuti in cui\\nil collo ha respirato."', "'Ben fatto.'"),
    ("'Twee minuten rust\\nvoor je nek.'", "'Goed gedaan.'"),
    ("'Det var två minuter\\ndin nacke inte höll.'", "'Bra jobbat.'"),
    ("'Foram dois minutos\\nque seu pescoço agradece.'", "'Muito bem.'"),
    # sub
    ("'Three small releases. Your shoulders should feel\\na little softer already.'",
     "'A small win for your day.'"),
    ("'Drei kleine Entlastungen. Deine Schultern sollten\\nsich schon etwas lockerer anfühlen.'",
     "'Ein kleiner Gewinn für deinen Tag.'"),
    ("'3つの小さなリリース。肩が少し\\nやわらかくなっているはずです。'",
     "'今日の小さな勝利が一つ。'"),
    ("'Trois petites décharges. Vos épaules devraient déjà\\nse sentir un peu plus légères.'",
     "'Un petit pas de plus aujourd\\'hui.'"),
    ("'세 번의 작은 이완이에요. 어깨가 벌써 조금\\n더 가볍게 느껴지실 거예요.'",
     "'오늘의 작은 승리예요.'"),
    ("'Tres pequeñas liberaciones. Tus hombros ya deberían\\nsentirse un poco más sueltos.'",
     "'Un pequeño avance para tu día.'"),
    ("'Tre piccoli rilasci. Le spalle dovrebbero già sentirsi\\nun po' più morbide.'",
     "'Una piccola vittoria per oggi.'"),
    ("'Drie kleine ontspanningen. Je schouders voelen\\nal een beetje zachter.'",
     "'Een kleine winst voor je dag.'"),
    ("'Tre små frigörelser. Axlarna borde kännas\\nlite mjukare redan.'",
     "'En liten vinst för din dag.'"),
    ("'Três pequenas liberações. Seus ombros já devem\\nestar um pouco mais soltos.'",
     "'Uma pequena vitória para o seu dia.'"),
]

n_replaced = 0
for old, new in PAIRS:
    if old in text:
        c = text.count(old)
        text = text.replace(old, new)
        n_replaced += c
        print(f'  replaced {c}x: {old[:60]}...')
    else:
        print(f'  NOT FOUND: {old[:60]}...')

open(p, 'w').write(text)
print(f'\nDone. {n_replaced} replacements total.')
