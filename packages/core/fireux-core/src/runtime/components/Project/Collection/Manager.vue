<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p v-if="description">{{ description }}</p>
        </div>

        <div
          class="collection-manager__controls"
        >
          <div class="ml-auto flex flex-wrap items-center gap-2">
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

            <UBadge v-if="showCount && isSettled" variant="soft">
              {{ countLabel }}
            </UBadge>
          </div>
        </div>
      </div>
    </template>

    <MoleculesStateCard
      v-if="outcome === 'pending'"
      entity="projects"
      state="loading"
      surface="bare"
    />

    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="projects"
      state="error"
      surface="bare"
      description="Projects could not be loaded. Please try again."
    />

    <ProjectCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <ProjectCardsPill
          v-bind="card"
          :link="linkEnabled"
          :show-subtitle="showSubtitle"
          :show-badges="showBadges"
        />
      </template>
      <template #cell="{ card }">
        <ProjectCardsCell
          v-bind="card"
          :link="linkEnabled"
          :show-subtitle="showSubtitle"
          :show-badges="showBadges"
        />
      </template>
    </ProjectCollectionList>

    <MoleculesStateCard
      v-else
      entity="projects"
      state="empty"
      surface="bare"
      :title="query ? 'No matching projects' : 'No projects yet'"
      :description="query
        ? 'Try a different project name.'
        : 'Projects will appear here when they are available.'"
    />

    <div>
      <DevJson
        :title="devJsonTitle"
        :context="devJsonContext"
        :data="devJsonData"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { computed } from 'vue'
import { useCollectionSearch } from '../../../composables/shared/useCollectionSearch'
import { useProjectCollection } from '../../../composables/fireux/firestore/core/project/useProject'
import {
  useProjectInterface,
  type ProjectSurface,
} from '../../../composables/fireux/firestore/core/project/utils/view/useProjectInterface'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    link?: boolean
    showSubtitle?: boolean
    showBadges?: boolean
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
    devJsonTitle?: string
    devJsonContext?: string
  }>(),
  {
    title: 'Projects',
    link: true,
    showSubtitle: true,
    showBadges: true,
    searchPlaceholder: 'Search projects…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
    devJsonTitle: 'Projects (JSON)',
    devJsonContext: 'collection manager · projects · raw collection',
  }
)

const fetched = useProjectCollection()
const rawCollection = computed(() => fetched.projects.value)
const outcome = computed(() => fetched.outcome.value)
const isSettled = computed(() =>
  outcome.value === 'ready' || outcome.value === 'empty'
)
const { devJsonData } = useDevCollectionJson(rawCollection)
const title = computed(() => String(props.title || 'Projects'))
const description = computed(() =>
  String(props.description || 'Browse project records available in this workspace.').trim()
)
const linkEnabled = computed(() => props.link !== false)
const showSubtitle = computed(() => props.showSubtitle !== false)
const showBadges = computed(() => props.showBadges !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search projects…')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const devJsonTitle = computed(() =>
  String(props.devJsonTitle || 'Projects (JSON)').trim()
)
const devJsonContext = computed(() =>
  String(
    props.devJsonContext || 'collection manager · projects · raw collection'
  ).trim()
)
const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useProjectInterface()

const collection = computed<ProjectSurface[]>(() =>
  rawCollection.value
    .filter((row): row is ProjectSurface => Boolean(makeCard(row)))
)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<ProjectSurface, NonNullable<ReturnType<typeof makeCard>>>(
    {
      items: collection,
      makeCard: (row) => makeCard(row),
      initialVariant: props.initialVariant,
    }
  )

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((row) => {
      if (variant.value === 'cell') {
        const base = makeCard(row)
        const cell = makeCell(row)
        if (!base || !cell) return null
        return { ...base, ...cell }
      }

      return makePill(row)
    })
    .filter((card): card is NonNullable<ReturnType<typeof makeCard>> =>
      Boolean(card)
    )
)

const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)

</script>
