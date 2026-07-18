<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
        </div>

        <div
          class="collection-manager__controls flex flex-1 items-center gap-2"
        >
          <div class="ml-auto flex items-center gap-2">
            <UInput
              v-if="showSearchInput"
              v-model="query"
              size="xs"
              :placeholder="searchPlaceholder"
              :aria-label="searchPlaceholder"
            />

            <UButton
              v-if="showVariantToggle"
              size="xs"
              variant="ghost"
              :icon="
                variant === 'pill' ? 'i-lucide-list' : 'i-lucide-layout-grid'
              "
              :aria-label="
                variant === 'pill'
                  ? 'Switch to list view'
                  : 'Switch to grid view'
              "
              @click="toggleVariant"
            />

            <UBadge v-if="showSettledCount" variant="soft"
              >{{ countLabel }}</UBadge
            >
          </div>
        </div>
      </div>
    </template>

    <MoleculesStateCard
      v-if="outcome === 'pending'"
      entity="agents"
      state="loading"
      surface="bare"
    />

    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="agents"
      state="error"
      surface="bare"
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

    <MoleculesStateCard
      v-else
      state="empty"
      surface="bare"
      :title="query ? 'No agents match your search.' : 'No agents found.'"
      :description="
        query
          ? 'Try a different search term.'
          : 'Agent profiles will appear here once they are available.'
      "
    />

    <div>
      <DevJson
        :title="'Agents (JSON)'"
        context="collection manager · agents"
        :data="devJsonData"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed } from 'vue'
import { useAgentFetch } from '../../../composables/fireux/firestore/profiles/Agent/fetch/useAgentFetch'
import { useAgentInterface } from '../../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface'
import type { Agent } from '../../../models/profiles/Agent/Agent.model'

type AgentEntry = Partial<Agent> & { id: string, user?: unknown }

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
    title: 'Agents',
    description: 'Browse agents available to this runtime.',
    link: true,
    searchPlaceholder: 'Search agents…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const fetched = useAgentFetch()
const { outcome } = fetched
const collection = computed<AgentEntry[]>(() =>
  [
    ...(fetched.appAgents.value ?? []),
    ...(fetched.coreAgents.value ?? []),
  ] as AgentEntry[]
)
const { devJsonData } = useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Agents'))
const description = computed(() =>
  String(props.description || 'Browse agents available to this runtime.')
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search agents…')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const showSettledCount = computed(
  () =>
    showCount.value &&
    (outcome.value === 'ready' || outcome.value === 'empty')
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
    makeCard: (entry) => makeCard(entry as any),
    initialVariant: props.initialVariant,
  })

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((entry) => {
      if (variant.value === 'cell') {
        const base = makeCard(entry as any)
        const cell = makeCell(entry as any)
        if (!base || !cell) return null
        return { ...base, ...cell }
      }

      return makePill(entry as any)
    })
    .filter((card): card is NonNullable<ReturnType<typeof makeCard>> =>
      Boolean(card)
    )
)

const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)
</script>
