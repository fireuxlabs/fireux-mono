<template>
  <section class="space-y-4">
    <div class="space-y-1">
      <h2 class="text-base font-semibold text-highlighted">{{ title }}</h2>
      <p class="text-sm text-dimmed">{{ description }}</p>
    </div>

    <UPageCard
      v-if="pending"
      title="Loading Blank targets"
      description="Checking the app-scoped Blank console targets."
      variant="subtle"
    />

    <UPageCard
      v-else-if="!cards.length"
      title="No Blank targets"
      description="Create the first Blank target to test the console lifecycle."
      variant="subtle"
    />

    <div v-else class="grid gap-3 md:grid-cols-2">
      <ConsoleEntityIndexCard
        v-for="card in cards"
        :key="card.id"
        :card="card"
        :action="action"
        :show-badges="showBadges"
        @action="emit('select', card.id)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleEntityIndexCard } from 'fireux-core/runtime/components/Console/types'
import type { Blank } from '../../../models/blank.model'

const props = withDefaults(
  defineProps<{
    collection?: Blank[]
    pending?: boolean
    title?: string
    description?: string
    action?: boolean
    showBadges?: boolean
  }>(),
  {
    collection: () => [],
    pending: false,
    title: 'Choose Blank',
    description: 'Select the Blank target you want to work on.',
    action: false,
    showBadges: false,
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()

const text = (value: unknown) => String(value ?? '').trim()

const cards = computed<ConsoleEntityIndexCard[]>(() => {
  const mapped: ConsoleEntityIndexCard[] = []

  for (const target of props.collection) {
    const id = text(target.id)
    if (!id) continue

    mapped.push({
      id,
      title: text(target.name) || id,
      subtitle: target.status,
      meta: id,
      badges: [target.status],
    })
  }

  return mapped
})
</script>
