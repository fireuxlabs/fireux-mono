<template>
  <div
    class="inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--ui-bg-muted)] px-3 py-1.5"
  >
    <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="xs" />
    <div class="min-w-0 flex-1">
      <div class="flex min-w-0 items-baseline gap-2">
        <div class="min-w-0 truncate text-sm font-medium">{{ vmTitle }}</div>
        <div v-if="vmSubtitle" class="min-w-0 truncate text-xs text-dimmed">{{ vmSubtitle }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Company } from '../../../../../models/objects/company.model'
import { useCompanyInterface } from '../../../../../composables/fireux/firestore/objects/company/utils/view/useCompanyInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  company?: Company | null
}>()

const { pillProps } = useCompanyInterface()

const resolved = computed(() => pillProps(props.company ?? null))

const vmTitle = computed(() => props.title ?? resolved.value.title)
const vmSubtitle = computed(() => props.subtitle ?? resolved.value.subtitle ?? undefined)
const vmAvatar = computed(() => props.avatar ?? null)
</script>
