# CatStack — a RevenueCat Paywall POC

A tiny React Native app (Expo + TypeScript) that wires up a [RevenueCat](https://www.revenuecat.com)-powered paywall end to end:

- **Free users** see one cat.
- **Premium users** unlock an unlimited cat gallery.

Built as a hands-on artifact to get fluent with the mobile subscription flow from a **Sales / Solutions Engineering** angle — i.e. the exact integration a RevenueCat prospect does on day one, so I can demo it, debug it, and speak to it credibly.

## What it demonstrates

| Concept | Where |
|---------|-------|
| SDK configuration | `src/purchases.ts` → `initPurchases()` |
| Fetching offerings/packages | `getCurrentOffering()` |
| Gating features on an **entitlement** (not a product id) | `isPremium()` — the right way to check access |
| Purchase flow + user-cancel handling | `App.tsx` → `buy()` |
| Restore purchases | `App.tsx` → `restore()` |
| Reacting to renewals/restores in real time | `addCustomerInfoUpdateListener` |

The deliberate design choice worth calling out: access is gated on the **`premium` entitlement**, never on a specific product/price id. That's RevenueCat's core idea — you can change products, prices, and platforms without touching the gating logic.

## Architecture

```
App.tsx  ──configure──▶  RevenueCat SDK  ──▶  App Store / Play Store
   │                          │
   │   getOfferings()         │  getCustomerInfo()
   ▼                          ▼
 paywall UI       entitlements.active[ENTITLEMENT_ID]  ──▶  unlock gallery
```

## Run it

> RevenueCat needs native modules, so this runs in a **dev build**, not Expo Go.

```bash
npm install
npm run typecheck            # sanity-check the TS without a device

# add your PUBLIC SDK keys in src/config.ts, then:
npx expo prebuild
npm run ios                  # or: npm run android
```

### Dashboard setup (one-time, ~10 min)

1. Create a project at [app.revenuecat.com](https://app.revenuecat.com).
2. Add your apps and paste the SDK keys into `src/config.ts`. (For a zero-store demo, use a **Test Store** app — its `test_` key simulates purchases with no App Store / Play Console account. Note: Test Store needs `react-native-purchases` **v9+**; older versions throw `Store does not contain element 'test_store'`.)
3. Create an entitlement, then set `ENTITLEMENT_ID` in `src/config.ts` to its identifier. **The two must match exactly** — otherwise the purchase succeeds but the UI never unlocks, because the entitlement is granted under a name the app isn't checking. (This repo uses `catstack_premium_monthly`.)
4. Create a product (subscription), and **attach it to that entitlement**.
5. Create an **Offering** with a package containing that product, and mark it **current**.
6. Run the purchase: tap Go Premium → on the Test Store sheet choose **TEST VALID PURCHASE**.

Until step 5 is done the app runs fine and shows a friendly "no offering found" message — so you can see the UI before the store config is complete.

## How I'd take this further with a customer

- **RevenueCat Paywalls (remote-config UI)** — replace the hand-rolled paywall with a dashboard-configured one so marketing can A/B test copy/pricing without a release.
- **Experiments** — measure conversion across price points.
- **Webhooks + integrations** — pipe subscription events into the customer's data stack (their "acquire → convert → retain" funnel).
- **Cross-platform identity** — `logIn(appUserId)` so entitlements follow the user across iOS, Android, and web.

## Tech

- Expo SDK 51, React Native 0.74, TypeScript (strict)
- [`react-native-purchases`](https://github.com/RevenueCat/react-native-purchases) v8
- Cat images via [cataas.com](https://cataas.com) (no key required)
