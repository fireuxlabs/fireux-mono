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

        <span v-if="showCount && isSettled" class="entity-collection__count">
          {{ countLabel }}
        </span>
      </template>
    </CollectionHeader>

    <CollectionState
      v-if="outcome === 'pending'"
      title="Loading Apps"
      description="Finding Apps…"
      icon="i-lucide-loader-circle"
      loading
      role="status"
      aria-live="polite"
      aria-busy="true"
    />

    <CollectionState
      v-else-if="outcome === 'error'"
      title="Apps unavailable"
      description="Apps could not be loaded. Please try again."
      icon="i-lucide-triangle-alert"
      role="alert"
      aria-live="assertive"
    >
      <template #actions>
        <UButton
          label="Try again"
          color="neutral"
          variant="soft"
          icon="i-lucide-refresh-cw"
          @click="refresh"
        />
      </template>
    </CollectionState>

    <AppCollectionLauncher
      v-else-if="cardsFiltered.length"
      :apps="cardsFiltered"
    />

    <CollectionState
      v-else
      icon="i-lucide-app-window"
      :title="query ? 'No apps match your search' : 'No apps yet'"
      :description="
        query
          ? 'Try a different search term.'
          : 'Once app records are added, they will display here.'
      "
    />

    <div>
      <DevDebugPanel
        object-origin="fetched"
        launcher
        include-route
        :title="'Apps (JSON)'"
        :context="devJsonContext"
        :objects="devJsonData"
        :derived="{}"
        :default-open="false"
        @opened="loadDevJson"
        @closed="unloadDevJson"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import { useDevCollectionJson } from '../../../composables/dev/useDevCollectionJson'
import { computed } from 'vue'
import { useAppInterface } from '../../composables/useAppInterface'
import type { App } from '../../models/app.model'
import { useCollectionSearch } from '../../../composables/shared/useCollectionSearch'
import type { AppCollectionController } from '../../composables/useApps'

const props = withDefaults(
  defineProps<{
    controller: AppCollectionController
    title?: string
    description?: string
    searchPlaceholder?: string
    showSearch?: boolean
    showCount?: boolean
  }>(),
  {
    title: 'Apps',
    description: 'Browse canonical app records for the current ecosystem.',
    searchPlaceholder: 'Search apps…',
    showSearch: true,
    showCount: true,
  }
)

const collection = computed<App[]>(() => props.controller.apps.value)
const outcome = computed(() => props.controller.outcome.value)
const refresh = () => props.controller.refresh?.()
const isSettled = computed(
  () => outcome.value === 'ready' || outcome.value === 'empty'
)
const { devJsonData, loadDevJson, unloadDevJson } =
  useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Apps'))
const description = computed(() =>
  String(
    props.description ||
      'Browse canonical app records for the current ecosystem.'
  )
)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search apps…')
)
const showSearch = computed(() => props.showSearch !== false)
const showCount = computed(() => props.showCount !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const { interface: makeCard } = useAppInterface()
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
const devJsonContext = 'App collection · source: server · canonical entity: App'
</script>
