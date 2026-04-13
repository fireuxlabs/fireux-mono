<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p v-if="description">{{ description }}</p>
        </div>

        <div class="collection-manager__controls flex flex-1 items-center gap-2">
          <div class="ml-auto flex items-center gap-2">
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
              :icon="variant === 'pill' ? 'i-lucide-list' : 'i-lucide-layout-grid'"
              :aria-label="variant === 'pill' ? 'Switch to list view' : 'Switch to grid view'"
              @click="toggleVariant"
            />

            <UBadge v-if="showCount" variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
          </div>
        </div>
      </div>
    </template>

    <ProjectCollectionList
      v-if="cardsFiltered.length"
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

    <div v-if="isDev">
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
import { useCollectionSearch } from '../../../../composables/shared/useCollectionSearch'
import {
  useProjectInterface,
  type ProjectInterfaceCard,
  type ProjectSurface,
} from '../../../../composables/fireux/firestore/system/project/utils/view/useProjectInterface'

const props = withDefaults(defineProps<{
  collection?: ProjectSurface[]
  title?: string
  description?: string
  link?: boolean
  action?: boolean
  showSubtitle?: boolean
  showBadges?: boolean
  searchPlaceholder?: string
  showSearch?: boolean
  showVariantToggle?: boolean
  showCount?: boolean
  initialVariant?: 'pill' | 'cell'
  devJsonTitle?: string
  devJsonContext?: string
}>(), {
  collection: () => [],
  title: 'Projects',
  description: 'Browse project records available in this workspace.',
  link: false,
  action: false,
  showSubtitle: true,
  showBadges: true,
  searchPlaceholder: 'Search projects…',
  showSearch: true,
  showVariantToggle: true,
  showCount: true,
  initialVariant: 'pill',
  devJsonTitle: 'Projects (JSON)',
  devJsonContext: 'collection manager · projects · raw collection',
})

const emit = defineEmits<{
  (event: 'select', projectId: string): void
}>()

const rawCollection = computed(() => props.collection ?? [])
const { devJsonData } = useDevCollectionJson(rawCollection)
const title = computed(() => String(props.title || 'Projects'))
const description = computed(() => String(props.description || '').trim())
const linkEnabled = computed(() => props.link !== false)
const actionEnabled = computed(() => props.action === true)
const showSubtitle = computed(() => props.showSubtitle !== false)
const showBadges = computed(() => props.showBadges !== false)
const searchPlaceholder = computed(() => String(props.searchPlaceholder || 'Search projects…'))
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const devJsonTitle = computed(() => String(props.devJsonTitle || 'Projects (JSON)').trim())
const devJsonContext = computed(
  () => String(props.devJsonContext || 'collection manager · projects · raw collection').trim()
)
const { pill: makeCard } = useProjectInterface()

const collection = computed<ProjectSurface[]>(() =>
  rawCollection.value.filter((row): row is ProjectSurface => Boolean(makeCard(row)))
)

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<ProjectSurface, ProjectInterfaceCard>({
  items: collection,
  makeCard: (row) => makeCard(row),
  initialVariant: props.initialVariant,
})

const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(() => showSearch.value && totalCount.value > 15)
const isDev = import.meta.dev
</script>
