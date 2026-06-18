<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
        </div>

        <div
          class="collection-manager__controls flex flex-1 items-center gap-2"
        >
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

            <UBadge v-if="showCount" variant="soft"
              >{{ countLabel }}</UBadge
            >
          </div>
        </div>
      </div>
    </template>

    <UserCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <UserCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <UserCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </UserCollectionList>

    <p v-else>
      {{ query ? 'No users match your search.' : 'No users found.' }}
    </p>

    <div>
      <DevJson
        :title="'Users (JSON)'"
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
import { useUserCollection } from '../../../composables/fireux/firestore/core/user/fetch/useUserCollection'
import { useUserInterface } from '../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { useCollectionSearch } from '../../../composables/shared/useCollectionSearch'
import type { User } from '../../../models/core/user.model'

const props = withDefaults(
  defineProps<{
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
    title: 'Users',
    description: 'Browse users available to this runtime.',
    link: true,
    searchPlaceholder: 'Search users…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const fetched = useUserCollection()
const collection = computed<User[]>(() => fetched.users.value)
const { devJsonData } = useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Users'))
const description = computed(() =>
  String(props.description || 'Browse users available to this runtime.')
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search users…')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
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

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((user) => {
      if (variant.value === 'cell') {
        const base = makeCard(user)
        const cell = makeCell(user)
        if (!base || !cell) return null
        return { ...base, ...cell }
      }

      return makePill(user)
    })
    .filter((card): card is NonNullable<ReturnType<typeof makeCard>> =>
      Boolean(card)
    )
)

const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)
const devJsonContext = 'collection manager · users · root: users'
</script>
