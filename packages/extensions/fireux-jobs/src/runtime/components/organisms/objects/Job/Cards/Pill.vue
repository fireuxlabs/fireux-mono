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
import type { Job } from '../../../../../models/job.model'
import { useJobInterface } from '../../../../../composables/fireux/firestore/jobs/utils/view/useJobInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  job?: Job | null
}>()

const { mapToCardProps } = useJobInterface()

const resolved = computed(() =>
  mapToCardProps({ id: props.job?.id, title: props.job?.title, status: props.job?.status })
)

const vmTitle = computed(() => props.title ?? resolved.value.title)
const vmSubtitle = computed(() => props.subtitle ?? resolved.value.status)
const vmAvatar = computed(() => props.avatar ?? null)
</script>
