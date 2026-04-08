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

    <SupplierCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <SupplierCardsPill
          v-bind="card"
          :link="linkEnabled"
          :action="actionEnabled"
          :show-badges="showBadges"
          @action="emit('select', card.id)"
        />
      </template>
      <template #cell="{ card }">
        <SupplierCardsCell
          v-bind="card"
          :link="linkEnabled"
          :action="actionEnabled"
          :show-badges="showBadges"
          @action="emit('select', card.id)"
        />
      </template>
    </SupplierCollectionList>

    <p v-else>{{ query ? 'No suppliers match your search.' : 'No suppliers found.' }}</p>

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
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import type { Supplier } from '../../../../models/supplier/Supplier.model';
import { useSupplierInterface } from '../../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface';

type SupplierEntry = Supplier & { user?: unknown }

const props = withDefaults(
  defineProps<{
    collection?: SupplierEntry[]
    title?: string
    description?: string
    link?: boolean
    action?: boolean
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
    title: 'Suppliers',
    description: 'Browse supplier records available to this runtime.',
    link: true,
    action: false,
    showBadges: true,
    searchPlaceholder: 'Search suppliers…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
    devJsonTitle: 'Suppliers (JSON)',
    devJsonContext: 'collection manager · suppliers',
  }
)

const emit = defineEmits<{
  (event: 'select', supplierId: string): void
}>()

const collection = computed(() => props.collection ?? [])
const { devJsonData } = useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Suppliers'))
const description = computed(
  () => String(props.description || 'Browse supplier records available to this runtime.')
)
const linkEnabled = computed(() => props.link !== false)
const actionEnabled = computed(() => props.action === true)
const showBadges = computed(() => props.showBadges !== false)
const searchPlaceholder = computed(() => String(props.searchPlaceholder || 'Search suppliers…'))
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(() => showSearch.value && totalCount.value > 15)
const devJsonTitle = computed(() => String(props.devJsonTitle || 'Suppliers (JSON)').trim())
const devJsonContext = computed(() => String(props.devJsonContext || 'collection manager · suppliers').trim())
const { interface: makeCard, searchText } = useSupplierInterface()
const { query, variant, toggleVariant, cards: cardsFiltered, visibleCount } =
  useCollectionSearch<SupplierEntry, ReturnType<typeof makeCard>>({
    items: collection,
    searchText: (entry) => searchText(entry as Supplier),
    makeCard: (entry) => makeCard(entry as Supplier, (entry as any)?.user ?? null),
    initialVariant: props.initialVariant,
  })

const isDev = import.meta.dev
</script>
