import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import {
  initPurchases,
  getCurrentOffering,
  getCustomerInfo,
  isPremium,
} from './src/purchases';

// Cat as a Service — fresh cat each call, no API key needed.
const catUrl = () => `https://cataas.com/cat?cache=${Date.now()}-${Math.random()}`;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [premium, setPremium] = useState(false);
  const [pkg, setPkg] = useState<PurchasesPackage | null>(null);
  const [cats, setCats] = useState<string[]>([catUrl()]);
  const [error, setError] = useState<string | null>(null);

  // Boot: configure the SDK, load the offering, read current entitlement state.
  useEffect(() => {
    (async () => {
      try {
        initPurchases();
        const offering = await getCurrentOffering();
        setPkg(offering?.availablePackages[0] ?? null);
        const info = await getCustomerInfo();
        setPremium(isPremium(info));
        // Keep UI in sync with renewals / restores / cross-device changes.
        Purchases.addCustomerInfoUpdateListener((i) => setPremium(isPremium(i)));
      } catch (e) {
        setError(asMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const buy = async () => {
    if (!pkg) return;
    setLoading(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      setPremium(isPremium(customerInfo));
    } catch (e) {
      // The SDK flags user-initiated cancels — those aren't errors.
      if (!(e as { userCancelled?: boolean }).userCancelled) setError(asMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const restore = async () => {
    setLoading(true);
    try {
      setPremium(isPremium(await Purchases.restorePurchases()));
    } catch (e) {
      setError(asMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const addCat = () => setCats((c) => [catUrl(), ...c]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  const visibleCats = premium ? cats : cats.slice(0, 1);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>🐱 CatStack</Text>
      <Text style={styles.subtitle}>
        {premium ? 'Premium — unlimited cats unlocked' : 'Free — one cat at a time'}
      </Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <ScrollView contentContainerStyle={styles.gallery} showsVerticalScrollIndicator={false}>
        {visibleCats.map((url) => (
          <Image key={url} source={{ uri: url }} style={styles.cat} />
        ))}
      </ScrollView>

      {premium ? (
        <Pressable style={styles.primary} onPress={addCat}>
          <Text style={styles.primaryText}>Add another cat 🐾</Text>
        </Pressable>
      ) : (
        <View style={styles.paywall}>
          <Text style={styles.paywallTitle}>Unlock unlimited cats</Text>
          {pkg ? (
            <Pressable style={styles.primary} onPress={buy}>
              <Text style={styles.primaryText}>Go Premium — {pkg.product.priceString}</Text>
            </Pressable>
          ) : (
            <Text style={styles.error}>
              No offering found. Create an offering + package in the RevenueCat dashboard and mark
              it current.
            </Text>
          )}
          <Pressable onPress={restore} hitSlop={12}>
            <Text style={styles.link}>Restore purchases</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

function asMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf9ff', paddingHorizontal: 20, paddingTop: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#faf9ff' },
  title: { fontSize: 28, fontWeight: '800', color: '#1d1d28' },
  subtitle: { fontSize: 14, color: '#6b6b78', marginTop: 2, marginBottom: 16 },
  gallery: { gap: 14, paddingBottom: 16 },
  cat: { width: '100%', height: 280, borderRadius: 16, backgroundColor: '#eceaf6' },
  paywall: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eceaf6',
    alignItems: 'center',
  },
  paywallTitle: { fontSize: 16, fontWeight: '700', color: '#1d1d28', marginBottom: 12 },
  primary: {
    backgroundColor: '#6c5ce7',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  link: { color: '#6c5ce7', fontSize: 13, fontWeight: '600' },
  error: { color: '#d63031', fontSize: 13, marginBottom: 12, textAlign: 'center' },
});
