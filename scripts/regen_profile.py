#!/usr/bin/env python3
"""Regenerate DeskCare provisioning profile bound to the cert in credentials/dist.p12."""
import jwt, time, json, base64, hashlib, urllib.request, urllib.error, subprocess, sys

KEY_PATH = '/Users/evgenij/.appstoreconnect/private_keys/AuthKey_787835NFD8.p8'
KEY_ID = '787835NFD8'
ISSUER = '2f01e90d-40ee-4f1d-9a37-651713378b40'
BUNDLE_RESOURCE_ID = '7BWX3274Y3'  # from memory: ASC bundle ID for DeskCare
P12_PATH = '/Users/evgenij/Desktop/work/APP_DEVELOPMENT/deskcare/credentials/dist.p12'
P12_PW = 'solene'
PROFILE_OUT = '/Users/evgenij/Desktop/work/APP_DEVELOPMENT/deskcare/credentials/profile.mobileprovision'

# 1. SHA1 of cert in p12
sha1 = subprocess.check_output([
    'bash', '-c',
    f'openssl pkcs12 -in {P12_PATH} -nokeys -passin pass:{P12_PW} -clcerts 2>/dev/null '
    f'| openssl x509 -noout -fingerprint -sha1 2>&1'
]).decode().strip().split('=')[-1].replace(':', '')
print(f'Local p12 cert SHA1: {sha1}')

key = open(KEY_PATH).read()
def tok():
    return jwt.encode({
        'iss': ISSUER, 'iat': int(time.time()), 'exp': int(time.time())+1200,
        'aud': 'appstoreconnect-v1'
    }, key, algorithm='ES256', headers={'kid': KEY_ID, 'typ': 'JWT'})

def get(url):
    req = urllib.request.Request(url, headers={'Authorization': f'Bearer {tok()}'})
    return json.loads(urllib.request.urlopen(req).read())

def post(url, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers={
        'Authorization': f'Bearer {tok()}',
        'Content-Type': 'application/json',
    }, method='POST')
    return json.loads(urllib.request.urlopen(req).read())

# 2. List certs
certs = get('https://api.appstoreconnect.apple.com/v1/certificates?limit=200')['data']
print(f'Team has {len(certs)} certs total')
target = None
for c in certs:
    if c['attributes'].get('certificateType') not in ('DISTRIBUTION','IOS_DISTRIBUTION'):
        continue
    cert_b64 = c['attributes'].get('certificateContent')
    if not cert_b64: continue
    cert_der = base64.b64decode(cert_b64)
    cert_sha1 = hashlib.sha1(cert_der).hexdigest().upper()
    mark = '<<MATCH' if cert_sha1 == sha1 else ''
    print(f'  id={c["id"]:>12} {c["attributes"]["certificateType"]:>16} name={c["attributes"].get("name","")[:40]:40} sha1={cert_sha1} {mark}')
    if cert_sha1 == sha1:
        target = c

if not target:
    print('!! No matching cert in team. Cert in dist.p12 was revoked from ASC.')
    sys.exit(1)
cert_id = target['id']
print(f'\nUsing cert: {cert_id}')

# 3. Create new profile
print('Creating profile...')
try:
    resp = post('https://api.appstoreconnect.apple.com/v1/profiles', {
        'data': {
            'type': 'profiles',
            'attributes': {
                'name': f'DeskCare App Store {int(time.time())}',
                'profileType': 'IOS_APP_STORE',
            },
            'relationships': {
                'bundleId': {'data': {'type': 'bundleIds', 'id': BUNDLE_RESOURCE_ID}},
                'certificates': {'data': [
                    {'type': 'certificates', 'id': 'AJG6N6XHYV'},
                    {'type': 'certificates', 'id': 'L593U2TA2Z'},
                ]},
            }
        }
    })
except urllib.error.HTTPError as e:
    print(f'!! Profile create failed: HTTP {e.code}: {e.read().decode()[:500]}')
    sys.exit(1)

p_id = resp['data']['id']
content = resp['data']['attributes']['profileContent']
profile_bytes = base64.b64decode(content)
open(PROFILE_OUT, 'wb').write(profile_bytes)
print(f'New profile id={p_id} written to {PROFILE_OUT} ({len(profile_bytes)} bytes)')
