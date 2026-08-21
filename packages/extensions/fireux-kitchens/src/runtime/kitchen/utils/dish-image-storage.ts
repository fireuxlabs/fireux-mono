// Concurrent edit — 2026-07-22 01:48 CEST — Dish image atomicity: give every upload an immutable App-scoped object path.
// Concurrent edit — 2026-07-22 01:58 CEST — Dish media ownership: keep storage under Dish image without current/version product vocabulary.
export function dishImageStoragePath(
  kitchenId: string,
  dishId: string,
  writeId: string
) {
  return `kitchens/${kitchenId}/dishes/${dishId}/image/${writeId}.webp`
}
