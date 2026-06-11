<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start gap-3">
        <div class="min-w-0 flex-1 space-y-1">
          <h2 class="text-base font-semibold text-highlighted">{{ title }}</h2>
          <p class="text-sm text-dimmed">{{ description }}</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UFieldGroup v-if="showFilterToggle" size="xs">
            <UButton
              v-for="option in filterOptions"
              :key="option.value"
              :variant="filterMode === option.value ? 'solid' : 'ghost'"
              color="neutral"
              @click="setFilterMode(option.value)"
            >
              {{ option.label }}
            </UButton>
          </UFieldGroup>

          <UBadge v-if="showCount" variant="soft">
            {{ cards.length }}
          </UBadge>
        </div>
      </div>
    </template>

    <p v-if="pending" class="text-sm text-dimmed">Loading Blank targets...</p>

    <p v-else-if="!cards.length" class="text-sm text-dimmed">
      No Blank targets found.
    </p>

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
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleEntityIndexCard } from 'fireux-core/runtime/components/Console/types'
import type { Blank } from '../../../models/blank.model'

type BlankFilterMode = 'all' | 'mine' | 'console'
type BlankFilterOption = {
  value: BlankFilterMode
  label: string
}

const props = withDefaults(
  defineProps<{
    collection?: Blank[]
    pending?: boolean
    filterMode?: BlankFilterMode
    filterOptions?: BlankFilterOption[]
    title?: string
    description?: string
    action?: boolean
    showFilterToggle?: boolean
    showCount?: boolean
    showBadges?: boolean
  }>(),
  {
    collection: () => [],
    pending: false,
    filterMode: 'all',
    filterOptions: () => [
      { value: 'all', label: 'All' },
      { value: 'mine', label: 'Mine' },
    ],
    title: 'Choose Blank',
    description: 'Select the Blank target you want to work on.',
    action: false,
    showFilterToggle: false,
    showCount: true,
    showBadges: false,
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
  (event: 'update:filterMode', value: BlankFilterMode): void
}>()

const text = (value: unknown) => String(value ?? '').trim()
const filterMode = computed<BlankFilterMode>(() =>
  props.filterMode === 'mine' || props.filterMode === 'console'
    ? props.filterMode
    : 'all'
)
const filterOptions = computed<BlankFilterOption[]>(() =>
  Array.isArray(props.filterOptions) && props.filterOptions.length
    ? props.filterOptions
    : [
        { value: 'all', label: 'All' },
        { value: 'mine', label: 'Mine' },
      ]
)
const showFilterToggle = computed(() => props.showFilterToggle === true)
const showCount = computed(() => props.showCount !== false)

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

function setFilterMode(value: BlankFilterMode) {
  emit('update:filterMode', value)
}
</script>
