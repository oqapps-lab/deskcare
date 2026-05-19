#!/usr/bin/env python3
"""List DeskCare TestFlight builds with their beta-group attachment."""
import jwt
import time
import urllib.request
import urllib.parse
import urllib.error
import json
import sys

APP_ID = '6767548896'
key = open('/Users/evgenij/.appstoreconnect/private_keys/AuthKey_787835NFD8.p8').read()


def tok():
    return jwt.encode(
        {
            'iss': '2f01e90d-40ee-4f1d-9a37-651713378b40',
            'iat': int(time.time()),
            'exp': int(time.time()) + 1200,
            'aud': 'appstoreconnect-v1',
        },
        key,
        algorithm='ES256',
        headers={'kid': '787835NFD8', 'typ': 'JWT'},
    )


def fetch(url, headers, retries=4):
    last_err = None
    for i in range(retries):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=headers)).read()
        except urllib.error.HTTPError as e:
            last_err = e
            if e.code == 403:
                time.sleep(15 * (i + 1))
                continue
            raise
    raise last_err


H = {'Authorization': f'Bearer {tok()}'}
qs = urllib.parse.urlencode({'filter[app]': APP_ID, 'sort': '-uploadedDate', 'limit': '3'})
data = json.loads(fetch(f'https://api.appstoreconnect.apple.com/v1/builds?{qs}', H))['data']

print('=== Recent builds ===')
for b in data:
    a = b['attributes']
    print(
        f'  build {a.get("version"):>3}  state={a.get("processingState"):>10}  '
        f'uploaded={a.get("uploadedDate")[:16]}  expired={a.get("expired")}'
    )

# Per-group attachment (one extra call, may 403 if rate-limited — soft fail)
print()
print('=== Internal QA group membership ===')
try:
    time.sleep(5)
    grps = json.loads(fetch(f'https://api.appstoreconnect.apple.com/v1/betaGroups?filter[app]={APP_ID}', H))['data']
    for g in grps:
        if not g['attributes'].get('isInternalGroup'):
            continue
        gid = g['id']
        gname = g['attributes'].get('name', '?')
        time.sleep(5)
        # list builds attached to this group
        try:
            b_in_g = json.loads(fetch(f'https://api.appstoreconnect.apple.com/v1/betaGroups/{gid}/builds?limit=5', H))['data']
            vers = ','.join(b['attributes'].get('version', '?') for b in b_in_g) or 'NONE'
            print(f'  group "{gname}" → builds: {vers}')
        except urllib.error.HTTPError as e:
            print(f'  group "{gname}" → API error ({e.code})')
except urllib.error.HTTPError as e:
    print(f'  API rate-limited ({e.code}) — try later')
