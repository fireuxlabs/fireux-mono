<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
        </div>

        <div class="collection-manager__controls flex items-center gap-2">
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

    <ProfilesChefCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <NuxtLink
          :to="linkEnabled ? card.to : undefined"
          class="block"
          :class="linkEnabled ? '' : 'cursor-default'"
        >
          <ProfilesChefCardsPill v-bind="card" />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink
          :to="linkEnabled ? card.to : undefined"
          class="block"
          :class="linkEnabled ? '' : 'cursor-default'"
        >
          <ProfilesChefCardsCell v-bind="card" />
        </NuxtLink>
      </template>
    </ProfilesChefCollectionList>

    <p v-else>{{ query ? 'No chefs match your search.' : 'No chefs found.' }}</p>

    <div v-if="isDev">
      <DevJson
        :title="'Chefs (JSON)'"
        context="collection manager · chefs"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import { useChef } from '../../../../../composables/fireux/firestore/profiles/Chef/useChef';
import type { ChefCore } from '../../../../../models/profiles/Chef/Chef.model';

type ChefEntry = ChefCore & { user?: unknown }

const props = withDefaults(
  defineProps<{
    collection?: ChefEntry[]
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
    title: 'Chefs',
    description: 'Browse chefs available to this runtime.',
    link: true,
    searchPlaceholder: 'Search chefs…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const collection = computed(() => props.collection ?? [])
const title = computed(() => String(props.title || 'Chefs'))
const description = computed(
  () => String(props.description || 'Browse chefs available to this runtime.')
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() => String(props.searchPlaceholder || 'Search chefs…'))
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(() => showSearch.value && totalCount.value > 15)
const { card: makeCard } = useChef()
const { query, variant, toggleVariant, cards: cardsFiltered, visibleCount } =
  useCollectionSearch<ChefEntry, ReturnType<typeof makeCard>>({
    items: collection,
    searchText: (entry) => {
      const card = makeCard(entry as ChefCore, (entry as any)?.user ?? null)
      return card?.displayName.trim().toLowerCase() ?? ''
    },
    makeCard: (entry) => makeCard(entry as ChefCore, (entry as any)?.user ?? null),
    initialVariant: props.initialVariant,
  })

const isDev = import.meta.dev
</script>
