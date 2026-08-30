<template>
  <section class="entity-collection user-collection">
    <CollectionHeader :title="title" :description="description">
      <template #controls>
        <UInput
          v-if="showSearchInput"
          v-model="query"
          :placeholder="searchPlaceholder"
          :aria-label="searchPlaceholder"
          icon="i-lucide-search"
          class="entity-collection__search"
        />

        <UButton
          v-if="showVariantToggle"
          size="sm"
          color="neutral"
          variant="ghost"
          :icon="variant === 'pill' ? 'i-lucide-layout-grid' : 'i-lucide-list'"
          :aria-label="
            variant === 'pill'
              ? 'Switch to card view'
              : 'Switch to compact view'
          "
          @click="toggleVariant"
        />

        <span v-if="showCount" class="entity-collection__count">
          {{ countLabel }}
        </span>
      </template>
    </CollectionHeader>

    <UserCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <UserCardsPill
          v-bind="card"
          :link="linkEnabled"
          :show-badges="showBadges"
        />
      </template>
      <template #cell="{ card }">
        <UserCardsCell
          v-bind="card"
          :link="linkEnabled"
          :show-badges="showBadges"
        />
      </template>
    </UserCollectionList>
  </section>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain collection retained.
import { computed } from 'vue'
import { useUserInterface } from '../composables/useUserInterface'
import { useCollectionSearch } from '../../composables/shared/useCollectionSearch'
import { useCollectionVariantCards } from '../../composables/shared/useCollectionVariantCards'
import type { User } from '../models/user.model.ts'

const props = withDefaults(
  defineProps<{
    users: User[]
    title?: string
    description?: string
    link?: boolean
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    showBadges?: boolean
    initialVariant?: 'pill' | 'cell'
  }>(),
  {
    title: 'Users',
    description: 'Open a user profile to see where someone contributes.',
    link: true,
    searchPlaceholder: 'Search users…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    showBadges: true,
    initialVariant: 'cell',
  }
)

const collection = computed<User[]>(() => props.users)
const title = computed(() => String(props.title || 'Users'))
const description = computed(() =>
  String(
    props.description || 'Open a user profile to see where someone contributes.'
  )
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search users…')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const showBadges = computed(() => props.showBadges !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useUserInterface()

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<User, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (user) => makeCard(user),
    initialVariant: props.initialVariant,
  })

const { cards: cardsFiltered } = useCollectionVariantCards({
  items: visibleItems,
  variant,
  makeCard,
  makePill,
  makeCell,
})

const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} of ${totalCount.value} users`
    : `${totalCount.value} user${totalCount.value === 1 ? '' : 's'}`
)
</script>
