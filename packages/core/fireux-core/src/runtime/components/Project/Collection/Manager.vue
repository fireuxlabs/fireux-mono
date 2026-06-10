<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p v-if="description">{{ description }}</p>
        </div>

        <div
          class="collection-manager__controls flex flex-1 items-center gap-2"
        >
          <div class="ml-auto flex flex-wrap items-center gap-2">
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

            <UInput
              v-if="showSearchInput"
              v-model="query"
              size="xs"
              :placeholder="searchPlaceholder"
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

            <UBadge v-if="showCount" variant="soft">
              {{ countLabel }}
            </UBadge>
          </div>
        </div>
      </div>
    </template>

    <p v-if="pending">Loading projects...</p>

    <ProjectCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <ProjectCardsPill
          v-bind="card"
          :link="linkEnabled"
          :action="actionEnabled"
          :show-subtitle="showSubtitle"
          :show-badges="showBadges"
          @action="emit('select', card.id)"
        />
      </template>
      <template #cell="{ card }">
        <ProjectCardsCell
          v-bind="card"
          :link="linkEnabled"
          :action="actionEnabled"
          :show-subtitle="showSubtitle"
          :show-badges="showBadges"
          @action="emit('select', card.id)"
        />
      </template>
    </ProjectCollectionList>

    <p v-else>
      {{ query ? 'No projects match your search.' : 'No projects found.' }}
    </p>

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

type ProjectFilterMode = 'all' | 'mine' | 'console'
type ProjectFilterOption = {
  value: ProjectFilterMode
  label: string
}

const props = withDefaults(
  defineProps<{
    collection?: ProjectSurface[]
    consoleIds?: string[]
    filterMode?: ProjectFilterMode
    filterOptions?: ProjectFilterOption[]
    title?: string
    description?: string
    link?: boolean
    action?: boolean
    showFilterToggle?: boolean
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
    filterMode: 'all',
    filterOptions: () => [
      { value: 'all', label: 'All' },
      { value: 'mine', label: 'Mine' },
    ],
    title: 'Projects',
    link: true,
    action: false,
    showFilterToggle: false,
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
const emit = defineEmits<{
  (event: 'select', projectId: string): void
  (event: 'update:filterMode', value: ProjectFilterMode): void
}>()

const fetched = useProjectCollection()
const rawCollection = computed(() =>
  Array.isArray(props.collection) ? props.collection : fetched.projects.value
)
const pending = computed(() =>
  Array.isArray(props.collection) ? false : fetched.pending.value
)
const { devJsonData } = useDevCollectionJson(rawCollection)
const title = computed(() => String(props.title || 'Projects'))
const description = computed(() =>
  String(props.description || 'Browse project records available in this workspace.').trim()
)
const filterMode = computed<ProjectFilterMode>(() =>
  props.filterMode === 'mine' || props.filterMode === 'console'
    ? props.filterMode
    : 'all'
)
const filterOptions = computed<ProjectFilterOption[]>(() =>
  Array.isArray(props.filterOptions) && props.filterOptions.length
    ? props.filterOptions
    : [
        { value: 'all', label: 'All' },
        { value: 'mine', label: 'Mine' },
      ]
)
const linkEnabled = computed(() => props.link !== false)
const actionEnabled = computed(() => props.action === true)
const showFilterToggle = computed(() => props.showFilterToggle === true)
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

const consoleIdSet = computed(
  () =>
    new Set(
      (props.consoleIds ?? [])
        .map((id) => String(id ?? '').trim())
        .filter(Boolean)
    )
)
const collection = computed<ProjectSurface[]>(() =>
  rawCollection.value
    .filter((row): row is ProjectSurface => Boolean(makeCard(row)))
    .filter((row) => {
      if (filterMode.value !== 'console') return true
      return consoleIdSet.value.has(String(row.id ?? '').trim())
    })
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

function setFilterMode(value: ProjectFilterMode) {
  emit('update:filterMode', value)
}
</script>
