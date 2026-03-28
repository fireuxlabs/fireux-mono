<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
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

    <ProfilesProfessionalCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <ProfilesProfessionalCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <ProfilesProfessionalCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </ProfilesProfessionalCollectionList>

    <p v-else>{{ query ? 'No professionals match your search.' : 'No professionals found.' }}</p>

    <div v-if="isDev">
      <DevJson
        :title="'Professionals (JSON)'"
        context="collection manager · professionals"
        :data="devJsonData"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import { useProfessionalInterface } from '../../../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface';
import type { ProfessionalCore } from '../../../../../models/profiles/Professional/Professional.model';

type ProfessionalEntry = ProfessionalCore & { user?: unknown }

const props = withDefaults(
  defineProps<{
    collection?: ProfessionalEntry[]
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
    title: 'Professionals',
    description: 'Browse professionals available to this runtime.',
    link: true,
    searchPlaceholder: 'Search professionals…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const collection = computed(() => props.collection ?? [])
const { devJsonData } = useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Professionals'))
const description = computed(
  () => String(props.description || 'Browse professionals available to this runtime.')
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(
  () => String(props.searchPlaceholder || 'Search professionals…')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(() => showSearch.value && totalCount.value > 15)
const { interface: makeCard, searchText } = useProfessionalInterface()
const { query, variant, toggleVariant, cards: cardsFiltered, visibleCount } =
  useCollectionSearch<ProfessionalEntry, ReturnType<typeof makeCard>>({
    items: collection,
    searchText: (entry) => searchText(entry as any),
    makeCard: (entry) => makeCard(entry as ProfessionalCore, (entry as any)?.user ?? null),
    initialVariant: props.initialVariant,
  })

const isDev = import.meta.dev
</script>
