export function defaultNitroFirebaseRegion(ecosystem: string): string {
  switch (ecosystem) {
    case 'misebox':
      return 'europe-west6'
    default:
      // FireUX + Cleanbox use Firestore multi-region eur3; eur3 is not a
      // deployable Cloud Functions region, so we default to a nearby region.
      return 'europe-west1'
  }
}
