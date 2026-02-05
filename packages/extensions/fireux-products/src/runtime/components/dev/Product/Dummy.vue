<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Product card surfaces
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Pill, preview, cell, and profile variants with a real-looking payload.
        </p>
      </div>
    </template>

    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <ProductCardsPill
          v-for="(item, index) in pillItems"
          :key="item.key"
          v-bind="item.pill"
          action
          @action="selectedIndex = index"
        />
      </div>

      <ProductCardsPreview
        v-if="currentPreview"
        :image-url="currentPreview.imageUrl"
        :name="currentPreview.name"
        :subtitle="currentPreview.subtitle"
        :badges="currentPreview.badges"
        :prop="currentPreview.prop"
      />

      <ProductCardsCell
        v-if="currentCell"
        v-bind="currentCell"
      />

      <ProductCardsProfile
        v-if="currentCard"
        :card="currentCard"
        :prop="currentProp"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineOptions({ name: 'DevProductDummy' })

import { computed, ref } from 'vue'
import {
  FirebaseProduct as ProductModelRuntime,
  type FirebaseProduct,
} from '../../../models/objects/product.model'
import { useProductInterface } from '../../../composables/fireux/firestore/objects/product/utils/view/useProductInterface'

const buildProduct = (product: Partial<FirebaseProduct>): FirebaseProduct => ({
  ...ProductModelRuntime,
  ...product,
})

const dummyProducts: FirebaseProduct[] = [
  buildProduct({
    id: 'cleanbox-basic',
    slug: 'cleanbox-basic',
    name: 'Cleanbox Basic',
    description: 'Landing + contact funnel for a single business.',
    product_type: 'service',
    default_price: { id: '', unit_amount: 4900, interval: 'month' },
  }),
  buildProduct({
    id: 'cleanbox-pro',
    slug: 'cleanbox-pro',
    name: 'Cleanbox Pro',
    description: 'Branded tenant app + small ongoing improvements.',
    product_type: 'subscription',
    default_price: { id: '', unit_amount: 9900, interval: 'month' },
  }),
  buildProduct({
    id: 'misebox-lead',
    slug: 'misebox-lead',
    name: 'Misebox Lead',
    description: 'Visibility + jobs surface for kitchens and venues.',
    product_type: 'subscription',
    default_price: { id: '', unit_amount: 14900, interval: 'month' },
  }),
]

const selectedIndex = ref(0)
const currentProduct = computed(
  () => dummyProducts[selectedIndex.value] ?? dummyProducts[0]
)

const { card: makeCard } = useProductInterface()

const currentCard = computed(() => makeCard(currentProduct.value))

const formatMoney = (unitAmount: number, interval?: string) => {
  const amount = Number(unitAmount ?? 0)
  if (!amount) return 'Free'
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'CHF',
  }).format(amount / 100)
  return interval ? `${formatted}/${interval}` : formatted
}

const currentProp = computed(() => {
  const product = currentProduct.value
  const price = formatMoney(
    product.default_price?.unit_amount ?? 0,
    product.default_price?.interval
  )
  const type = String(product.product_type ?? '').trim()
  return [type, price].filter(Boolean).join(' · ')
})

const pillItems = computed(() =>
  dummyProducts
    .map((product, index) => {
      const card = makeCard(product)
      if (!card) return null

      const price = formatMoney(
        product.default_price?.unit_amount ?? 0,
        product.default_price?.interval
      )

      return {
        key: product.id || String(index),
        pill: {
          to: card.to,
          avatarUrl: card.avatarUrl,
          title: card.title,
          subtitle: card.subtitle,
          badges: [price].filter(Boolean),
        },
      }
    })
    .filter(
      (item): item is { key: string; pill: Record<string, unknown> } =>
        Boolean(item)
    )
)

const currentCell = computed(() => {
  const card = currentCard.value
  if (!card) return null

  const product = currentProduct.value
  const price = formatMoney(
    product.default_price?.unit_amount ?? 0,
    product.default_price?.interval
  )
  const type = String(product.product_type ?? '').trim()

  return {
    to: card.to,
    name: card.name,
    description: card.description,
    imageUrl: card.imageUrl,
    badges: [type, price].filter(Boolean),
    prop: product.active ? 'Active' : 'Inactive',
  }
})

const currentPreview = computed(() => {
  const card = currentCard.value
  if (!card) return null

  const product = currentProduct.value
  const price = formatMoney(
    product.default_price?.unit_amount ?? 0,
    product.default_price?.interval
  )
  const type = String(product.product_type ?? '').trim()

  return {
    imageUrl: card.imageUrl,
    name: card.name,
    subtitle: card.description,
    badges: [type].filter(Boolean),
    prop: price,
  }
})
</script>
