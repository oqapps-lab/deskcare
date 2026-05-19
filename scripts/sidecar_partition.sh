#!/bin/bash
# Sidecar — re-apply partition list to login keychain every 5s while
# /var/folders/.../eas-build-local-nodejs/* exists (i.e. a local build is
# running). Catches the case where fastlane's import_certificate races
# with our pre-build setup and re-installs the cert without partition_id.
sleep 60
LOGIN=$HOME/Library/Keychains/login.keychain-db
LOGIN_PW=3698
TMPROOT=/var/folders/24/3nqw627j08741kzx9_nh6l8c0000gn/T/eas-build-local-nodejs
while ls "$TMPROOT" 2>/dev/null | grep -q .; do
  security unlock-keychain -p "$LOGIN_PW" "$LOGIN" 2>/dev/null
  security set-key-partition-list \
    -S 'apple-tool:,apple:,codesign:,unsigned:,partition_id:com.apple.codesign' \
    -s -k "$LOGIN_PW" "$LOGIN" >/dev/null 2>&1
  sleep 5
done
echo "sidecar_done $(date)"
