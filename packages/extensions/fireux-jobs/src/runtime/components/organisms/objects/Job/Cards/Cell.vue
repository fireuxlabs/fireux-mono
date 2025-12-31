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
import type { Job } from '../../../../../models/job.model'
import { useJobInterface } from '../../../../../composables/fireux/firestore/jobs/utils/view/useJobInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  job?: Job | null
  prop?: string
}>()
const { mapToCardProps } = useJobInterface()

const card = computed(() =>
  mapToCardProps({
    id: props.job?.id,
    title: props.job?.title,
    status: props.job?.status,
  })
)

const vmTitle = computed(() => props.title ?? card.value.title)
const vmSubtitle = computed(() => props.subtitle ?? card.value.status)
const vmAvatar = computed(() => props.avatar ?? null)
</script>
