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
import { dummyProductSurfaceList } from '../../../../../../../../dummy/product.dummy'

const productSurfaces = dummyProductSurfaceList

const selectedIndex = ref(0)
const current = computed(
  () => productSurfaces[selectedIndex.value] ?? productSurfaces[0] ?? null
)
const currentProduct = computed(() => current.value?.product ?? null)
const currentCard = computed(() => current.value?.card ?? null)

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
  if (!product) return ''
  const price = formatMoney(
    product.default_price?.unit_amount ?? 0,
    product.default_price?.interval
  )
  const type = String(product.product_type ?? '').trim()
  return [type, price].filter(Boolean).join(' · ')
})

const pillItems = computed(() =>
  productSurfaces
    .map((surface, index) => {
      const product = surface.product
      const card = surface.card
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
  const product = currentProduct.value
  if (!card || !product) return null

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
  const product = currentProduct.value
  if (!card || !product) return null

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
