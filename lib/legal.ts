/**
 * Legal + marketing URLs published on https://oqapps.pro.
 *
 * Hosted under /legal/deskfit/* — the project's original name on the
 * hosting bucket. The in-app brand is DeskCare but the static paths
 * predate the rename. Do NOT switch the paths without redeploying the
 * static site to /legal/deskcare/* — they're 404 there as of 2026-05-21.
 */

export const LEGAL_URLS = {
  privacy: 'https://oqapps.pro/legal/deskfit/privacy',
  terms: 'https://oqapps.pro/legal/deskfit/terms',
  support: 'https://oqapps.pro/legal/deskfit/support',
  deleteAccount: 'https://oqapps.pro/legal/deskfit/delete-account',
  marketing: 'https://oqapps.pro/products',
} as const;

export const SUPPORT_EMAIL = 'support@oqapps.pro';
export const PRIVACY_EMAIL = 'privacy@oqapps.pro';
export const PUBLISHER = 'OQapps';
