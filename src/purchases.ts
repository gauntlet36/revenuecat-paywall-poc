import Purchases, {
  CustomerInfo,
  PurchasesOffering,
} from 'react-native-purchases';
import { RC_API_KEY, ENTITLEMENT_ID } from './config';

/** Configure the SDK once, at app start. */
export function initPurchases(): void {
  Purchases.configure({ apiKey: RC_API_KEY });
}

/** The "current" offering you mark as default in the dashboard. */
export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

/** Single source of truth for "is this user premium?" — checks the entitlement. */
export function isPremium(info: CustomerInfo): boolean {
  return typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}
