<template>
  <UCard>
    <div class="flex items-center gap-3">
      <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="sm" />
      <div class="min-w-0 flex-1">
        <div class="truncate font-medium">{{ vmTitle }}</div>
        <div v-if="vmSubtitle" class="truncate text-sm text-dimmed">
          {{ vmSubtitle }}
        </div>
        <div v-if="prop" class="truncate text-sm text-dimmed">{{ prop }}</div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Kitchen } from '../../../../../models/objects/kitchen.model'
import { useKitchenInterface } from '../../../../../composables/fireux/firestore/objects/kitchen/utils/view/useKitchenInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  kitchen?: Kitchen | null
  prop?: string
}>()
const { cellProps } = useKitchenInterface()

const resolved = computed(() => cellProps(props.kitchen ?? null))

const vmTitle = computed(() => props.title ?? resolved.value.title)
const vmSubtitle = computed(
  () => props.subtitle ?? resolved.value.formatted_address ?? resolved.value.subtitle ?? undefined
)
const vmAvatar = computed(() => props.avatar ?? null)
</script>
