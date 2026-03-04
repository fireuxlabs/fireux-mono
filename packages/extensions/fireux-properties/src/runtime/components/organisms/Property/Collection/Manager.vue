<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>{{ title }}</div>
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
            <UBadge v-if="showCount" variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
          </div>
        </div>
      </div>
    </template>

    <div v-if="cards.length" class="space-y-3">
      <div
        v-for="item in cards"
        :key="item.id"
        class="rounded border border-default p-3"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-start gap-3">
            <UAvatar
              :src="item.imageUrl"
              :alt="item.title"
              size="lg"
              class="shrink-0 rounded"
            />

            <div class="min-w-0 space-y-1">
              <div class="truncate text-sm font-semibold">{{ item.title }}</div>
              <div class="truncate text-xs text-dimmed">{{ item.subtitle }}</div>
              <div class="truncate text-xs text-dimmed">{{ item.meta }}</div>
            </div>
          </div>

          <UButton
            v-if="linkEnabled"
            size="xs"
            variant="ghost"
            :to="item.to"
            icon="i-lucide-external-link"
          >
            Open
          </UButton>
        </div>
      </div>
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="query ? 'No properties match your search' : 'No properties found'"
      description="Add property records to this portfolio to unlock compliance, documents, and tasks context."
    />

    <div v-if="isDev">
      <DevJson
        :title="'Properties (JSON)'"
        context="collection manager · properties"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed } from 'vue'
import { usePropertyInterface } from '../../../../composables/fireux/firestore/property/utils/view/usePropertyInterface'
import type { Property } from '../../../../models/property.model'

const props = withDefaults(
  defineProps<{
    collection?: Property[]
    title?: string
    description?: string
    searchPlaceholder?: string
    showSearch?: boolean
    showCount?: boolean
    link?: boolean
  }>(),
  {
    title: 'Properties',
    description: 'Portfolio-scoped properties.',
    searchPlaceholder: 'Search properties...',
    showSearch: true,
    showCount: true,
    link: true,
  }
)

const { card: makeCard, searchText } = usePropertyInterface()

const collection = computed(() => props.collection ?? [])
const searchPlaceholder = computed(() => String(props.searchPlaceholder || 'Search properties...'))
const showSearch = computed(() => props.showSearch !== false)
const showCount = computed(() => props.showCount !== false)
const linkEnabled = computed(() => props.link !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(() => showSearch.value && totalCount.value > 15)

const { query, cards, visibleCount } = useCollectionSearch<Property, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (property: Property) => searchText(property),
  makeCard: (property: Property) => makeCard(property),
})

const title = computed(() => String(props.title || 'Properties'))
const description = computed(() => String(props.description || '').trim())
const isDev = import.meta.dev
</script>
