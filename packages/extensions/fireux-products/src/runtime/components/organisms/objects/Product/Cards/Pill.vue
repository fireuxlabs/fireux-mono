<template>
  <div
    class="fx-pill"
  >
    <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="xs" />
    <div class="min-w-0 flex-1">
      <div class="min-w-0 truncate text-sm font-medium">{{ vmTitle }}</div>
      <div v-if="vmSubtitle" class="min-w-0 truncate text-xs text-dimmed">{{ vmSubtitle }}</div>
    </div>
  </div>
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
