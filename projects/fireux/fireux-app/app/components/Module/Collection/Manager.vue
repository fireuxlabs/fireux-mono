<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2>Modules</h2>
          <p>Browse published FireUX module records.</p>
        </div>

        <UBadge variant="soft">{{ moduleCards.length }}</UBadge>
      </div>
    </template>

    <div v-if="moduleCards.length" class="space-y-3">
      <ProductCardsCell
        v-for="card in moduleCards"
        :key="card.id"
        v-bind="card"
        link
      />
    </div>

    <p v-else class="text-sm text-dimmed">No modules found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProductCollection } from 'fireux-products/runtime/composables/fireux/firestore/product/fetch/useProductCollection'
import {
  useProductInterface,
  type ProductCard,
} from 'fireux-products/runtime/composables/fireux/firestore/product/utils/view/useProductInterface'

const { products } = useProductCollection()
const { cell: productCell } = useProductInterface()

const text = (value: unknown) => String(value ?? '').trim()

const modules = computed(() =>
  (products.value ?? [])
    .filter((product) => product.product_type === 'module')
    .filter((product) => product.active !== false)
    .filter((product) => text(product.id))
    .sort((a, b) => text(a.name).localeCompare(text(b.name)))
)
const moduleCards = computed<ProductCard.Card[]>(() =>
  modules.value
    .map((product) => productCell(product))
    .filter((card): card is ProductCard.Card => Boolean(card))
)
</script>
