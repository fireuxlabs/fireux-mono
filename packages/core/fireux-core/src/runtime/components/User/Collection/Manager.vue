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
              :aria-label="searchPlaceholder"
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

            <UBadge v-if="showCount && isSettled" variant="soft"
              >{{ countLabel }}</UBadge
            >
          </div>
        </div>
      </div>
    </template>

    <MoleculesStateCard
      v-if="outcome === 'pending'"
      entity="people"
      state="loading"
      surface="bare"
    />

    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="people"
      state="error"
      surface="bare"
      description="Public profiles are not available right now."
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

    <MoleculesStateCard
      v-else
      entity="people"
      state="empty"
      surface="bare"
      :title="query ? 'No people match your search' : 'No people yet'"
      :description="query
        ? 'Try a different search term.'
        : 'Public profiles will appear here once they are available.'"
    />

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
import { useFetch } from '#imports'
import { computed } from 'vue'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'
import { useUserInterface } from '../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { useCollectionSearch } from '../../../composables/shared/useCollectionSearch'
import {
  UserModel,
  type User,
} from '../../../models/core/user.model'

type PublicUserDto = {
  id: string
  handle: string
  displayName: string
  avatar: string
  bio: string
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
    title: 'People',
    description: 'Browse public profiles available to this runtime.',
    link: true,
    searchPlaceholder: 'Search people…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    showBadges: true,
    initialVariant: 'cell',
  }
)

// Public index family: this manager uses the server projection so raw identity
// fields such as email/admin arrays never become public browse data.
const fetched = useFetch<PublicUsersResponse>('/api/public/users', {
  key: 'public-users-index',
  query: { limit: 200 },
})
const { user: currentUser } = useUser()
const liveSelfUser = computed<PublicUserDto | null>(() => {
  const user = currentUser.value
  if (!user) return null

  const handle = String(user.handle || '').trim().toLowerCase()
  if (!handle) return null

  const visibility = String((user as any).visibility || '').trim().toLowerCase()
  if (visibility === 'private') return null

  const displayName =
    String(user.display_name || '').trim() ||
    `@${handle}`
  const bio = String(user.bio || '').trim()
  const avatar = String(user.avatar || '').trim()

  return {
    id: String(user.id || '').trim(),
    handle,
    displayName,
    avatar,
    bio,
    profiles: Array.isArray(user.profiles) ? user.profiles : [],
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
    avatar: user.avatar,
    handle: user.handle,
    email: '',
    bio: user.bio,
    profiles: Array.isArray(user.profiles) ? user.profiles : [],
    projects: [],
    userOf: [],
    adminOf: [],
    notifications: [],
  }))
)
const title = computed(() => String(props.title || 'People'))
const description = computed(() =>
  String(props.description || 'Browse public profiles available to this runtime.')
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search people…')
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
const devJsonContext = 'collection manager · users · public projection'
const devJsonData = computed(() => ({
  objects: {
    users: publicUsers.value,
  },
  derived: {
    source: '/api/public/users',
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
