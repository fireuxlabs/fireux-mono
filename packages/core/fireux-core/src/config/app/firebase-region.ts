// Concurrent edit — 2026-07-21 12:37 CEST — Cleanbox-to-Werkbox migration: name the current product while retaining the legacy eur3 binding.
export function defaultNitroFirebaseRegion(ecosystem: string): string {
  switch (ecosystem) {
    case 'misebox':
      return 'europe-west6'
    default:
      // FireUX + Werkbox use Firestore multi-region eur3; eur3 is not a
      // deployable Cloud Functions region, so we default to a nearby region.
      return 'europe-west1'
  }
}
