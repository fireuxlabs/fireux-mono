<template>
  <section class="entity-collection user-collection" aria-label="Users">
    <div>
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
    </div>

    <UserCollectionList v-if="filteredUsers.length" :users="filteredUsers" />
    <div v-else role="status">
      <p>
        {{ hasMore ? 'No matches in loaded users' : 'No matching people' }}
      </p>
      <p>
        {{
          hasMore
            ? 'Load more users below or try another name.'
            : 'Try another name or handle.'
        }}
      </p>
      <UButton
        v-if="query"
        label="Clear search"
        variant="soft"
        color="neutral"
        @click="query = ''"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain collection retained.
import { computed } from 'vue'
import { useUserView } from '../../composables/useUserView'
import { useCollectionSearch } from '../../../composables/shared/useCollectionSearch'
import type { User } from '../../models/user.model.ts'

const props = defineProps<{
  users: User[]
  hasMore?: boolean
}>()

const collection = computed<User[]>(() => props.users)
const searchPlaceholder = computed(() =>
  props.hasMore ? 'Filter loaded users…' : 'Search users…'
)
const showCount = true
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(() => totalCount.value > 15)
const { toView } = useUserView()

const { query, visibleItems, visibleCount } = useCollectionSearch<
  User,
  NonNullable<ReturnType<typeof toView>>
>({
  items: collection,
  makeCard: toView,
  searchText: (user) => [user.display_name, user.handle, user.bio].join(' '),
  initialVariant: 'cell',
})

const filteredUsers = visibleItems

const countLabel = computed(
  () =>
    (showSearchInput.value && query.value
      ? `${visibleCount.value} of ${totalCount.value} users`
      : `${totalCount.value} user${totalCount.value === 1 ? '' : 's'}`) +
    (props.hasMore ? ' loaded' : '')
)
</script>
