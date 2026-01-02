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
import type { Kitchen } from '../../../../../models/objects/kitchen.model'
import { useKitchenInterface } from '../../../../../composables/fireux/firestore/objects/kitchen/utils/view/useKitchenInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  kitchen?: Kitchen | null
}>()

const { pillProps } = useKitchenInterface()

const resolved = computed(() => pillProps(props.kitchen ?? null))

const vmTitle = computed(() => props.title ?? resolved.value.title)
const vmSubtitle = computed(() => props.subtitle ?? resolved.value.subtitle ?? undefined)
const vmAvatar = computed(() => props.avatar ?? null)
</script>
