import { computed } from 'vue'
import { useProducts } from '../firestore/objects/Product/useProducts'

export async function useProductMetrics() {
  const { productsCollection } = await useProducts()

  return {
    totalProducts: computed(() => productsCollection.value?.length ?? 0),
    activeProducts: computed(
      () => productsCollection.value?.filter((p: any) => p.active).length ?? 0
    ),
    outOfStockProducts: computed(
      () =>
        productsCollection.value?.filter((p: any) => p.stock === 0).length ?? 0
    ),
  }
}
