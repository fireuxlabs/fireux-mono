<template>
  <section aria-label="Mise tasks" class="space-y-6">
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
    >
      <div class="space-y-1">
        <h2 class="text-base font-semibold text-highlighted">Mise en place</h2>
        <p class="text-sm text-dimmed">{{ collectionDescription }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <UBadge color="neutral" variant="soft">
          {{ tasks.length }} tasks
        </UBadge>
        <UBadge color="neutral" variant="outline">
          {{ activeTaskCount }} active
        </UBadge>
      </div>
    </div>

    <p v-if="pending" class="text-sm text-dimmed">
      Loading mise tasks...
    </p>

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Mise tasks unavailable"
      description="The prep work for this Kitchen could not be loaded. Please try again."
    />

    <KitchenMiseTaskBoard
      v-else-if="tasks.length"
      :tasks="tasks"
      :heading-id="headingId"
      :link-base="linkBase"
    />

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="No mise tasks"
      description="No prep work is available for the selected Kitchen."
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  cleanKitchenMiseText,
  type KitchenMiseTaskSummary,
} from '../../../models/kitchen/mise-presentation'

const props = withDefaults(
  defineProps<{
    error?: boolean
    headingId?: string
    kitchenName?: string
    linkBase?: string
    pending?: boolean
    tasks: KitchenMiseTaskSummary[]
  }>(),
  {
    error: false,
    headingId: 'kitchen-mise-status',
    kitchenName: '',
    linkBase: '',
    pending: false,
  }
)

const activeTaskCount = computed(
  () => props.tasks.filter(task => task.status !== 'done').length
)
const collectionDescription = computed(() => {
  const kitchenName = cleanKitchenMiseText(props.kitchenName)
  return kitchenName
    ? `Prep work for ${kitchenName}, organised in the order a chef works.`
    : 'Prep work for the selected Kitchen, organised by workflow.'
})
</script>
