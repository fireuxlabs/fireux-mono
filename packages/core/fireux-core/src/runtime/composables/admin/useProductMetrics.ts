
export async function useProductMetrics() {
  // TODO: implement real metrics aggregation from Firestore
  // Temporary stub to satisfy TS contracts used by Admin metrics UI
  return {
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
  }
}
