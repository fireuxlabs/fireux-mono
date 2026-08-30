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

        <span v-if="showCount" class="entity-collection__count">
          {{ countLabel }}
        </span>
      </template>
    </CollectionHeader>

    <UserCollectionList v-if="cardsFiltered.length" :cards="cardsFiltered" />
  </section>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain collection retained.
import { computed } from 'vue'
import { useUserInterface } from '../composables/useUserInterface'
import { useCollectionSearch } from '../../composables/shared/useCollectionSearch'
import type { User } from '../models/user.model.ts'

const props = defineProps<{
  users: User[]
}>()

const collection = computed<User[]>(() => props.users)
const title = 'Users'
const description = 'Open a user profile to see where someone contributes.'
const searchPlaceholder = 'Search users…'
const showCount = true
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(() => totalCount.value > 15)
const { interface: makeCard } = useUserInterface()

const { query, visibleItems, visibleCount } = useCollectionSearch<
  User,
  NonNullable<ReturnType<typeof makeCard>>
>({
  items: collection,
  makeCard: (user) => makeCard(user),
  initialVariant: 'cell',
})

const cardsFiltered = computed(() =>
  visibleItems.value
    .map((user) => makeCard(user))
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
)

const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} of ${totalCount.value} users`
    : `${totalCount.value} user${totalCount.value === 1 ? '' : 's'}`
)
</script>
