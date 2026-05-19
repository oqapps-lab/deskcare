#!/usr/bin/env python3
"""Hardcode audit v2 — find every user-facing English literal that lacks t()."""
import os, re
from collections import defaultdict

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

# Lines containing string-literals we suspect are user-facing
SUSPECT_RE = re.compile(
    r'''(?:
        accessibilityLabel\s*=\s*[\{"'`]([^"'`}]{4,})  |  # accessibilityLabel="..."
        placeholder\s*=\s*[\{"'`]([^"'`}]{3,})        |  # placeholder="..."
        title\s*=\s*[\{"'`]([A-Z][^"'`}]{3,})         |  # title="..." (PascalCase only — to avoid styles)
        Alert\.alert\(\s*[\{"'`]([^"'`}]{3,})         |  # Alert.alert('Title', ...)
        \btext:\s*[\{"'`]([A-Z][^"'`}]{2,})           |  # text: 'Cancel'
        \blabel:\s*[\{"'`]([A-Z][^"'`}]{2,})          |  # label: 'Foo'
        >\s*([A-Z][a-z]+(?:\s+[A-Za-z][a-z]+){0,8})\s*<  # JSX text node
    )''',
    re.VERBOSE,
)

# False positives: lines that are clearly non-user (config, styles, types)
BAD_LINE = re.compile(
    r'(colors\.|gradients\.|spacing\.|typeScale|fontFamily|StyleSheet|'
    r'borderColor|backgroundColor|borderWidth|console\.|process\.env|'
    r'pose=|tint=|tone=|mode=|variant=|^\s*import |^\s*export |^\s*type |^\s*interface |'
    r'PRODUCT_BUNDLE|EXPO_PUBLIC|node_modules)',
)
ALREADY_LOC = re.compile(r"\bt\(|i18nField\(|colors\.[a-z]|spacing\.|radii\.|typeScale\.")

hits = []
for sub in ['app', 'components']:
    base = os.path.join(ROOT, sub)
    for root, _, files in os.walk(base):
        for f in files:
            if not f.endswith('.tsx'): continue
            p = os.path.join(root, f)
            text = open(p).read()
            for i, line in enumerate(text.split('\n'), 1):
                if line.strip().startswith('//') or line.strip().startswith('*'): continue
                if BAD_LINE.search(line): continue
                m = SUSPECT_RE.search(line)
                if not m: continue
                if ALREADY_LOC.search(line): continue
                captured = next((g for g in m.groups() if g), '')
                if not captured or captured == captured.upper(): continue  # skip ALLCAPS (constants)
                if len(captured.split()) < 2 and len(captured) < 5: continue  # skip single short
                rel = p.replace(ROOT + '/', '')
                hits.append((rel, i, captured, line.strip()[:140]))

print(f'Found {len(hits)} suspect user-facing literals:\n')
by_file = defaultdict(list)
for rel, line, cap, snippet in hits:
    by_file[rel].append((line, cap, snippet))
for rel in sorted(by_file):
    print(f'\n{rel}:  ({len(by_file[rel])} hits)')
    for line, cap, snippet in by_file[rel]:
        print(f'  L{line:4d}  "{cap[:50]}"  →  {snippet}')
