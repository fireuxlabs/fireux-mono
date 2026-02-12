<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>{{ title }}</div>
          <p>{{ description }}</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search menus..."
          />
          <span class="text-[11px] text-dimmed">service</span>
          <USelect
            v-model="serviceFilter"
            size="xs"
            :options="serviceOptions"
          />
          <span class="text-[11px] text-dimmed">status</span>
          <USelect
            v-model="statusFilter"
            size="xs"
            :options="statusOptions"
          />
          <span class="text-[11px] text-dimmed">sort</span>
          <USelect
            v-model="sortBy"
            size="xs"
            :options="sortOptions"
          />
          <UButton
            size="xs"
            variant="ghost"
            :icon="variant === 'pill' ? 'i-lucide-list' : 'i-lucide-layout-grid'"
            :aria-label="variant === 'pill' ? 'Switch to list view' : 'Switch to grid view'"
            @click="toggleVariant"
          />
          <UBadge variant="soft">{{ visibleCount }} / {{ filteredCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <MenuCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <UPopover :popper="{ placement: 'right-start' }">
          <template #default>
            <NuxtLink
              :to="card.to || undefined"
              class="block"
              :class="card.to ? '' : 'cursor-pointer'"
            >
              <MenuCardsPill v-bind="card" />
            </NuxtLink>
          </template>
          <template #content>
            <div class="w-[20rem] p-3">
              <MenuCardsPreview v-if="previewById[card.id]" v-bind="previewById[card.id]" />
            </div>
          </template>
        </UPopover>
      </template>

      <template #cell="{ card }">
        <UPopover :popper="{ placement: 'right-start' }">
          <template #default>
            <NuxtLink
              :to="card.to || undefined"
              class="block"
              :class="card.to ? '' : 'cursor-pointer'"
            >
              <MenuCardsCell v-bind="card" :prop="card.description" />
            </NuxtLink>
          </template>
          <template #content>
            <div class="w-[20rem] p-3">
              <MenuCardsPreview v-if="previewById[card.id]" v-bind="previewById[card.id]" />
            </div>
          </template>
        </UPopover>
      </template>
    </MenuCollectionList>

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No menus match your search.' : 'No menus found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Menus (JSON)'"
        context="collection manager · menus"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import MenuCardsCell from '../Cards/Cell.vue'
import MenuCardsPill from '../Cards/Pill.vue'
import MenuCardsPreview from '../Cards/Preview.vue'
import MenuCollectionList from './List.vue'
import { useMenuInterface } from '../../../../composables/fireux/firestore/menu/utils/view/useMenuInterface'
import type { KitchenMenu } from '../../../../models/menu.model'

const props = withDefaults(
  defineProps<{
    collection?: KitchenMenu[]
    title?: string
    description?: string
  }>(),
  {
    title: 'Menus',
    description: 'Browse menus for this kitchen.',
  }
)

const { card: makeCard, preview: makePreview, searchText } = useMenuInterface()

const collection = computed(() => props.collection ?? [])
const totalCount = computed(() => collection.value.length)
const serviceFilter = ref('all')
const statusFilter = ref('all')
const sortBy = ref('sort-order')
const nowTick = ref(Date.now())
let tickInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  tickInterval = setInterval(() => {
    nowTick.value = Date.now()
  }, 60000)
})

onBeforeUnmount(() => {
  if (!tickInterval) return
  clearInterval(tickInterval)
  tickInterval = null
})

const serviceOptions = computed(() => {
  const values = Array.from(
    new Set(
      collection.value
        .map((menu) => String(menu.service || '').trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b))
  return ['all', ...values]
})

const statusOptions = computed(() => {
  const values = Array.from(
    new Set(
      collection.value
        .map((menu) => String(menu.status || '').trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b))
  return ['all', ...values]
})

const sortOptions = ['sort-order', 'name', 'service', 'dishes']

const collectionOrganized = computed(() => {
  // Recompute cards periodically so active/inactive menu chips follow time windows.
  void nowTick.value

  let result = [...collection.value]

  if (serviceFilter.value !== 'all') {
    result = result.filter((menu) => String(menu.service || '').trim() === serviceFilter.value)
  }

  if (statusFilter.value !== 'all') {
    result = result.filter((menu) => String(menu.status || '').trim() === statusFilter.value)
  }

  result.sort((a, b) => {
    if (sortBy.value === 'name') {
      return String(a.name || '').localeCompare(String(b.name || ''))
    }

    if (sortBy.value === 'service') {
      return String(a.service || '').localeCompare(String(b.service || ''))
    }

    if (sortBy.value === 'dishes') {
      return Number((b.dish_ids ?? []).length) - Number((a.dish_ids ?? []).length)
    }

    return (
      Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
      String(a.name || '').localeCompare(String(b.name || ''))
    )
  })

  return result
})

const filteredCount = computed(() => collectionOrganized.value.length)

const previewById = computed(() => {
  const map: Record<string, ReturnType<typeof makePreview> | null> = {}
  for (const menu of collectionOrganized.value) {
    const card = makeCard(menu)
    if (!card?.id) continue
    map[card.id] = makePreview(menu)
  }
  return map
})

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<KitchenMenu, ReturnType<typeof makeCard>>({
  items: collectionOrganized,
  searchText: (menu: KitchenMenu) => searchText(menu),
  makeCard: (menu: KitchenMenu) => makeCard(menu),
})
const isDev = import.meta.dev
</script>
