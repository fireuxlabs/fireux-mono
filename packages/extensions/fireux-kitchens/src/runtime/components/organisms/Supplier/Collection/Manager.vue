<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>{{ title }}</div>
          <p>{{ description }}</p>
        </div>

        <div class="collection-manager__controls flex flex-1 items-center gap-2">
          <div class="flex items-center gap-2">
            <slot name="controls" />
          </div>
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
      v-if="cardsRenderable.length"
      :cards="cardsRenderable"
      :variant="variant"
    >
      <template #pill="{ card }">
        <div
          class="block rounded-lg transition"
          :class="[
            linkEnabled && card.to ? 'cursor-pointer' : 'cursor-default',
            selectedId === card.id ? 'ring-2 ring-primary/60 p-1' : '',
          ]"
          @click="openCard(card)"
        >
          <SupplierCardsPill
            :to="card.to"
            :title="card.title"
            :subtitle="card.subtitle"
            :avatar-url="card.avatarUrl"
            :link="false"
          />
        </div>
      </template>
      <template #cell="{ card }">
        <div
          class="block rounded-lg transition"
          :class="[
            linkEnabled && card.to ? 'cursor-pointer' : 'cursor-default',
            selectedId === card.id ? 'ring-2 ring-primary/60 p-1' : '',
          ]"
          @click="openCard(card)"
        >
          <SupplierCardsCell
            :id="card.id"
            :name="card.name"
            :subtitle="card.subtitle"
            :avatar-url="card.avatarUrl"
          />
        </div>
      </template>
    </SupplierCollectionList>

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No suppliers match your search.' : 'No suppliers found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Suppliers (JSON)'"
        context="collection manager · suppliers"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed } from 'vue'
import {
    useSupplierInterface,
    type SupplierCard,
    type SupplierSurface,
} from '../../../../composables/fireux/firestore/profiles/Supplier/utils/view/useSupplierInterface'
import SupplierCardsCell from '../Cards/Cell.vue'
import SupplierCardsPill from '../Cards/Pill.vue'
import SupplierCollectionList from './List.vue'

type SupplierCollectionEntry = SupplierSurface

const props = withDefaults(
  defineProps<{
    collection?: SupplierCollectionEntry[]
    title?: string
    description?: string
    link?: boolean
    selectedId?: string | null
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
  }>(),
  {
    title: 'Suppliers',
    description: 'Browse suppliers for this runtime.',
    link: true,
    searchPlaceholder: 'Search suppliers...',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const emit = defineEmits<{
  (event: 'select', supplierId: string): void
}>()

const { card: makeCard, searchText } = useSupplierInterface()

const collection = computed(() => props.collection ?? [])
const linkEnabled = computed(() => props.link !== false)
const selectedId = computed(() => String(props.selectedId || '').trim())
const searchPlaceholder = computed(() => String(props.searchPlaceholder || 'Search suppliers...'))
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(() => showSearch.value && totalCount.value > 15)
const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<SupplierCollectionEntry, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (supplier: SupplierCollectionEntry) => searchText(supplier),
  makeCard: (supplier: SupplierCollectionEntry) => makeCard(supplier),
  initialVariant: props.initialVariant,
})

const fallbackCards = computed<SupplierCard.Card[]>(() =>
  (collection.value ?? [])
    .map((supplier, index) => {
      const row = supplier as Record<string, unknown>
      const id = String(row.id || row.supplier_id || `supplier-${index + 1}`).trim()
      if (!id) return null

      const profileId = String(row.supplier_id || row.source_supplier_id || id).trim()
      const name = String(row.name || row.short_name || profileId || id).trim()
      const category = String(row.category || row.business_type || '').trim()
      const avatarUrl = String(row.image_url || row.logo_url || row.avatar_url || '').trim()

      return {
        id: profileId || id,
        to: profileId ? `/suppliers/${encodeURIComponent(profileId)}` : '',
        title: name,
        subtitle: category,
        name,
        category,
        avatarUrl,
      } satisfies SupplierCard.Card
    })
    .filter((card): card is SupplierCard.Card => Boolean(card))
)

const cardsRenderable = computed<SupplierCard.Card[]>(() => {
  if (cardsFiltered.value.length) return cardsFiltered.value as SupplierCard.Card[]
  if (query.value.trim()) return []
  return fallbackCards.value
})
const isDev = import.meta.dev

const openCard = (card: SupplierCard.Card) => {
  const supplierId = String(card?.id || '').trim()
  if (supplierId) {
    emit('select', selectedId.value === supplierId ? '' : supplierId)
  }

  if (!linkEnabled.value) return
  const to = String(card?.to || '').trim()
  if (!to) return
  navigateTo(to)
}
</script>
