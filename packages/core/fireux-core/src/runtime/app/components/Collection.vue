<template>
  <section class="entity-collection app-collection">
    <CollectionHeader :title="title" :description="description">
      <template #controls>
        <UInput
          v-if="showSearchInput"
          v-model="query"
          :placeholder="searchPlaceholder"
          :aria-label="searchPlaceholder"
          icon="i-lucide-search"
          class="entity-collection__search"
        />

        <span v-if="showCount" class="entity-collection__count">
          {{ countLabel }}
        </span>
      </template>
    </CollectionHeader>

    <div
      v-if="roleFilters.length > 2"
      class="app-collection__filters"
      aria-label="Filter Apps by type"
    >
      <UButton
        v-for="filter in roleFilters"
        :key="filter.value"
        :color="selectedRole === filter.value ? 'primary' : 'neutral'"
        :variant="selectedRole === filter.value ? 'soft' : 'ghost'"
        size="sm"
        @click="selectedRole = filter.value"
      >
        {{ filter.label }}
        <UBadge color="neutral" variant="subtle" size="xs">
          {{ filter.count }}
        </UBadge>
      </UButton>
    </div>

    <AppCollectionList v-if="cardsFiltered.length" :cards="cardsFiltered" />
  </section>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import { computed, ref } from 'vue'
import { useAppView } from '../composables/useAppView'
import type { App } from '../models/app.model'
import { useCollectionSearch } from '../../composables/shared/useCollectionSearch'

const props = defineProps<{
  apps: App[]
  scope: 'ecosystem' | 'platform'
}>()

type AppRoleFilter = 'all' | App['role']

const selectedRole = ref<AppRoleFilter>('all')
const roleFilters = computed(() => {
  const counts = new Map<App['role'], number>()
  for (const app of props.apps) {
    counts.set(app.role, (counts.get(app.role) ?? 0) + 1)
  }

  const labels: Record<App['role'], string> = {
    global: 'Platform',
    tenant: 'Ecosystem',
    standalone: 'Standalone',
  }

  return [
    { value: 'all' as const, label: 'All Apps', count: props.apps.length },
    ...([...counts.entries()] as [App['role'], number][]).map(
      ([value, count]) => ({ value, label: labels[value], count })
    ),
  ]
})
const collection = computed<App[]>(() =>
  selectedRole.value === 'all'
    ? props.apps
    : props.apps.filter((app) => app.role === selectedRole.value)
)
const title = computed(() =>
  props.scope === 'platform' ? 'Platform Apps' : 'Ecosystem Apps'
)
const description = computed(() =>
  props.scope === 'platform'
    ? 'All Apps from their canonical ecosystem collections.'
    : 'Browse Apps available through this Ecosystem.'
)
const searchPlaceholder = 'Search apps…'
const showCount = true
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(() => totalCount.value > 15)
const { interface: makeCard } = useAppView()
const { query, visibleItems, visibleCount } = useCollectionSearch<
  App,
  NonNullable<ReturnType<typeof makeCard>>
>({
  items: collection,
  makeCard: (app) => makeCard(app),
})

const cardsFiltered = computed(() =>
  visibleItems.value
    .map((app) => makeCard(app))
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
)

const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)
</script>

<style scoped>
.app-collection__filters {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
  margin-bottom: calc(var(--spacing) * 6);
  padding-bottom: calc(var(--spacing) * 4);
  border-bottom: 1px solid var(--ui-border);
}
</style>
