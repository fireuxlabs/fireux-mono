<template>
  <section class="entity-collection agent-collection">
    <FireCollectionHeader :title="title" :description="description">
      <template #controls>
        <UInput
          v-if="showSearchInput"
          v-model="query"
          :placeholder="searchPlaceholder"
          :aria-label="searchPlaceholder"
          icon="i-lucide-search"
          class="entity-collection__search"
        />

        <UButton
          v-if="showVariantToggle"
          size="sm"
          color="neutral"
          variant="ghost"
          :icon="variant === 'pill' ? 'i-lucide-layout-grid' : 'i-lucide-list'"
          :aria-label="
            variant === 'pill'
              ? 'Switch to card view'
              : 'Switch to compact view'
          "
          @click="toggleVariant"
        />

        <span v-if="showCount && isSettled" class="entity-collection__count">
          {{ countLabel }}
        </span>
      </template>
    </FireCollectionHeader>

    <FireStateCard
      surface="collection"
      v-if="outcome === 'pending'"
      title="Loading hiring profiles"
      description="Finding hiring profiles…"
      icon="i-lucide-loader-circle"
      loading
      aria-atomic="true"
    />

    <FireStateCard
      surface="collection"
      v-else-if="outcome === 'error'"
      title="Hiring profiles unavailable"
      description="Hiring profiles could not be loaded. Please try again."
      icon="i-lucide-triangle-alert"
      state="error"
      aria-atomic="true"
    />

    <AgentCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <AgentCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <AgentCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </AgentCollectionList>

    <FireStateCard
      surface="collection"
      v-else
      icon="i-lucide-handshake"
      :title="query ? 'No matching hiring profiles' : 'No hiring profiles yet'"
      :description="
        query
          ? 'Try a different search term.'
          : 'Hiring profiles will appear here once they are available.'
      "
    />

    <div>
      <FireDiagnosticsDebugPanel
        object-origin="fetched"
        launcher
        include-route
        :title="'Agents (JSON)'"
        context="collection manager · agents"
        :objects="{ profiles: devJsonData, users: profileUsers }"
        :derived="{}"
        :default-open="false"
        @opened="loadDevJson"
        @closed="unloadDevJson"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDiagnosticsCollectionJson } from 'fireux-core/runtime/composables/diagnostics/useDiagnosticsCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: render root Agent rows with canonical User joins.
// Concurrent edit — 2026-07-20 20:14 CEST — Repo Efficiency Pass 2 of 6: consume the exact Agent directory projection without storage-model casts.
import { useCollectionVariantCards } from 'fireux-core/runtime/composables/shared/useCollectionVariantCards'
import { computed } from 'vue'
import { useAgentFetch } from '../../../composables/profiles/Agent/fetch/useAgentFetch'
import { useAgentInterface } from '../../../composables/profiles/Agent/utils/view/useAgentInterface'
import type { AgentDirectoryProfile } from '../../../utils/profiles/Agent/agent'

type AgentEntry = AgentDirectoryProfile

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    link?: boolean
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
  }>(),
  {
    title: 'Hiring profiles',
    description:
      'Choose a hiring profile to explore its focus and connections.',
    link: true,
    searchPlaceholder: 'Search hiring profiles…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'cell',
  }
)

const fetched = useAgentFetch()
const { outcome, profileUsers } = fetched
const collection = fetched.coreAgents
const { devJsonData, loadDevJson, unloadDevJson } =
  useDiagnosticsCollectionJson(collection)
const title = computed(() => String(props.title || 'Hiring profiles'))
const description = computed(() =>
  String(
    props.description ||
      'Choose a hiring profile to explore its focus and connections.'
  )
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search hiring profiles…')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const isSettled = computed(
  () => outcome.value === 'ready' || outcome.value === 'empty'
)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useAgentInterface()
const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<AgentEntry, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (entry) => makeCard(entry, fetched.userById(entry.id)),
    initialVariant: props.initialVariant,
  })

const { cards: cardsFiltered } = useCollectionVariantCards({
  items: visibleItems,
  variant,
  makeCard: (entry) => makeCard(entry, fetched.userById(entry.id)),
  makePill: (entry) => makePill(entry, fetched.userById(entry.id)),
  makeCell: (entry) => makeCell(entry, fetched.userById(entry.id)),
})

const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} of ${totalCount.value} hiring profiles`
    : `${totalCount.value} hiring profile${totalCount.value === 1 ? '' : 's'}`
)
</script>
