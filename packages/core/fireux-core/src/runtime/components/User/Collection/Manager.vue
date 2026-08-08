<template>
  <section class="collection-directory user-directory">
    <CollectionDirectoryHeader :title="title" :description="description">
      <template #controls>
        <UInput
          v-if="showSearchInput"
          v-model="query"
          :placeholder="searchPlaceholder"
          :aria-label="searchPlaceholder"
          icon="i-lucide-search"
          class="collection-directory__search"
        />

        <UButton
          v-if="showVariantToggle"
          size="sm"
          color="neutral"
          variant="ghost"
          :icon="
            variant === 'pill' ? 'i-lucide-layout-grid' : 'i-lucide-list'
          "
          :aria-label="
            variant === 'pill'
              ? 'Switch to card view'
              : 'Switch to compact view'
          "
          @click="toggleVariant"
        />

        <span v-if="showCount && isSettled" class="collection-directory__count">
          {{ countLabel }}
        </span>
      </template>
    </CollectionDirectoryHeader>

    <CollectionDirectoryState
      v-if="outcome === 'pending'"
      title="Loading users"
      description="Finding users…"
      icon="i-lucide-loader-circle"
      loading
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-atomic="true"
    />

    <CollectionDirectoryState
      v-else-if="outcome === 'error'"
      title="Users unavailable"
      description="Users are not available right now."
      icon="i-lucide-triangle-alert"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    />

    <UserCollectionList
      v-else-if="cardsFiltered.length"
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

    <CollectionDirectoryState
      v-else
      icon="i-lucide-users-round"
      :title="query ? 'No matching users' : 'No users yet'"
      :description="query
        ? 'Try a different search term.'
        : 'Users will appear here once they are available.'"
    />

    <div>
      <DevJson
        :title="'Users (JSON)'"
        :context="devJsonContext"
        :data="devJsonData"
        :default-open="false"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
// Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: carry public biography through directory cards and live-self hydration.
import { useFetch } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'
import { useUser } from '../../../composables/fireux/user/useUser'
import { useUserInterface } from '../../../composables/fireux/user/useUserInterface'
import { useCollectionSearch } from '../../../composables/shared/useCollectionSearch'
import { useCollectionVariantCards } from '../../../composables/shared/useCollectionVariantCards'
import {
  UserModel,
  type User,
} from '../../../models/core/user.model'

type PublicUserDto = {
  id: string
  handle: string
  displayName: string
  bio: string
  avatar: string
  apps: string[]
  profiles: string[]
  path: string
  isPublic: boolean
}

type PublicUsersResponse = {
  ok: true
  count: number
  items: PublicUserDto[]
  users: PublicUserDto[]
}

type UserCollectionOutcome = 'pending' | 'error' | 'empty' | 'ready'

const props = withDefaults(
  defineProps<{
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

// Public index family: the server projection owns the browse DTO and prevents
// private sibling records from entering the public surface.
const { appId, isTenant } = useFireUXConfig()
const fetched = useFetch<PublicUsersResponse>('/api/public/users', {
  key: `public-users-index-${isTenant ? appId : 'global'}`,
  query: { limit: 200 },
})
const {
  user: currentUser,
  appUser,
  appOutcome,
} = useUser()
const liveSelfUser = computed<PublicUserDto | null>(() => {
  const user = currentUser.value
  if (!user) return null
  if (
    isTenant &&
    (appOutcome.value !== 'ready' || !appUser.value)
  ) {
    return null
  }

  const handle = String(user.handle || '').trim().toLowerCase()
  if (!handle) return null

  const displayName =
    String(user.display_name || '').trim() ||
    `@${handle}`
  const avatar = String(user.avatar || '').trim()

  return {
    id: String(user.id || '').trim(),
    handle,
    displayName,
    bio: String(user.bio || '').trim(),
    avatar,
    apps: [],
    profiles: [],
    path: `/users/${encodeURIComponent(handle)}`,
    isPublic: true,
  }
})
const fetchedPublicUsers = computed<PublicUserDto[]>(() => {
  const payload = fetched.data.value
  return Array.isArray(payload?.users)
    ? payload.users
    : Array.isArray(payload?.items)
      ? payload.items
      : []
})
const publicUsers = computed<PublicUserDto[]>(() => {
  const merged = [...fetchedPublicUsers.value]
  const live = liveSelfUser.value
  if (!live) return merged

  const index = merged.findIndex(
    (entry) => entry.id === live.id || entry.handle === live.handle
  )
  if (index >= 0) {
    merged[index] = { ...merged[index], ...live }
    return merged
  }

  return [live, ...merged]
})
const collection = computed<User[]>(() =>
  publicUsers.value.map((user) => ({
    ...UserModel,
    id: user.id,
    display_name: user.displayName,
    bio: user.bio,
    avatar: user.avatar,
    handle: user.handle,
  }))
)
const title = computed(() => String(props.title || 'Users'))
const description = computed(() =>
  String(props.description || 'Open a user profile to see where someone contributes.')
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
const outcome = computed<UserCollectionOutcome>(() => {
  if (fetched.pending.value) return 'pending'
  if (fetched.error.value) return 'error'
  return totalCount.value > 0 ? 'ready' : 'empty'
})
const isSettled = computed(() =>
  outcome.value === 'ready' || outcome.value === 'empty'
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
const devJsonContext = 'collection manager · users · public projection'
const devJsonData = computed(() => ({
  objects: {
    users: publicUsers.value,
  },
  derived: {
    source: '/api/public/users',
    scope: isTenant ? `app:${appId}` : 'global',
    count: publicUsers.value.length,
    visibleCount: visibleCount.value,
    variant: variant.value,
    query: query.value,
    link: linkEnabled.value,
    pending: fetched.pending.value,
    hasError: Boolean(fetched.error.value),
  },
}))
</script>
