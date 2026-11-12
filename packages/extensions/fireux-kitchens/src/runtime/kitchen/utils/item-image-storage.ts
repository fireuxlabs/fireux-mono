// Concurrent edit — 2026-07-22 01:48 CEST — Item image atomicity: give every upload an immutable App-scoped object path.
// Concurrent edit — 2026-07-22 01:58 CEST — Item media ownership: keep storage under Item image without current/version product vocabulary.
export function itemImageStoragePath(
  kitchenId: string,
  dishId: string,
  writeId: string
) {
  return `kitchens/${kitchenId}/dishes/${dishId}/image/${writeId}.webp`
}
