import { Platform } from 'react-native';

/**
 * RevenueCat PUBLIC SDK keys.
 * Dashboard → Project Settings → API keys. These are public app keys and are
 * safe to ship in a mobile binary — NEVER put a RevenueCat secret key here.
 */
export const RC_API_KEY = Platform.select({
  ios: 'test_bErEUXgbHDgPkguEZvIlFTPkhxV',
  android: 'test_bErEUXgbHDgPkguEZvIlFTPkhxV',
}) as string;

/**
 * The entitlement identifier you create in the RevenueCat dashboard
 * (Entitlements → +). Granting this entitlement is what unlocks premium.
 */
export const ENTITLEMENT_ID = 'catstack_premium_monthly';
