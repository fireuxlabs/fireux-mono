<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Demo surfaces for products
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Demo surfaces for products.
        </p>
      </div>
    </template>

    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <ProductCardsPill
          v-for="item in pillItems"
          :key="item.key"
          v-bind="item.pill"
          action
          @action="selectedId = item.id"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Pill</div>
        <ProductCardsPill v-if="currentPill" v-bind="currentPill" />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Cell</div>
        <ProductCardsCell
          v-if="currentCell"
          :card="currentCell.card"
          :prop="currentCell.prop"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Preview</div>
        <ProductCardsPreview
          v-if="currentPreview"
          :card="currentPreview.card"
          :prop="currentPreview.prop"
          :product="currentPreview.product"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Profile</div>
        <ProductCardsProfile
          v-if="currentCard"
          :card="currentCard"
          :prop="currentProp"
          :product="currentProduct"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineOptions({ name: 'DevProductDemo' })

import { computed } from 'vue';
import { demoProductSurfaceList } from '../../../../../../../../demo/product.demo';

const productSurfaces = demoProductSurfaceList

const props = defineProps<{
  selectedId?: string
}>()

const emit = defineEmits<{
  (event: 'update:selectedId', value: string): void
}>()

const fallbackId = productSurfaces[0]?.product?.id ?? ''
const selectedId = computed({
  get: () => props.selectedId || fallbackId,
  set: (value: string) => emit('update:selectedId', value),
})

const current = computed(() => {
  const currentId = selectedId.value
  if (!currentId) return productSurfaces[0] ?? null
  return (
    productSurfaces.find((surface) => surface.product.id === currentId) ??
    productSurfaces[0] ??
    null
  )
})
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

      return {
        key: product.id || String(index),
        id: product.id,
        pill: {
          to: card.to,
          avatarUrl: card.avatarUrl,
          title: card.title,
          subtitle: card.subtitle,
          badges: card.badges,
        },
      }
    })
    .filter(
      (item): item is {
        key: string
        id: string
        pill: { to: string; avatarUrl: string; title: string; subtitle: string; badges: string[] }
      } => Boolean(item)
    )
)

const currentPill = computed(() => {
  const id = selectedId.value
  return pillItems.value.find((item) => item.id === id)?.pill ?? pillItems.value[0]?.pill ?? null
})

const currentCell = computed(() => {
  const card = currentCard.value
  const product = currentProduct.value
  if (!card || !product) return null

  return {
    card,
    prop: product.active ? 'Active' : 'Inactive',
  }
})

const currentPreview = computed(() => {
  const card = currentCard.value
  const product = currentProduct.value
  if (!card || !product) return null

  return {
    card,
    prop: currentProp.value,
    product,
  }
})
</script>
