<template>
  <UCard>
    <div class="flex items-center gap-3">
      <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="sm" />
      <div class="min-w-0 flex-1">
        <div class="truncate font-medium">{{ vmTitle }}</div>
        <div v-if="vmSubtitle" class="truncate text-sm text-dimmed">{{ vmSubtitle }}</div>
        <div v-if="prop" class="truncate text-sm text-dimmed">{{ prop }}</div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FirebaseProduct } from '../../../../../models/objects/product.model'
import { useProductInterface } from '../../../../../composables/fireux/firestore/objects/product/utils/view/useProductInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  product?: FirebaseProduct | null
  prop?: string
}>()
const { mapToCardProps } = useProductInterface()

const card = computed(() =>
  mapToCardProps({
    id: props.product?.id,
    title: props.product?.name,
    description: props.product?.description,
    priceLabel: (props.product as any)?.priceLabel,
  })
)

const vmTitle = computed(() => props.title ?? card.value.title)
const vmSubtitle = computed(
  () => props.subtitle ?? card.value.priceLabel ?? card.value.description
)
const vmAvatar = computed(() => props.avatar ?? null)
</script>
